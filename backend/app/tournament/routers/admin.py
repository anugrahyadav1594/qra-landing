"""
Tournament administration.

Every route in this module is protected by ``require_admin`` — authorization
is enforced on the server, never by hiding links in the UI. Every mutation
writes an audit-log row with the acting administrator's verified email.
"""

from __future__ import annotations

from fastapi import APIRouter, Body, Depends, HTTPException, Query, Request, UploadFile, File
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ...deps import get_session
from ...errors import raise_422
from ...utils import utcnow, uuid7
from ..deps import get_settings, get_tournament
from ..models import (
    Announcement,
    College,
    LeaderboardEntry,
    Participant,
    Registration,
    Sponsor,
    Tournament,
    TournamentConfig,
)
from ..schemas import (
    AdminOverviewOut,
    AnnouncementIn,
    AnnouncementUpdateIn,
    AuditLogOut,
    CollegeIn,
    CollegeUpdateIn,
    LeaderboardEntryIn,
    RegistrationStatusIn,
    SponsorIn,
    SponsorUpdateIn,
    TournamentConfigOut,
    TournamentConfigUpdateIn,
    UploadOut,
)
from ..security import audit, require_admin
from ..service import (
    admin_list_registrations,
    admin_overview,
    admin_set_status,
    announcement_out,
    audit_rows,
    college_out,
    config_out,
    registrations_csv,
    save_logo,
    sponsor_out,
    update_config,
)

router = APIRouter(prefix="/api/v1/admin/tournament", tags=["tournament-admin"])


def _error(request: Request, status: int, code: str, message: str) -> HTTPException:
    return HTTPException(
        status_code=status,
        detail={
            "error": {
                "code": code,
                "message": message,
                "request_id": getattr(request.state, "request_id", ""),
            }
        },
    )


def _load_or_404(session: Session, model, entity_id: str, request: Request, label: str):
    row = session.get(model, entity_id)
    if row is None:
        raise _error(request, 404, "not_found", f"{label} not found.")
    return row


# ── A. Overview ──────────────────────────────────────────────────────────


@router.get("/overview", response_model=AdminOverviewOut)
def overview(
    request: Request,
    session: Session = Depends(get_session),
    tournament_and_config: tuple[Tournament, TournamentConfig] = Depends(get_tournament),
    admin: Participant = Depends(require_admin),
):
    tournament, config = tournament_and_config
    return admin_overview(session, tournament, config)


# ── B. Registrations ─────────────────────────────────────────────────────


@router.get("/registrations")
def list_registrations(
    request: Request,
    q: str | None = Query(default=None, max_length=120),
    college_id: str | None = Query(default=None, max_length=36),
    status: str | None = Query(default=None, max_length=32),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    session: Session = Depends(get_session),
    tournament_and_config: tuple[Tournament, TournamentConfig] = Depends(get_tournament),
    admin: Participant = Depends(require_admin),
):
    tournament, _ = tournament_and_config
    rows, total = admin_list_registrations(
        session,
        tournament.id,
        query=q,
        college_id=college_id,
        status=status,
        limit=limit,
        offset=offset,
    )
    return {
        "registrations": [row.model_dump() for row in rows],
        "total": total,
        "limit": limit,
        "offset": offset,
    }


@router.get("/registrations/export.csv")
def export_registrations(
    request: Request,
    college_id: str | None = Query(default=None, max_length=36),
    status: str | None = Query(default=None, max_length=32),
    session: Session = Depends(get_session),
    tournament_and_config: tuple[Tournament, TournamentConfig] = Depends(get_tournament),
    admin: Participant = Depends(require_admin),
):
    """CSV export of participant data (optionally grouped by college)."""
    from fastapi.responses import Response

    tournament, _ = tournament_and_config
    rows, _total = admin_list_registrations(
        session, tournament.id, college_id=college_id, status=status, limit=10000, offset=0
    )
    csv_body = registrations_csv(rows)
    audit(
        session,
        action="registrations.export",
        entity="registration",
        actor_email=admin.email_normalized,
        actor_participant_id=admin.id,
        detail={"rows": len(rows), "college_id": college_id, "status": status},
        request=request,
        settings=get_settings(request),
    )
    session.commit()
    return Response(
        content=csv_body,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": 'attachment; filename="mtt-registrations.csv"'},
    )


