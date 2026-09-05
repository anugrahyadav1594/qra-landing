"""Feedback API — §10.

Flow: spam screen → Turnstile (anonymous) → strict validation → rate limits
(per IP, per category) → fingerprint dedupe (24h) → insert + consent.
"""

from __future__ import annotations

from datetime import timedelta

from fastapi import APIRouter, Body, Depends, HTTPException, Request, Response
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..config import Settings
from ..deps import apply_buckets, get_session
from ..errors import raise_422
from ..models import ConsentRecord, Feedback
from ..rate_limit import Bucket
from ..schemas import FeedbackIn, FeedbackOut
from ..spam import SpamScreen, verify_turnstile
from ..utils import client_ip, ip_hash, sha256_hex, user_agent_summary, utcnow, uuid7

router = APIRouter(prefix="/api/v1", tags=["feedback"])

DROPPED_RESPONSE = {"screened": True, "status": "dropped"}


@router.post("/feedback")
def submit_feedback(
    body: dict = Body(...),
    request: Request = None,
    response: Response = None,
    session: Session = Depends(get_session),
):
    settings: Settings = request.app.state.settings
    request_id = getattr(request.state, "request_id", "")

    # 1. Spam screen — honeypot / too-fast submissions are silently dropped.
    if SpamScreen(settings).is_screened(body):
        response.status_code = 200
        return DROPPED_RESPONSE

    # 2. Strict validation.
    try:
        data = FeedbackIn.model_validate(body)
    except ValidationError as exc:
        raise_422(exc, request_id)

    # 3. Turnstile is required for anonymous submissions when configured.
    #    (Authed users would be exempt with a higher budget — §10.3.)
    if not verify_turnstile(settings, data.turnstile_token):
        raise HTTPException(status_code=403, detail={
            "error": {"code": "turnstile_failed",
                      "message": "Bot check failed. Please retry.",
                      "request_id": request_id}})

    # 4. Rate limits (§10.1) — per IP and per abuse-prone category.
    ip = client_ip(request, settings.trust_proxy)
    now = utcnow()
    buckets = [
        Bucket(key=f"fb:ip:min:{ip}", limit=settings.feedback_per_ip_per_minute, window_seconds=60),
        Bucket(key=f"fb:ip:day:{ip}", limit=settings.feedback_per_ip_per_day, window_seconds=86400),
    ]
    if data.category == "security":
        buckets.append(Bucket(
            key=f"fb:sec:ip:day:{ip}",
            limit=settings.feedback_security_category_per_ip_per_day,
            window_seconds=86400))
    headers, _ = apply_buckets(request, buckets)
    for name, value in headers.items():
        response.headers[name] = value

    # 5. Fingerprint dedupe within the window (§10.2) → duplicate: true.
    fingerprint = sha256_hex(
        f"{data.category}|{data.message.lower()}|{data.contact_email or ''}")
    cutoff = now - timedelta(hours=settings.feedback_dedupe_window_hours)
    prior = session.execute(
        select(Feedback).where(
            Feedback.fingerprint == fingerprint,
            Feedback.created_at >= cutoff,
        )
    ).scalars().first()
    if prior is not None:
        response.status_code = 200
        return FeedbackOut(id=prior.id, status=prior.status, duplicate=True).model_dump()

    # 6. Insert feedback + consent row.
    consent = ConsentRecord(
        id=uuid7(), email_normalized=data.contact_email, purpose="feedback",
        granted=True, policy_version=settings.policy_version,
        source_page=data.page_slug, created_at=now,
    )
    session.add(consent)
    session.flush()

    entry = Feedback(
        id=uuid7(),
        ip_hash=ip_hash(ip),
        user_agent_summary=user_agent_summary(request.headers.get("user-agent")),
        category=data.category,
        message=data.message,
        rating=data.rating,
        page_slug=data.page_slug,
        url=data.url,
        contact_name=data.contact_name,
        contact_email=data.contact_email,
        status="new",
        fingerprint=fingerprint,
        consent_id=consent.id,
        created_at=now,
    )
    session.add(entry)
    session.commit()

    response.status_code = 201
    return FeedbackOut(id=entry.id, status="new", duplicate=False).model_dump()
