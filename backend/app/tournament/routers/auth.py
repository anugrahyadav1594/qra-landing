"""
Passwordless identity for the tournament.

  POST /api/v1/tournament/auth/otp/request   send a one-time code
  POST /api/v1/tournament/auth/otp/verify    exchange it for a session
  POST /api/v1/tournament/auth/logout        revoke the session
  GET  /api/v1/tournament/auth/session       current identity + registration

When Clerk is configured (``CLERK_ISSUER`` + ``CLERK_JWKS_URL``) the frontend
sends its Clerk JWT as ``Authorization: Bearer …`` instead; the same
``/auth/session`` endpoint resolves it.
"""

from __future__ import annotations

from fastapi import APIRouter, Body, Depends, HTTPException, Request, Response
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.orm import Session

from ...deps import apply_buckets, get_session
from ...errors import raise_422
from ...rate_limit import Bucket
from ...spam import verify_turnstile
from ...utils import client_ip, utcnow, uuid7
from ..deps import get_settings, get_tournament
from ..models import Participant
from ..schemas import OtpRequestIn, OtpVerifyIn, ParticipantOut, SessionOut
from ..security import (
    create_session,
    current_participant,
    destroy_session,
    issue_otp,
    purge_expired,
    sync_admin_roles,
    verify_otp,
)
from .. import notifications
from ..service import find_registration, registration_out

router = APIRouter(prefix="/api/v1/tournament/auth", tags=["tournament-auth"])


@router.post("/otp/request")
def request_code(
    body: dict = Body(...),
    request: Request = None,
    response: Response = None,
    session: Session = Depends(get_session),
):
    settings = get_settings(request)
    request_id = getattr(request.state, "request_id", "")

    try:
        data = OtpRequestIn.model_validate(body)
    except ValidationError as exc:
        raise_422(exc, request_id)

    if not verify_turnstile(settings, data.turnstile_token):
        raise HTTPException(
            status_code=403,
            detail={
                "error": {
                    "code": "turnstile_failed",
                    "message": "Bot check failed. Please retry.",
                    "request_id": request_id,
                }
            },
        )

    ip = client_ip(request, settings.trust_proxy)
    headers, _ = apply_buckets(
        request,
        [
            Bucket(
                key=f"mtt:otp:email:{data.email}",
                limit=settings.mtt_otp_requests_per_email_per_hour,
                window_seconds=3600,
            ),
            Bucket(
                key=f"mtt:otp:ip:{ip}",
                limit=settings.mtt_otp_requests_per_ip_per_hour,
                window_seconds=3600,
            ),
        ],
    )
    for name, value in headers.items():
        response.headers[name] = value

    code_row = issue_otp(settings, session, data.email, request)
    session.commit()

    result = notifications.send_one_time_code(
        settings, data.email, getattr(code_row, "_plain_code", "")
    )

    payload = {
        "sent": True,
        "email": data.email,
        "expires_in_minutes": settings.mtt_otp_ttl_minutes,
        "delivery": result.provider,
    }
    # Dev-only escape hatch so the journey can be completed without SMTP.
    if settings.expose_otp:
        payload["dev_code"] = getattr(code_row, "_plain_code", "")
    return payload


@router.post("/otp/verify")
def verify_code(
    body: dict = Body(...),
    request: Request = None,
    response: Response = None,
    session: Session = Depends(get_session),
):
    settings = get_settings(request)
    request_id = getattr(request.state, "request_id", "")

    try:
        data = OtpVerifyIn.model_validate(body)
    except ValidationError as exc:
        raise_422(exc, request_id)

    record = verify_otp(settings, session, data.email, data.code)
    if record is None:
        raise HTTPException(
            status_code=422,
            detail={
                "error": {
                    "code": "invalid_code",
                    "message": "That code is not valid or has expired. Request a new one.",
                    "request_id": request_id,
                }
            },
        )

    participant = session.execute(
        select(Participant).where(Participant.email_normalized == data.email)
    ).scalar_one_or_none()
    now = utcnow()
    if participant is None:
        participant = Participant(
            id=uuid7(),
            email_normalized=data.email,
            email_verified_at=now,
            auth_provider="otp",
        )
        session.add(participant)
        session.flush()
    else:
        participant.email_verified_at = participant.email_verified_at or now
        session.flush()

    sync_admin_roles(session, settings)
    create_session(settings, session, participant, request, response)
    purge_expired(session)
    session.commit()

    return {
        "signed_in": True,
        "participant": ParticipantOut(
            id=participant.id,
            email=participant.email_normalized,
            email_verified=participant.email_verified_at is not None,
            full_name=participant.full_name,
            is_admin=participant.is_admin,
        ).model_dump(),
    }


@router.post("/logout")
def logout(
    request: Request,
    response: Response,
    session: Session = Depends(get_session),
):
    settings = get_settings(request)
    destroy_session(settings, session, request, response)
    session.commit()
    return {"signed_in": False}


@router.get("/session")
def session_state(
    request: Request,
    response: Response,
    session: Session = Depends(get_session),
    tournament_and_config=Depends(get_tournament),
):
    settings = get_settings(request)
    participant = current_participant(request, session)
    if participant is None:
        return SessionOut(
            signed_in=False,
            participant=None,
            registration=None,
            auth_provider="clerk" if settings.clerk_enabled else "otp",
        ).model_dump()

    tournament, _ = tournament_and_config
    registration = find_registration(session, tournament.id, participant.id)
    return SessionOut(
        signed_in=True,
        participant=ParticipantOut(
            id=participant.id,
            email=participant.email_normalized,
            email_verified=participant.email_verified_at is not None,
            full_name=participant.full_name,
            is_admin=participant.is_admin,
        ),
        registration=registration_out(session, registration) if registration else None,
        auth_provider=participant.auth_provider,
    ).model_dump()


__all__ = ["router"]