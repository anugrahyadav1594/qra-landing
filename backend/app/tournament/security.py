"""
Tournament identity, sessions and authorization.

Authentication is passwordless by design:

  * built-in flow  — a six-digit one-time code emailed to the participant;
    a successful exchange mints an opaque, httpOnly, server-side session.
  * Clerk flow     — when ``CLERK_ISSUER``/``CLERK_JWKS_URL`` are configured
    the frontend's Clerk JWT is verified (RS256, issuer + audience) and the
    participant is matched/linked by verified email.

No passwords are ever stored by this platform. Authorization for the admin
console is enforced here — never by hiding UI.
"""

from __future__ import annotations

import hashlib
import hmac
import json
import logging
import secrets
import threading
import time
from datetime import timedelta

from fastapi import Depends, HTTPException, Request, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..config import Settings
from ..deps import get_session
from ..utils import client_ip, ip_hash, normalize_email, user_agent_summary, utcnow, uuid7
from .models import AdminRole, OtpCode, Participant, Session as SessionModel

logger = logging.getLogger("qra.tournament")

JWT_CACHE_TTL_SECONDS = 3600
_jwks_cache: dict[str, tuple[float, dict]] = {}
_jwks_lock = threading.Lock()


# ── Helpers ──────────────────────────────────────────────────────────────


