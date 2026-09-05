"""Waitlist API — §9.

Flow: spam screen → Turnstile (when configured) → validation → rate limits
(per IP / per email / per product, all .env-tunable) → idempotency →
dedupe (partial-unique backstop) → insert entry + consent in one txn.
"""

from __future__ import annotations

import json
from datetime import timedelta

from fastapi import APIRouter, Body, Depends, HTTPException, Request, Response
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..config import Settings
from ..deps import apply_buckets, get_session
from ..errors import raise_422
from ..models import ConsentRecord, IdempotencyKey, Product, WaitlistEntry
from ..rate_limit import Bucket
from ..schemas import WaitlistIn, WaitlistOut
from ..spam import SpamScreen, verify_turnstile
from ..utils import (
    client_ip, ip_hash, is_disposable_email, normalize_email, user_agent_summary,
    utcnow, uuid7,
)

router = APIRouter(prefix="/api/v1", tags=["waitlist"])

DROPPED_RESPONSE = {"screened": True, "status": "dropped"}


def _source_page(referer: str | None) -> str | None:
    if not referer:
        return None
    return referer.split("?")[0][:200]


@router.post("/waitlist")
def join_waitlist(
    body: dict = Body(...),
    request: Request = None,
    response: Response = None,
    session: Session = Depends(get_session),
):
    settings: Settings = request.app.state.settings
    request_id = getattr(request.state, "request_id", "")

    # 1. Spam screen — honeypot / too-fast submissions are silently dropped (§10.3).
    if SpamScreen(settings).is_screened(body):
        response.status_code = 200
        return DROPPED_RESPONSE

    # 2. Strict validation (unknown keys rejected, §15.3).
    try:
        data = WaitlistIn.model_validate(body)
    except ValidationError as exc:
        raise_422(exc, request_id)

    # 3. Turnstile (server-side verification; skipped when no secret is set).
    if not verify_turnstile(settings, data.turnstile_token):
        raise HTTPException(status_code=403, detail={
            "error": {"code": "turnstile_failed",
                      "message": "Bot check failed. Please retry.",
                      "request_id": request_id}})

    # 4. Business validation: product must exist and accept waitlist signups.
    product = None
    if data.product_id:
        product = session.get(Product, data.product_id)
    elif data.slug:
        product = session.execute(
            select(Product).where(Product.slug == data.slug)).scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=422, detail={
            "error": {"code": "product_not_found",
                      "message": "Select a valid product.",
                      "request_id": request_id}})
    if not product.accepts_waitlist or product.status not in ("live", "waitlist_only"):
        raise HTTPException(status_code=422, detail={
            "error": {"code": "product_not_accepting",
                      "message": "This product is not accepting waitlist signups.",
                      "request_id": request_id}})

    # 5. Email hygiene: normalization + disposable-domain block (§9.4).
    email = normalize_email(data.email)
    if email is None:
        raise HTTPException(status_code=422, detail={
            "error": {"code": "invalid_email",
                      "message": "Enter a valid email address.",
                      "request_id": request_id}})
    if settings.block_disposable_emails and is_disposable_email(
            email, settings.disposable_domains_extra_list):
        raise HTTPException(status_code=422, detail={
            "error": {"code": "disposable_email",
                      "message": "Please use a personal email address.",
                      "request_id": request_id}})

    # 6. Consent (§16.3): waitlist_contact is required; marketing is optional.
    if not data.consent_waitlist_contact:
        raise HTTPException(status_code=422, detail={
            "error": {"code": "consent_required",
                      "message": "Consent to waitlist contact is required.",
                      "request_id": request_id}})

    # 7. Rate limits (§9.7) — every number comes from settings (.env).
    ip = client_ip(request, settings.trust_proxy)
    now = utcnow()
    headers, _ = apply_buckets(request, [
        Bucket(key=f"wl:ip:hour:{ip}", limit=settings.waitlist_per_ip_per_hour, window_seconds=3600),
        Bucket(key=f"wl:ip:min:{ip}", limit=settings.waitlist_per_ip_per_minute, window_seconds=60),
        Bucket(key=f"wl:email:day:{email}", limit=settings.waitlist_per_email_per_day, window_seconds=86400),
        Bucket(key=f"wl:email:hour:{email}", limit=settings.waitlist_per_email_per_hour, window_seconds=3600),
        Bucket(key=f"wl:product:day:{product.id}", limit=settings.waitlist_per_product_per_day, window_seconds=86400),
    ])
    for name, value in headers.items():
        response.headers[name] = value

    # 8. Total capacity guard (MAX_WAITLIST_ENTRIES from .env).
    total = session.query(WaitlistEntry).count()
    if total >= settings.max_waitlist_entries:
        raise HTTPException(status_code=422, detail={
            "error": {"code": "waitlist_full",
                      "message": "The waitlist is at capacity right now.",
                      "request_id": request_id}})

    # 9. Idempotency (§9.5): replay the stored response for a known key.
    idempotency_key = request.headers.get("idempotency-key")
    if idempotency_key:
        stored = session.get(IdempotencyKey, idempotency_key)
        if stored is not None:
            if now - stored.created_at < timedelta(hours=settings.idempotency_key_ttl_hours):
                response.status_code = 201
                return json.loads(stored.response_json)
            session.delete(stored)
            session.commit()

    # 10. Insert entry + consent in one transaction; the partial-unique
    #     index is the authoritative dedupe backstop (§9.4).
    try:
        consent = ConsentRecord(
            id=uuid7(), email_normalized=email, purpose="waitlist_contact",
            granted=True, policy_version=settings.policy_version,
            source_page=_source_page(request.headers.get("referer")), created_at=now,
        )
        session.add(consent)
        session.flush()

        entry = WaitlistEntry(
            id=uuid7(), product_id=product.id, email_normalized=email,
            referral_code=data.referral_code,
            source_json=json.dumps(data.source.model_dump(exclude_none=True)) if data.source else None,
            ip_hash=ip_hash(ip),
            user_agent_summary=user_agent_summary(request.headers.get("user-agent")),
            status="registered", consent_id=consent.id, created_at=now, updated_at=now,
        )
        session.add(entry)
        session.commit()
        payload = WaitlistOut(
            entry_id=entry.id, product_id=product.id, status="registered",
            already_present=False).model_dump()
        response.status_code = 201
    except IntegrityError:
        session.rollback()
        existing = session.execute(
            select(WaitlistEntry).where(
                WaitlistEntry.product_id == product.id,
                WaitlistEntry.email_normalized == email,
            )
        ).scalar_one_or_none()
        if existing is None:
            raise
        payload = WaitlistOut(
            entry_id=existing.id, product_id=product.id, status=existing.status,
            already_present=True).model_dump()
        response.status_code = 200

    # 11. Remember the response for idempotent replays (§9.5).
    if idempotency_key:
        session.add(IdempotencyKey(
            key=idempotency_key, response_json=json.dumps(payload), created_at=utcnow()))
        session.commit()

    return payload
