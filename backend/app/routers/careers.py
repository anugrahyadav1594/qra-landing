"""Careers API — public postings + application flow (§6.1, §13.3).

Resume upload: PDF only in v1 (§14.4), size-capped by MAX_RESUME_SIZE_MB,
stored under a server-generated key (never a client-supplied name).
"""

from __future__ import annotations

import os
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, Response, UploadFile
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..config import Settings
from ..deps import apply_buckets, get_session
from ..models import ConsentRecord, File as FileRow, JobApplication, JobPosting
from ..rate_limit import Bucket
from ..schemas import validate_phone
from ..spam import SpamScreen, verify_turnstile
from ..utils import client_ip, is_disposable_email, normalize_email, utcnow, uuid7

router = APIRouter(prefix="/api/v1/careers", tags=["careers"])

ALLOWED_RESUME_MIME = ("application/pdf",)


def _posting_dict(p: JobPosting) -> dict:
    return {
        "id": p.id,
        "slug": p.slug,
        "title": p.title,
        "department": p.department,
        "location_type": p.location_type,
        "location": p.location,
        "employment_type": p.employment_type,
        "description_md": p.description_md,
        "requirements_md": p.requirements_md,
        "compensation_range": p.compensation_range,
        "status": p.status,
    }


@router.get("")
def list_postings(request: Request, session: Session = Depends(get_session)):
    settings: Settings = request.app.state.settings
    apply_buckets(request, [Bucket(
        key=f"pubread:{client_ip(request, settings.trust_proxy)}",
        limit=settings.public_read_per_ip_per_minute, window_seconds=60)])
    postings = session.execute(
        select(JobPosting).where(JobPosting.status == "open").order_by(JobPosting.created_at)
    ).scalars().all()
    return {"postings": [_posting_dict(p) for p in postings]}


@router.get("/{slug}")
def get_posting(slug: str, request: Request, session: Session = Depends(get_session)):
    settings: Settings = request.app.state.settings
    apply_buckets(request, [Bucket(
        key=f"pubread:{client_ip(request, settings.trust_proxy)}",
        limit=settings.public_read_per_ip_per_minute, window_seconds=60)])
    posting = session.execute(
        select(JobPosting).where(JobPosting.slug == slug, JobPosting.status == "open")
    ).scalar_one_or_none()
    if posting is None:
        raise HTTPException(status_code=404, detail={"error": {
            "code": "not_found", "message": "Job posting not found.",
            "request_id": getattr(request.state, "request_id", "")}})
    return _posting_dict(posting)