@router.patch("/registrations/{registration_id}")
def update_registration_status(
    registration_id: str,
    body: dict = Body(...),
    request: Request = None,
    session: Session = Depends(get_session),
    tournament_and_config: tuple[Tournament, TournamentConfig] = Depends(get_tournament),
    admin: Participant = Depends(require_admin),
):
    settings = get_settings(request)
    request_id = getattr(request.state, "request_id", "")
    tournament, _ = tournament_and_config
    try:
        data = RegistrationStatusIn.model_validate(body)
    except ValidationError as exc:
        raise_422(exc, request_id)

    registration = _load_or_404(session, Registration, registration_id, request, "Registration")
    if registration.tournament_id != tournament.id:
        raise _error(request, 404, "not_found", "Registration not found.")

    updated = admin_set_status(
        session,
        settings,
        request,
        registration=registration,
        status=data.status,
        note=data.status_note,
        actor_email=admin.email_normalized,
    )
    # reviewed_by is an internal field — it is added for administrators only,
    # never for the participant-facing serialization.
    return {**updated.model_dump(), "reviewed_by": registration.reviewed_by}


# ── C. Colleges ──────────────────────────────────────────────────────────


@router.get("/colleges")
def list_colleges_admin(
    request: Request,
    session: Session = Depends(get_session),
    admin: Participant = Depends(require_admin),
):
    rows = session.execute(
        select(College).order_by(College.display_order.asc(), College.name.asc())
    ).scalars().all()
    return {"colleges": [college_out(session, row).model_dump() for row in rows]}


@router.post("/colleges", status_code=201)
def create_college(
    body: dict = Body(...),
    request: Request = None,
    session: Session = Depends(get_session),
    admin: Participant = Depends(require_admin),
):
    settings = get_settings(request)
    request_id = getattr(request.state, "request_id", "")
    try:
        data = CollegeIn.model_validate(body)
    except ValidationError as exc:
        raise_422(exc, request_id)

    college = College(id=uuid7(), **data.model_dump())
    session.add(college)
    try:
        session.flush()
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=409,
            detail={
                "error": {
                    "code": "college_exists",
                    "message": "That college is already onboarded.",
                    "request_id": request_id,
                }
            },
        )
    audit(
        session,
        action="college.create",
        entity="college",
        entity_id=college.id,
        actor_email=admin.email_normalized,
        actor_participant_id=admin.id,
        detail={"name": college.name},
        request=request,
        settings=settings,
    )
    session.commit()
    return college_out(session, college).model_dump()


@router.patch("/colleges/{college_id}")
def update_college(
    college_id: str,
    body: dict = Body(...),
    request: Request = None,
    session: Session = Depends(get_session),
    admin: Participant = Depends(require_admin),
):
    settings = get_settings(request)
    request_id = getattr(request.state, "request_id", "")
    try:
        data = CollegeUpdateIn.model_validate(body)
    except ValidationError as exc:
        raise_422(exc, request_id)

    college = _load_or_404(session, College, college_id, request, "College")
    changes = data.model_dump(exclude_none=True)
    for field, value in changes.items():
        setattr(college, field, value)
    college.updated_at = utcnow()
    session.flush()
    audit(
        session,
        action="college.update",
        entity="college",
        entity_id=college.id,
        actor_email=admin.email_normalized,
        actor_participant_id=admin.id,
        detail={"fields": sorted(changes.keys())},
        request=request,
        settings=settings,
    )
    session.commit()
    return college_out(session, college).model_dump()


@router.post("/colleges/{college_id}/logo", response_model=UploadOut)
def upload_college_logo(
    college_id: str,
    request: Request,
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    admin: Participant = Depends(require_admin),
):
    settings = get_settings(request)
    college = _load_or_404(session, College, college_id, request, "College")
    upload = save_logo(session, settings, file, "college-logos")
    college.logo_url = upload.url
    college.updated_at = utcnow()
    session.flush()
    audit(
        session,
        action="college.logo_upload",
        entity="college",
        entity_id=college.id,
        actor_email=admin.email_normalized,
        actor_participant_id=admin.id,
        detail={"storage_key": upload.storage_key, "size_bytes": upload.size_bytes},
        request=request,
        settings=settings,
    )
    session.commit()
    return upload


