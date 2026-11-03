"""
Participant endpoints — an individual registers themselves, selects one
onboarded college, and can then review only their own entry.
"""

from __future__ import annotations

import json
from datetime import timedelta

from fastapi import APIRouter, Body, Depends, HTTPException, Request, Response
from pydantic import ValidationError
from sqlalchemy.orm import Session

from ...deps import apply_buckets, get_session
from ...errors import raise_422
from ...models import IdempotencyKey
from ...rate_limit import Bucket
from ...spam import SpamScreen, verify_turnstile
from ...utils import client_ip, utcnow
from ..deps import get_settings, get_tournament
from ..models import Participant, Tournament, TournamentConfig
from ..schemas import (
    RegistrationAcceptedOut,
    RegistrationIn,
    RegistrationUpdateIn,
)
from ..security import require_verified_participant
from ..service import find_registration, register, registration_out, update_own_registration

router = APIRouter(prefix="/api/v1/tournament", tags=["tournament-participant"])


@router.post("/register", status_code=201)
def create_registration(
    body: dict = Body(...),
    request: Request = None,
    response: Response = None,
    session: Session = Depends(get_session),
    tournament_and_config: tuple[Tournament, TournamentConfig] = Depends(get_tournament),
    participant: Participant = Depends(require_verified_participant),
):
    """Submit an individual entry.

    Order: spam screen → strict validation → Turnstile → rate limits →
    idempotency replay → business validation → transactional insert.
    """
    settings = get_settings(request)
    request_id = getattr(request.state, "request_id", "")
    tournament, config = tournament_and_config

    if SpamScreen(settings).is_screened(body) or body.get("honeypot"):
        response.status_code = 200
        return {"screened": True, "status": "dropped"}

    try:
        data = RegistrationIn.model_validate(body)
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
                key=f"mtt:reg:ip:{ip}",
                limit=settings.mtt_registrations_per_ip_per_hour,
                window_seconds=3600,
            ),
            Bucket(
                key=f"mtt:reg:email:{participant.email_normalized}",
                limit=settings.mtt_registrations_per_email_per_day,
                window_seconds=86400,
            ),
        ],
    )
    for name, value in headers.items():
        response.headers[name] = value

    idempotency_key = request.headers.get("idempotency-key")
    now = utcnow()
    if idempotency_key:
        stored = session.get(IdempotencyKey, idempotency_key)
        if stored is not None:
            if now - stored.created_at < timedelta(hours=settings.idempotency_key_ttl_hours):
                response.status_code = 201
                return json.loads(stored.response_json)
            session.delete(stored)
            session.commit()

    payload_data = data.model_dump()
    registration, already = register(
        session,
        settings,
        request,
        tournament=tournament,
        cfg=config,
        participant=participant,
        data=payload_data,
    )

    outbound = RegistrationAcceptedOut(
        registration=registration,
        already_registered=already,
        message=(
            "You are already registered."
            if already
            else "Registration received. Welcome to the arena."
        ),
    ).model_dump()

    if idempotency_key and not already:
        session.add(
            IdempotencyKey(
                key=idempotency_key,
                response_json=json.dumps(outbound),
                created_at=utcnow(),
            )
        )
        session.commit()

    if already:
        response.status_code = 200
    return outbound


@router.get("/me")
def me(
    request: Request,
    participant: Participant = Depends(require_verified_participant),
):
    return {
        "participant": {
            "id": participant.id,
            "email": participant.email_normalized,
            "email_verified": participant.email_verified_at is not None,
            "full_name": participant.full_name,
            "is_admin": participant.is_admin,
        }
    }


@router.get("/me/registration")
def my_registration(
    request: Request,
    session: Session = Depends(get_session),
    tournament_and_config: tuple[Tournament, TournamentConfig] = Depends(get_tournament),
    participant: Participant = Depends(require_verified_participant),
):
    """A participant only ever sees their own registration."""
    tournament, config = tournament_and_config
    registration = find_registration(session, tournament.id, participant.id)
    return {
        "registration": registration_out(session, registration).model_dump()
        if registration
        else None,
        "config": {
            "registrations_open": config.registrations_open,
            "leaderboard_enabled": config.leaderboard_enabled,
            "name": tournament.name,
        },
    }


@router.patch("/me/registration")
def update_my_registration(
    body: dict = Body(...),
    request: Request = None,
    session: Session = Depends(get_session),
    tournament_and_config: tuple[Tournament, TournamentConfig] = Depends(get_tournament),
    participant: Participant = Depends(require_verified_participant),
):
    settings = get_settings(request)
    request_id = getattr(request.state, "request_id", "")
    tournament, _ = tournament_and_config

    try:
        data = RegistrationUpdateIn.model_validate(body)
    except ValidationError as exc:
        raise_422(exc, request_id)

    registration = find_registration(session, tournament.id, participant.id)
    if registration is None:
        raise HTTPException(
            status_code=404,
            detail={
                "error": {
                    "code": "registration_not_found",
                    "message": "No registration found for this account.",
                    "request_id": request_id,
                }
            },
        )

    updated = update_own_registration(
        session,
        settings,
        request,
        registration=registration,
        data=data.model_dump(exclude_none=True),
        actor_email=participant.email_normalized,
    )
    return updated.model_dump()


__all__ = ["router"]