@router.post("/{slug}/apply")
def apply_to_posting(
    slug: str,
    request: Request,
    response: Response,
    session: Session = Depends(get_session),
    name: str = Form(...),
    email: str = Form(...),
    phone: str | None = Form(None),
    cover_note: str | None = Form(None),
    consent_careers: bool = Form(False),
    turnstile_token: str | None = Form(None),
    honeypot: str | None = Form(None),
    client_ts: int | None = Form(None),
    resume: UploadFile = File(...),
):
    settings: Settings = request.app.state.settings
    request_id = getattr(request.state, "request_id", "")
    body = {
        settings.honeypot_field_name: honeypot,
        "client_ts": client_ts,
    }

    # 1. Spam screen.
    if SpamScreen(settings).is_screened(body):
        response.status_code = 200
        return {"screened": True, "status": "dropped"}

    # 2. Turnstile (when configured).
    if not verify_turnstile(settings, turnstile_token):
        raise HTTPException(status_code=403, detail={
            "error": {"code": "turnstile_failed",
                      "message": "Bot check failed. Please retry.",
                      "request_id": request_id}})

    # 3. Rate limit — CAREERS_APPLY_PER_IP_PER_HOUR (.env).
    ip = client_ip(request, settings.trust_proxy)
    apply_buckets(request, [Bucket(
        key=f"careers:ip:hour:{ip}",
        limit=settings.careers_apply_per_ip_per_hour,
        window_seconds=3600)])

    # 4. Posting must exist and be open.
    posting = session.execute(
        select(JobPosting).where(JobPosting.slug == slug)).scalar_one_or_none()
    if posting is None:
        raise HTTPException(status_code=404, detail={
            "error": {"code": "not_found", "message": "Job posting not found.",
                      "request_id": request_id}})
    if posting.status != "open":
        raise HTTPException(status_code=422, detail={
            "error": {"code": "posting_closed",
                      "message": "This position is no longer open.",
                      "request_id": request_id}})

    # 5. Contact details.
    email_norm = normalize_email(email)
    if email_norm is None:
        raise HTTPException(status_code=422, detail={
            "error": {"code": "invalid_email", "message": "Enter a valid email address.",
                      "request_id": request_id}})
    if settings.block_disposable_emails and is_disposable_email(
            email_norm, settings.disposable_domains_extra_list):
        raise HTTPException(status_code=422, detail={
            "error": {"code": "disposable_email",
                      "message": "Please use a personal email address.",
                      "request_id": request_id}})
    try:
        phone_norm = validate_phone(phone)
    except ValueError:
        raise HTTPException(status_code=422, detail={
            "error": {"code": "invalid_phone", "message": "Enter a valid phone number.",
                      "request_id": request_id}})
    if not consent_careers:
        raise HTTPException(status_code=422, detail={
            "error": {"code": "consent_required",
                      "message": "Consent to process your application is required.",
                      "request_id": request_id}})
    if cover_note is not None and len(cover_note) > settings.max_cover_note_chars:
        raise HTTPException(status_code=422, detail={
            "error": {"code": "cover_note_too_long",
                      "message": f"Cover note must be at most {settings.max_cover_note_chars} characters.",
                      "request_id": request_id}})

    # 6. Resume: size cap + MIME allowlist (§14.4), server-generated key.
    if resume.content_type not in ALLOWED_RESUME_MIME:
        raise HTTPException(status_code=422, detail={
            "error": {"code": "resume_type_not_allowed",
                      "message": "Resume must be a PDF.",
                      "request_id": request_id}})
    max_bytes = settings.max_resume_size_mb * 1024 * 1024
    chunks = []
    size = 0
    while True:
        chunk = resume.file.read(1024 * 1024)
        if not chunk:
            break
        size += len(chunk)
        if size > max_bytes:
            raise HTTPException(status_code=413, detail={
                "error": {"code": "file_too_large",
                          "message": f"Resume exceeds the {settings.max_resume_size_mb} MB limit.",
                          "request_id": request_id}})
        chunks.append(chunk)
    if size == 0:
        raise HTTPException(status_code=422, detail={
            "error": {"code": "empty_resume", "message": "Resume file is empty.",
                      "request_id": request_id}})

    # 7. Store the file + insert application + consent.
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    now = utcnow()
    file_id = uuid7()
    storage_key = f"cv/{now:%Y}/{now:%m}/{file_id}.pdf"
    (upload_dir / f"{file_id}.pdf").write_bytes(b"".join(chunks))

    try:
        consent = ConsentRecord(
            id=uuid7(), email_normalized=email_norm, purpose="careers",
            granted=True, policy_version=settings.policy_version,
            source_page=f"careers/{slug}", created_at=now)
        session.add(consent)
        session.flush()

        file_row = FileRow(
            id=file_id, purpose="cv", original_name=os.path.basename(resume.filename or "resume.pdf"),
            storage_key=storage_key, mime=resume.content_type, size_bytes=size,
            scan_status="not_required", created_at=now)
        session.add(file_row)
        session.flush()

        application = JobApplication(
            id=uuid7(), job_posting_id=posting.id, name=name[:200],
            email_normalized=email_norm, phone_e164=phone_norm,
            cover_note=cover_note, resume_file_id=file_row.id,
            status="received", consent_id=consent.id, created_at=now)
        session.add(application)
        session.commit()
    except IntegrityError:
        # Duplicate application — one per person per posting (§8.2).
        session.rollback()
        try:
            (upload_dir / f"{file_id}.pdf").unlink(missing_ok=True)
        except OSError:
            pass
        raise HTTPException(status_code=409, detail={
            "error": {"code": "duplicate_application",
                      "message": "You have already applied to this position.",
                      "request_id": request_id}})

    response.status_code = 201
    return {"application_id": application.id, "status": "received"}