# ── D. Sponsors ──────────────────────────────────────────────────────────


@router.get("/sponsors")
def list_sponsors_admin(
    request: Request,
    session: Session = Depends(get_session),
    admin: Participant = Depends(require_admin),
):
    rows = session.execute(
        select(Sponsor).order_by(Sponsor.display_order.asc(), Sponsor.name.asc())
    ).scalars().all()
    return {"sponsors": [sponsor_out(row).model_dump() for row in rows]}


@router.post("/sponsors", status_code=201)
def create_sponsor(
    body: dict = Body(...),
    request: Request = None,
    session: Session = Depends(get_session),
    admin: Participant = Depends(require_admin),
):
    settings = get_settings(request)
    request_id = getattr(request.state, "request_id", "")
    try:
        data = SponsorIn.model_validate(body)
    except ValidationError as exc:
        raise_422(exc, request_id)

    sponsor = Sponsor(id=uuid7(), **data.model_dump())
    session.add(sponsor)
    try:
        session.flush()
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=409,
            detail={
                "error": {
                    "code": "sponsor_exists",
                    "message": "That sponsor already exists.",
                    "request_id": request_id,
                }
            },
        )
    audit(
        session,
        action="sponsor.create",
        entity="sponsor",
        entity_id=sponsor.id,
        actor_email=admin.email_normalized,
        actor_participant_id=admin.id,
        detail={"name": sponsor.name, "category": sponsor.category},
        request=request,
        settings=settings,
    )
    session.commit()
    return sponsor_out(sponsor).model_dump()


@router.patch("/sponsors/{sponsor_id}")
def update_sponsor(
    sponsor_id: str,
    body: dict = Body(...),
    request: Request = None,
    session: Session = Depends(get_session),
    admin: Participant = Depends(require_admin),
):
    settings = get_settings(request)
    request_id = getattr(request.state, "request_id", "")
    try:
        data = SponsorUpdateIn.model_validate(body)
    except ValidationError as exc:
        raise_422(exc, request_id)

    sponsor = _load_or_404(session, Sponsor, sponsor_id, request, "Sponsor")
    changes = data.model_dump(exclude_none=True)
    for field, value in changes.items():
        setattr(sponsor, field, value)
    sponsor.updated_at = utcnow()
    session.flush()
    audit(
        session,
        action="sponsor.update",
        entity="sponsor",
        entity_id=sponsor.id,
        actor_email=admin.email_normalized,
        actor_participant_id=admin.id,
        detail={"fields": sorted(changes.keys())},
        request=request,
        settings=settings,
    )
    session.commit()
    return sponsor_out(sponsor).model_dump()


@router.post("/sponsors/{sponsor_id}/logo", response_model=UploadOut)
def upload_sponsor_logo(
    sponsor_id: str,
    request: Request,
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    admin: Participant = Depends(require_admin),
):
    settings = get_settings(request)
    sponsor = _load_or_404(session, Sponsor, sponsor_id, request, "Sponsor")
    upload = save_logo(session, settings, file, "sponsor-logos")
    sponsor.logo_url = upload.url
    sponsor.updated_at = utcnow()
    session.flush()
    audit(
        session,
        action="sponsor.logo_upload",
        entity="sponsor",
        entity_id=sponsor.id,
        actor_email=admin.email_normalized,
        actor_participant_id=admin.id,
        detail={"storage_key": upload.storage_key, "size_bytes": upload.size_bytes},
        request=request,
        settings=settings,
    )
    session.commit()
    return upload


# ── E. Event configuration ───────────────────────────────────────────────


@router.get("/config", response_model=TournamentConfigOut)
def get_config(
    request: Request,
    session: Session = Depends(get_session),
    tournament_and_config: tuple[Tournament, TournamentConfig] = Depends(get_tournament),
    admin: Participant = Depends(require_admin),
):
    tournament, config = tournament_and_config
    return config_out(session, tournament, config)