def hash_token(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def new_session_token() -> str:
    return secrets.token_urlsafe(32)


def new_otp_code(length: int) -> str:
    # Avoid leading zeros so codes are unambiguous when read aloud.
    first = secrets.choice("123456789")
    rest = "".join(secrets.choice("0123456789") for _ in range(max(0, length - 1)))
    return first + rest


def registration_public_id() -> str:
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # no I/O/0/1
    body = "".join(secrets.choice(alphabet) for _ in range(6))
    return f"MTT-{body}"


def _request_id(request: Request) -> str:
    return getattr(request.state, "request_id", "")


def http_error(status: int, code: str, message: str, request: Request) -> HTTPException:
    return HTTPException(
        status_code=status,
        detail={"error": {"code": code, "message": message, "request_id": _request_id(request)}},
    )


# ── Session resolution ───────────────────────────────────────────────────


def resolve_clerk_email(settings: Settings, token: str) -> str | None:
    """Verify a Clerk session JWT. Returns the verified email, or None.

    Requires `pyjwt[crypto]`; raises a clear 503 when Clerk is configured
    but the dependency is missing, so a misconfigured deployment never
    silently accepts an unverified token.
    """
    if not token:
        return None
    try:
        import jwt  # type: ignore
        from jwt import PyJWKClient  # type: ignore
    except ImportError as exc:  # pragma: no cover - depends on install
        raise RuntimeError(
            "Clerk is configured but PyJWT is not installed. "
            "Run: pip install 'pyjwt[crypto]'"
        ) from exc

    now = time.time()
    with _jwks_lock:
        cached = _jwks_cache.get(settings.clerk_jwks_url)
    if not cached or now - cached[0] > JWT_CACHE_TTL_SECONDS:
        client = PyJWKClient(settings.clerk_jwks_url, cache_keys=True)
        signing_key = client.get_signing_key_from_jwt(token).key
        with _jwks_lock:
            _jwks_cache[settings.clerk_jwks_url] = (now, {"key": signing_key})
    else:
        signing_key = cached[1]["key"]

    options = {"verify_aud": bool(settings.clerk_audience)}
    claims = jwt.decode(
        token,
        signing_key,
        algorithms=["RS256"],
        issuer=settings.clerk_issuer or None,
        audience=settings.clerk_audience or None,
        options=options,
    )
    email = None
    for key in ("email", "primary_email_address"):
        value = claims.get(key)
        if isinstance(value, str):
            email = value
            break
    if not email:
        # Clerk v2 templates expose primary_email in a nested claim.
        for identifier in claims.get("email_addresses") or []:
            if isinstance(identifier, dict) and identifier.get("email_address"):
                email = identifier["email_address"]
                break
    return normalize_email(email) if email else None


def current_participant(
    request: Request, session: Session = Depends(get_session)
) -> Participant | None:
    """Best-effort identity resolution (cookie session, then Clerk JWT)."""
    settings: Settings = request.app.state.settings
    token = request.cookies.get(settings.mtt_session_cookie_name)
    now = utcnow()

    if token:
        record = session.execute(
            select(SessionModel).where(SessionModel.token_hash == hash_token(token))
        ).scalar_one_or_none()
        if record and record.revoked_at is None and record.expires_at > now:
            participant = session.get(Participant, record.participant_id)
            if participant is not None:
                request.state.mtt_session_id = record.id
                return participant

    if settings.clerk_enabled:
        header = request.headers.get("authorization", "")
        if header.lower().startswith("bearer "):
            try:
                email = resolve_clerk_email(settings, header.split(" ", 1)[1].strip())
            except Exception as exc:
                logger.warning("Clerk token verification failed: %s", exc)
                raise http_error(401, "invalid_token", "Sign-in could not be verified.", request)
            if email:
                participant = session.execute(
                    select(Participant).where(Participant.email_normalized == email)
                ).scalar_one_or_none()
                if participant is None:
                    participant = Participant(
                        id=uuid7(),
                        email_normalized=email,
                        email_verified_at=now,
                        auth_provider="clerk",
                    )
                    session.add(participant)
                    session.flush()
                    sync_admin_roles(session, settings)
                return participant
    return None


def require_participant(
    request: Request, session: Session = Depends(get_session)
) -> Participant:
    participant = current_participant(request, session)
    if participant is None:
        raise http_error(401, "auth_required", "Sign in to continue.", request)
    return participant


def require_verified_participant(
    request: Request, session: Session = Depends(get_session)
) -> Participant:
    participant = require_participant(request, session)
    if participant.email_verified_at is None:
        raise http_error(
            403,
            "email_verification_required",
            "Verify your email address to continue.",
            request,
        )
    return participant


def is_admin(participant: Participant, settings: Settings, session: Session) -> bool:
    if participant.is_admin:
        return True
    if participant.email_normalized in settings.tournament_admin_email_list:
        return True
    role = session.execute(
        select(AdminRole).where(AdminRole.participant_id == participant.id)
    ).scalar_one_or_none()
    return role is not None


def require_admin(
    request: Request,
    session: Session = Depends(get_session),
    participant: Participant = Depends(require_participant),
) -> Participant:
    settings: Settings = request.app.state.settings
    if not is_admin(participant, settings, session):
        raise http_error(
            403, "admin_required", "Administrator access is required.", request
        )
    return participant


def sync_admin_roles(session: Session, settings: Settings) -> int:
    """Persist the env allow-list into the DB and keep `is_admin` in sync."""
    granted = 0
    for email in settings.tournament_admin_email_list:
        participant = session.execute(
            select(Participant).where(Participant.email_normalized == email)
        ).scalar_one_or_none()
        if participant is None:
            continue
        role = session.execute(
            select(AdminRole).where(AdminRole.participant_id == participant.id)
        ).scalar_one_or_none()
        if role is None:
            session.add(
                AdminRole(
                    id=uuid7(),
                    participant_id=participant.id,
                    email_normalized=email,
                    role="admin",
                    granted_by="env:TOURNAMENT_ADMIN_EMAILS",
                )
            )
            granted += 1
        if not participant.is_admin:
            participant.is_admin = True
    if granted:
        session.flush()
    return granted


# ── Sessions ─────────────────────────────────────────────────────────────


def create_session(
    settings: Settings,
    session: Session,
    participant: Participant,
    request: Request,
    response: Response,
) -> SessionModel:
    token = new_session_token()
    expires = utcnow() + timedelta(hours=settings.mtt_session_ttl_hours)
    record = SessionModel(
        id=uuid7(),
        participant_id=participant.id,
        token_hash=hash_token(token),
        expires_at=expires,
        ip_hash=ip_hash(client_ip(request, settings.trust_proxy)),
        user_agent_summary=user_agent_summary(request.headers.get("user-agent")),
    )
    session.add(record)
    session.flush()

    response.set_cookie(
        key=settings.mtt_session_cookie_name,
        value=token,
        max_age=int(settings.mtt_session_ttl_hours * 3600),
        expires=int(settings.mtt_session_ttl_hours * 3600),
        httponly=True,
        secure=settings.session_cookie_secure,
        samesite="lax",
        path="/",
    )
    return record


def destroy_session(settings: Settings, session: Session, request: Request, response: Response) -> None:
    token = request.cookies.get(settings.mtt_session_cookie_name)
    if token:
        record = session.execute(
            select(SessionModel).where(SessionModel.token_hash == hash_token(token))
        ).scalar_one_or_none()
        if record and record.revoked_at is None:
            record.revoked_at = utcnow()
            session.flush()
    response.delete_cookie(settings.mtt_session_cookie_name, path="/")


# ── One-time codes ───────────────────────────────────────────────────────


def issue_otp(
    settings: Settings,
    session: Session,
    email: str,
    request: Request,
    purpose: str = "signin",
) -> OtpCode:
    code = new_otp_code(settings.mtt_otp_length)
    record = OtpCode(
        id=uuid7(),
        email_normalized=email,
        code_hash=hash_token(f"{email}:{code}:{purpose}"),
        purpose=purpose,
        expires_at=utcnow() + timedelta(minutes=settings.mtt_otp_ttl_minutes),
        ip_hash=ip_hash(client_ip(request, settings.trust_proxy)),
    )
    session.add(record)
    session.flush()
    record._plain_code = code  # type: ignore[attr-defined]  # transient, never persisted
    return record


def verify_otp(
    settings: Settings,
    session: Session,
    email: str,
    code: str,
    purpose: str = "signin",
) -> OtpCode | None:
    now = utcnow()
    record = (
        session.execute(
            select(OtpCode)
            .where(
                OtpCode.email_normalized == email,
                OtpCode.purpose == purpose,
                OtpCode.consumed_at.is_(None),
            )
            .order_by(OtpCode.created_at.desc())
        )
        .scalars()
        .first()
    )
    if record is None:
        return None
    if record.expires_at < now:
        return None
    if record.attempts >= settings.mtt_otp_max_attempts:
        return None
    expected = record.code_hash
    supplied = hash_token(f"{email}:{code}:{purpose}")
    if not hmac.compare_digest(expected, supplied):
        record.attempts += 1
        session.flush()
        return None
    record.consumed_at = now
    session.flush()
    return record


def purge_expired(session: Session) -> None:
    """Housekeeping: drop expired codes and sessions (cheap, idempotent)."""
    now = utcnow()
    session.query(OtpCode).filter(OtpCode.expires_at < now).delete(
        synchronize_session=False
    )
    session.query(SessionModel).filter(SessionModel.expires_at < now).delete(
        synchronize_session=False
    )
    session.flush()


def audit(
    session: Session,
    *,
    action: str,
    entity: str,
    entity_id: str | None = None,
    actor_email: str | None = None,
    actor_participant_id: str | None = None,
    detail: dict | None = None,
    request: Request | None = None,
    settings: Settings | None = None,
) -> None:
    from .models import AuditLog

    iph = None
    if request is not None and settings is not None:
        iph = ip_hash(client_ip(request, settings.trust_proxy))
    session.add(
        AuditLog(
            id=uuid7(),
            actor_email=actor_email,
            actor_participant_id=actor_participant_id,
            action=action,
            entity=entity,
            entity_id=entity_id,
            detail_json=json.dumps(detail, default=str) if detail else None,
            ip_hash=iph,
        )
    )


__all__ = [
    "audit",
    "create_session",
    "current_participant",
    "destroy_session",
    "hash_token",
    "is_admin",
    "issue_otp",
    "purge_expired",
    "registration_public_id",
    "require_admin",
    "require_participant",
    "require_verified_participant",
    "resolve_clerk_email",
    "sync_admin_roles",
    "verify_otp",
]