@router.patch("/config", response_model=TournamentConfigOut)
def patch_config(
    body: dict = Body(...),
    request: Request = None,
    session: Session = Depends(get_session),
    tournament_and_config: tuple[Tournament, TournamentConfig] = Depends(get_tournament),
    admin: Participant = Depends(require_admin),
):
    settings = get_settings(request)
    request_id = getattr(request.state, "request_id", "")
    tournament, config = tournament_and_config
    try:
        data = TournamentConfigUpdateIn.model_validate(body)
    except ValidationError as exc:
        raise_422(exc, request_id)

    return update_config(
        session,
        settings,
        request,
        cfg=config,
        data=data.model_dump(exclude_none=True),
        actor_email=admin.email_normalized,
    )


# ── F. Announcements ─────────────────────────────────────────────────────


@router.get("/announcements")
def list_announcements_admin(
    request: Request,
    session: Session = Depends(get_session),
    tournament_and_config: tuple[Tournament, TournamentConfig] = Depends(get_tournament),
    admin: Participant = Depends(require_admin),
):
    tournament, _ = tournament_and_config
    rows = session.execute(
        select(Announcement)
        .where(Announcement.tournament_id == tournament.id)
        .order_by(Announcement.pinned.desc(), Announcement.created_at.desc())
    ).scalars().all()
    return {"announcements": [announcement_out(row).model_dump() for row in rows]}


@router.post("/announcements", status_code=201)
def create_announcement(
    body: dict = Body(...),
    request: Request = None,
    session: Session = Depends(get_session),
    tournament_and_config: tuple[Tournament, TournamentConfig] = Depends(get_tournament),
    admin: Participant = Depends(require_admin),
):
    settings = get_settings(request)
    request_id = getattr(request.state, "request_id", "")
    tournament, _ = tournament_and_config
    try:
        data = AnnouncementIn.model_validate(body)
    except ValidationError as exc:
        raise_422(exc, request_id)

    row = Announcement(
        id=uuid7(),
        tournament_id=tournament.id,
        published_at=utcnow() if data.is_published else None,
        **data.model_dump(),
    )
    session.add(row)
    session.flush()
    audit(
        session,
        action="announcement.create",
        entity="announcement",
        entity_id=row.id,
        actor_email=admin.email_normalized,
        actor_participant_id=admin.id,
        detail={"title": row.title},
        request=request,
        settings=settings,
    )
    session.commit()
    return announcement_out(row).model_dump()


@router.patch("/announcements/{announcement_id}")
def update_announcement(
    announcement_id: str,
    body: dict = Body(...),
    request: Request = None,
    session: Session = Depends(get_session),
    admin: Participant = Depends(require_admin),
):
    settings = get_settings(request)
    request_id = getattr(request.state, "request_id", "")
    try:
        data = AnnouncementUpdateIn.model_validate(body)
    except ValidationError as exc:
        raise_422(exc, request_id)

    row = _load_or_404(session, Announcement, announcement_id, request, "Announcement")
    changes = data.model_dump(exclude_none=True)
    for field, value in changes.items():
        setattr(row, field, value)
    if changes.get("is_published") and row.published_at is None:
        row.published_at = utcnow()
    session.flush()
    audit(
        session,
        action="announcement.update",
        entity="announcement",
        entity_id=row.id,
        actor_email=admin.email_normalized,
        actor_participant_id=admin.id,
        detail={"fields": sorted(changes.keys())},
        request=request,
        settings=settings,
    )
    session.commit()
    return announcement_out(row).model_dump()


@router.delete("/announcements/{announcement_id}")
def delete_announcement(
    announcement_id: str,
    request: Request,
    session: Session = Depends(get_session),
    admin: Participant = Depends(require_admin),
):
    settings = get_settings(request)
    row = _load_or_404(session, Announcement, announcement_id, request, "Announcement")
    audit(
        session,
        action="announcement.delete",
        entity="announcement",
        entity_id=row.id,
        actor_email=admin.email_normalized,
        actor_participant_id=admin.id,
        detail={"title": row.title},
        request=request,
        settings=settings,
    )
    session.delete(row)
    session.commit()
    return {"deleted": True}


# ── G. Leaderboard ───────────────────────────────────────────────────────


@router.post("/leaderboard/entries", status_code=201)
def create_leaderboard_entry(
    body: dict = Body(...),
    request: Request = None,
    session: Session = Depends(get_session),
    tournament_and_config: tuple[Tournament, TournamentConfig] = Depends(get_tournament),
    admin: Participant = Depends(require_admin),
):
    settings = get_settings(request)
    request_id = getattr(request.state, "request_id", "")
    tournament, _ = tournament_and_config
    try:
        data = LeaderboardEntryIn.model_validate(body)
    except ValidationError as exc:
        raise_422(exc, request_id)

    payload = data.model_dump()
    if payload.get("registration_id"):
        registration = session.get(Registration, payload["registration_id"])
        if registration is None:
            raise _error(request, 422, "registration_not_found", "Registration not found.")
        payload["display_name"] = payload["display_name"] or registration.full_name
        payload["college_name"] = payload["college_name"] or (
            registration.college.name if registration.college else None
        )
    entry = LeaderboardEntry(id=uuid7(), tournament_id=tournament.id, **payload)
    session.add(entry)
    session.flush()
    audit(
        session,
        action="leaderboard.entry_create",
        entity="leaderboard_entry",
        entity_id=entry.id,
        actor_email=admin.email_normalized,
        actor_participant_id=admin.id,
        detail={"display_name": entry.display_name, "score": entry.score},
        request=request,
        settings=settings,
    )
    session.commit()
    return {"id": entry.id, "display_name": entry.display_name}


@router.delete("/leaderboard/entries/{entry_id}")
def delete_leaderboard_entry(
    entry_id: str,
    request: Request,
    session: Session = Depends(get_session),
    admin: Participant = Depends(require_admin),
):
    settings = get_settings(request)
    entry = _load_or_404(session, LeaderboardEntry, entry_id, request, "Leaderboard entry")
    audit(
        session,
        action="leaderboard.entry_delete",
        entity="leaderboard_entry",
        entity_id=entry.id,
        actor_email=admin.email_normalized,
        actor_participant_id=admin.id,
        detail={"display_name": entry.display_name},
        request=request,
        settings=settings,
    )
    session.delete(entry)
    session.commit()
    return {"deleted": True}


@router.post("/leaderboard/publish")
def publish_leaderboard(
    body: dict = Body(default={}),
    request: Request = None,
    session: Session = Depends(get_session),
    tournament_and_config: tuple[Tournament, TournamentConfig] = Depends(get_tournament),
    admin: Participant = Depends(require_admin),
):
    """Enable/disable the public standings. Never publishes fake data — it
    only controls visibility of rows an administrator entered."""
    settings = get_settings(request)
    _, config = tournament_and_config
    enabled = bool(body.get("enabled", True))
    config.leaderboard_enabled = enabled
    session.flush()
    audit(
        session,
        action="leaderboard.publish",
        entity="tournament_config",
        entity_id=config.tournament_id,
        actor_email=admin.email_normalized,
        actor_participant_id=admin.id,
        detail={"enabled": enabled},
        request=request,
        settings=settings,
    )
    session.commit()
    return {"leaderboard_enabled": enabled}


# ── H. Audit log ─────────────────────────────────────────────────────────


@router.get("/audit-log")
def list_audit_log(
    request: Request,
    limit: int = Query(default=100, ge=1, le=500),
    session: Session = Depends(get_session),
    admin: Participant = Depends(require_admin),
):
    rows = audit_rows(session, limit=limit)
    return {
        "entries": [
            AuditLogOut(
                id=row.id,
                actor_email=row.actor_email,
                action=row.action,
                entity=row.entity,
                entity_id=row.entity_id,
                detail_json=row.detail_json,
                created_at=row.created_at.isoformat() if row.created_at else None,
            ).model_dump()
            for row in rows
        ]
    }


__all__ = ["router"]
