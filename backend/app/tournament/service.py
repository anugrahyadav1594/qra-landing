"""
Tournament business logic.

Routers stay thin: validation of *shape* happens in the Pydantic schemas,
validation of *meaning* (is the college onboarded? is the window open? does
the prize pool still reconcile?) happens here, and every mutating operation
writes an audit-log row.
"""

from __future__ import annotations

import csv
import io
import json
from datetime import timedelta
from typing import Any, Iterable

from fastapi import HTTPException, Request, UploadFile
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..config import Settings
from ..models import IdempotencyKey
from ..utils import client_ip, ip_hash, user_agent_summary, utcnow, uuid7
from . import config as tournament_config
from . import notifications, storage
from .config import iso_or_none, prize_tiers, validate_prize_config
from .models import (
    Announcement,
    AuditLog,
    College,
    LeaderboardEntry,
    Participant,
    Registration,
    RegistrationConsent,
    Sponsor,
    Tournament,
    TournamentConfig,
)
from .schemas import (
    AdminOverviewOut,
    AnnouncementOut,
    CollegeOut,
    ConsentOut,
    LeaderboardEntryOut,
    LeaderboardOut,
    RegistrationOut,
    SponsorOut,
    TournamentConfigOut,
    UploadOut,
)
from .security import registration_public_id

# ── Serialisation ────────────────────────────────────────────────────────


def _consents(session: Session, registration_id: str) -> list[ConsentOut]:
    rows = session.execute(
        select(RegistrationConsent).where(
            RegistrationConsent.registration_id == registration_id
        )
    ).scalars().all()
    return [
        ConsentOut(
            purpose=row.purpose,
            granted=row.granted,
            policy_version=row.policy_version,
            created_at=iso_or_none(row.created_at),
        )
        for row in rows
    ]


def registration_out(session: Session, registration: Registration) -> RegistrationOut:
    college = registration.college
    return RegistrationOut(
        id=registration.id,
        registration_id=registration.registration_id,
        status=registration.status,
        full_name=registration.full_name,
        email=registration.email_normalized,
        mobile=registration.mobile,
        college_id=registration.college_id,
        college_name=college.name if college else None,
        college_location=college.location if college else None,
        college_logo_url=college.logo_url if college else None,
        course=registration.course,
        academic_year=registration.academic_year,
        city=registration.city,
        email_verified=registration.email_verified_at is not None,
        status_note=registration.status_note,
        reviewed_at=iso_or_none(registration.reviewed_at),
        created_at=iso_or_none(registration.created_at),
        updated_at=iso_or_none(registration.updated_at),
        consents=_consents(session, registration.id),
    )


def config_out(session: Session, tournament: Tournament, cfg: TournamentConfig) -> TournamentConfigOut:
    college_count = (
        session.query(func.count(College.id))
        .filter(College.is_active.is_(True), College.accepts_registrations.is_(True))
        .scalar()
        or 0
    )
    sponsor_count = session.query(func.count(Sponsor.id)).filter(Sponsor.is_active.is_(True)).scalar() or 0
    registration_count = (
        session.query(func.count(Registration.id))
        .filter(
            Registration.tournament_id == tournament.id,
            Registration.status != "cancelled",
        )
        .scalar()
        or 0
    )
    return TournamentConfigOut(
        slug=tournament.slug,
        name=tournament.name,
        short_name=tournament.short_name,
        organizer=tournament.organizer,
        tagline=cfg.tagline,
        hero_headline=cfg.hero_headline,
        hero_subhead=cfg.hero_subhead,
        status_label=cfg.status_label,
        participation_type=cfg.participation_type,
        qualifying_format=cfg.qualifying_format,
        location_context=cfg.location_context,
        currency=cfg.currency,
        prize_pool_total=cfg.prize_pool_total,
        cash_prize_pool=cfg.cash_prize_pool,
        goodies_and_merchandise=cfg.goodies_and_merchandise,
        champion_prize=cfg.champion_prize,
        first_runner_up_prize=cfg.first_runner_up_prize,
        second_runner_up_prize=cfg.second_runner_up_prize,
        merit_prize_count=cfg.merit_prize_count,
        merit_prize_amount=cfg.merit_prize_amount,
        merit_prize_total=cfg.merit_prize_total,
        prize_tiers=prize_tiers(cfg),
        event_starts_at=iso_or_none(cfg.event_starts_at),
        registration_opens_at=iso_or_none(cfg.registration_opens_at),
        registration_closes_at=iso_or_none(cfg.registration_closes_at),
        venue=cfg.venue,
        eligibility=cfg.eligibility,
        competition_format=cfg.competition_format,
        qualifying_round_info=cfg.qualifying_round_info,
        final_round_info=cfg.final_round_info,
        description=cfg.description,
        rules_md=cfg.rules_md,
        registrations_open=cfg.registrations_open,
        auto_approve_registrations=cfg.auto_approve_registrations,
        leaderboard_enabled=cfg.leaderboard_enabled,
        contact_email=cfg.contact_email,
        updated_at=iso_or_none(cfg.updated_at),
        college_count=int(college_count),
        sponsor_count=int(sponsor_count),
        registration_count=int(registration_count),
    )


def college_out(session: Session, college: College) -> CollegeOut:
    count = (
        session.query(func.count(Registration.id))
        .filter(
            Registration.college_id == college.id,
            Registration.status != "cancelled",
        )
        .scalar()
        or 0
    )
    return CollegeOut(
        id=college.id,
        name=college.name,
        location=college.location,
        logo_url=college.logo_url,
        description=college.description,
        is_active=college.is_active,
        accepts_registrations=college.accepts_registrations,
        display_order=college.display_order,
        registration_count=int(count),
        created_at=iso_or_none(college.created_at),
        updated_at=iso_or_none(college.updated_at),
    )


def sponsor_out(sponsor: Sponsor) -> SponsorOut:
    return SponsorOut(
        id=sponsor.id,
        name=sponsor.name,
        logo_url=sponsor.logo_url,
        website_url=sponsor.website_url,
        category=sponsor.category,
        display_order=sponsor.display_order,
        is_active=sponsor.is_active,
    )


def announcement_out(row: Announcement) -> AnnouncementOut:
    return AnnouncementOut(
        id=row.id,
        title=row.title,
        body_md=row.body_md,
        category=row.category,
        pinned=row.pinned,
        is_published=row.is_published,
        published_at=iso_or_none(row.published_at),
    )


def leaderboard_out(session: Session, cfg: TournamentConfig) -> LeaderboardOut:
    if not cfg.leaderboard_enabled:
        return LeaderboardOut(enabled=False, updated_at=None, entries=[])
    rows = session.execute(
        select(LeaderboardEntry)
        .where(LeaderboardEntry.tournament_id == cfg.tournament_id)
        .order_by(
            LeaderboardEntry.rank.is_(None),
            LeaderboardEntry.rank.asc(),
            LeaderboardEntry.score.desc(),
        )
    ).scalars().all()
    updated = max((row.updated_at for row in rows if row.updated_at), default=None)
    return LeaderboardOut(
        enabled=True,
        updated_at=iso_or_none(updated),
        entries=[
            LeaderboardEntryOut(
                id=row.id,
                display_name=row.display_name,
                college_name=row.college_name,
                score=row.score,
                rank=row.rank,
                qualification_status=row.qualification_status,
                note=row.note,
                updated_at=iso_or_none(row.updated_at),
            )
            for row in rows
        ],
    )


# ── Public reads ─────────────────────────────────────────────────────────


def public_colleges(session: Session) -> list[CollegeOut]:
    rows = session.execute(
        select(College)
        .where(College.is_active.is_(True), College.accepts_registrations.is_(True))
        .order_by(College.display_order.asc(), College.name.asc())
    ).scalars().all()
    return [college_out(session, row) for row in rows]


def public_sponsors(session: Session) -> list[SponsorOut]:
    rows = session.execute(
        select(Sponsor)
        .where(Sponsor.is_active.is_(True))
        .order_by(Sponsor.display_order.asc(), Sponsor.name.asc())
    ).scalars().all()
    return [sponsor_out(row) for row in rows]


def public_announcements(session: Session, tournament_id: str) -> list[AnnouncementOut]:
    rows = session.execute(
        select(Announcement)
        .where(
            Announcement.tournament_id == tournament_id,
            Announcement.is_published.is_(True),
        )
        .order_by(Announcement.pinned.desc(), Announcement.published_at.desc())
    ).scalars().all()
    return [announcement_out(row) for row in rows]


# ── Registration ─────────────────────────────────────────────────────────


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


def find_registration(
    session: Session, tournament_id: str, participant_id: str
) -> Registration | None:
    return session.execute(
        select(Registration).where(
            Registration.tournament_id == tournament_id,
            Registration.participant_id == participant_id,
        )
    ).scalar_one_or_none()


def registration_window_error(cfg: TournamentConfig, now) -> HTTPException | None:
    if cfg.registration_opens_at and now < cfg.registration_opens_at:
        return HTTPException(
            status_code=422,
            detail={
                "error": {
                    "code": "registrations_not_open_yet",
                    "message": "Registrations have not opened yet.",
                }
            },
        )
    if cfg.registration_closes_at and now > cfg.registration_closes_at:
        return HTTPException(
            status_code=422,
            detail={
                "error": {
                    "code": "registrations_closed",
                    "message": "Registrations for this tournament are closed.",
                }
            },
        )
    return None


def register(
    session: Session,
    settings: Settings,
    request: Request,
    *,
    tournament: Tournament,
    cfg: TournamentConfig,
    participant: Participant,
    data: dict[str, Any],
) -> tuple[RegistrationOut, bool]:
    """Create (or replay) an individual registration.

    Returns ``(registration, already_registered)``. Duplicate protection is
    enforced by the database partial-unique indexes; the IntegrityError path
    is the authoritative "you already registered" answer.
    """
    now = utcnow()

    if not cfg.registrations_open:
        raise _error(
            request, 422, "registrations_closed",
            "Registrations are currently closed. Please check back soon.",
        )
    window_error = registration_window_error(cfg, now)
    if window_error:
        raise window_error

    email = participant.email_normalized
    submitted_email = data.get("email")
    if submitted_email and submitted_email != email:
        raise _error(
            request, 422, "email_mismatch",
            "Register with the email address you signed in with.",
        )
    if participant.email_verified_at is None:
        raise _error(
            request, 403, "email_verification_required",
            "Verify your email address before registering.",
        )

    college = session.get(College, data["college_id"])
    if college is None or not college.is_active or not college.accepts_registrations:
        raise _error(
            request, 422, "college_not_onboarded",
            "Select a college from the onboarded list.",
        )

    if not data.get("consent_event_participation"):
        raise _error(
            request, 422, "consent_required",
            "Consent to event participation is required.",
        )
    if not data.get("consent_privacy_policy"):
        raise _error(
            request, 422, "consent_required",
            "Consent to the privacy policy is required.",
        )

    initial_status = "approved" if cfg.auto_approve_registrations else "under_review"

    try:
        with session.begin_nested():
            registration = Registration(
                id=uuid7(),
                tournament_id=tournament.id,
                participant_id=participant.id,
                college_id=college.id,
                registration_id=registration_public_id(),
                full_name=data["full_name"],
                email_normalized=email,
                mobile=data.get("mobile"),
                course=data.get("course"),
                academic_year=data.get("academic_year"),
                city=data.get("city"),
                status=initial_status,
                email_verified_at=participant.email_verified_at,
                source_json=json.dumps(
                    {"page": str(request.headers.get("referer", ""))[:200]}
                ),
                ip_hash=ip_hash(client_ip(request, settings.trust_proxy)),
                user_agent_summary=user_agent_summary(
                    request.headers.get("user-agent")
                ),
                policy_version=settings.policy_version,
                created_at=now,
                updated_at=now,
            )
            session.add(registration)
            session.flush()

            for purpose, granted in (
                ("mtt_event_participation", True),
                ("mtt_privacy_policy", True),
                ("mtt_marketing_email", bool(data.get("consent_marketing_email"))),
            ):
                session.add(
                    RegistrationConsent(
                        id=uuid7(),
                        registration_id=registration.id,
                        purpose=purpose,
                        granted=granted,
                        policy_version=settings.policy_version,
                        source_page="/tournament/register",
                        created_at=now,
                    )
                )
        session.commit()
        already = False
    except IntegrityError:
        session.rollback()
        existing = find_registration(session, tournament.id, participant.id)
        if existing is None:
            # Email-level duplicate (another identity used the same address).
            existing = session.execute(
                select(Registration).where(
                    Registration.tournament_id == tournament.id,
                    Registration.email_normalized == email,
                    Registration.status != "cancelled",
                )
            ).scalar_one_or_none()
        if existing is None:
            raise
        registration = existing
        already = True

    out = registration_out(session, registration)

    if not already:
        notifications.send_registration_confirmation(
            settings,
            email=email,
            name=registration.full_name,
            registration_id=registration.registration_id,
            college_name=college.name,
            status=registration.status,
            event_name=tournament.name,
            dashboard_url="/tournament/dashboard",
        )
    return out, already


def update_own_registration(
    session: Session,
    settings: Settings,
    request: Request,
    *,
    registration: Registration,
    data: dict[str, Any],
    actor_email: str,
) -> RegistrationOut:
    if registration.status in ("approved", "rejected", "cancelled"):
        raise _error(
            request, 409, "registration_locked",
            "This registration can no longer be edited. Contact support if a "
            "detail is incorrect.",
        )
    if "college_id" in data and data["college_id"]:
        college = session.get(College, data["college_id"])
        if college is None or not college.is_active or not college.accepts_registrations:
            raise _error(
                request, 422, "college_not_onboarded",
                "Select a college from the onboarded list.",
            )
    for field in ("full_name", "mobile", "course", "academic_year", "city", "college_id"):
        if field in data and data[field] is not None:
            setattr(registration, field, data[field])
    registration.updated_at = utcnow()
    session.commit()
    from .security import audit

    audit(
        session,
        action="registration.update_self",
        entity="registration",
        entity_id=registration.registration_id,
        actor_email=actor_email,
        detail={"fields": sorted(data.keys())},
        request=request,
        settings=settings,
    )
    session.commit()
    return registration_out(session, registration)


# ── Admin: registrations ─────────────────────────────────────────────────


def admin_list_registrations(
    session: Session,
    tournament_id: str,
    *,
    query: str | None = None,
    college_id: str | None = None,
    status: str | None = None,
    limit: int = 100,
    offset: int = 0,
) -> tuple[list[RegistrationOut], int]:
    stmt = select(Registration).where(Registration.tournament_id == tournament_id)
    count_stmt = select(func.count(Registration.id)).where(
        Registration.tournament_id == tournament_id
    )
    if query:
        like = f"%{query.lower()}%"
        stmt = stmt.where(
            func.lower(Registration.full_name).like(like)
            | func.lower(Registration.email_normalized).like(like)
            | func.lower(Registration.registration_id).like(like)
        )
        count_stmt = count_stmt.where(
            func.lower(Registration.full_name).like(like)
            | func.lower(Registration.email_normalized).like(like)
            | func.lower(Registration.registration_id).like(like)
        )
    if college_id:
        stmt = stmt.where(Registration.college_id == college_id)
        count_stmt = count_stmt.where(Registration.college_id == college_id)
    if status:
        stmt = stmt.where(Registration.status == status)
        count_stmt = count_stmt.where(Registration.status == status)

    total = int(session.execute(count_stmt).scalar() or 0)
    rows = session.execute(
        stmt.order_by(Registration.created_at.desc()).limit(limit).offset(offset)
    ).scalars().all()
    return [registration_out(session, row) for row in rows], total


def registrations_csv(rows: Iterable[RegistrationOut]) -> str:
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(
        [
            "registration_id",
            "status",
            "full_name",
            "email",
            "mobile",
            "college",
            "college_location",
            "course",
            "academic_year",
            "city",
            "created_at",
        ]
    )
    for row in rows:
        writer.writerow(
            [
                row.registration_id,
                row.status,
                row.full_name,
                row.email,
                row.mobile or "",
                row.college_name or "",
                row.college_location or "",
                row.course or "",
                row.academic_year or "",
                row.city or "",
                row.created_at or "",
            ]
        )
    return buffer.getvalue()


def admin_overview(
    session: Session, tournament: Tournament, cfg: TournamentConfig
) -> AdminOverviewOut:
    base = select(Registration).where(Registration.tournament_id == tournament.id)
    total = int(session.execute(
        select(func.count(Registration.id)).where(
            Registration.tournament_id == tournament.id,
            Registration.status != "cancelled",
        )
    ).scalar() or 0)

    status_rows = session.execute(
        select(Registration.status, func.count(Registration.id))
        .where(Registration.tournament_id == tournament.id)
        .group_by(Registration.status)
    ).all()
    by_status = {str(status): int(count) for status, count in status_rows}

    college_rows = session.execute(
        select(College.name, func.count(Registration.id))
        .join(Registration, Registration.college_id == College.id)
        .where(Registration.tournament_id == tournament.id)
        .group_by(College.name)
        .order_by(func.count(Registration.id).desc(), College.name.asc())
    ).all()
    by_college = [
        {"college": str(name), "registrations": int(count)} for name, count in college_rows
    ]

    since = utcnow() - timedelta(days=7)
    trend_rows = session.execute(
        select(Registration.created_at).where(
            Registration.tournament_id == tournament.id,
            Registration.created_at >= since,
        )
    ).scalars().all()
    buckets: dict[str, int] = {}
    for _ in range(7):
        day = (utcnow() - timedelta(days=6)).date()
        break
    for index in range(7):
        day = (utcnow() - timedelta(days=6 - index)).date().isoformat()
        buckets[day] = 0
    for created in trend_rows:
        if created:
            key = created.date().isoformat()
            buckets[key] = buckets.get(key, 0) + 1
    trend = [{"date": key, "registrations": value} for key, value in sorted(buckets.items())]

    active_colleges = int(
        session.query(func.count(College.id)).filter(College.is_active.is_(True)).scalar() or 0
    )
    total_colleges = int(session.query(func.count(College.id)).scalar() or 0)
    sponsor_count = int(
        session.query(func.count(Sponsor.id)).filter(Sponsor.is_active.is_(True)).scalar() or 0
    )
    announcements = int(
        session.query(func.count(Announcement.id))
        .filter(
            Announcement.tournament_id == tournament.id,
            Announcement.is_published.is_(True),
        )
        .scalar()
        or 0
    )

    _ = base  # kept for readability of the query composition above

    return AdminOverviewOut(
        total_registrations=total,
        by_status=by_status,
        by_college=by_college,
        pending_approvals=by_status.get("submitted", 0) + by_status.get("under_review", 0),
        approved=by_status.get("approved", 0),
        active_colleges=active_colleges,
        total_colleges=total_colleges,
        sponsor_count=sponsor_count,
        published_announcements=announcements,
        registrations_last_7_days=trend,
        leaderboard_enabled=cfg.leaderboard_enabled,
        registrations_open=cfg.registrations_open,
    )


def admin_set_status(
    session: Session,
    settings: Settings,
    request: Request,
    *,
    registration: Registration,
    status: str,
    note: str | None,
    actor_email: str,
) -> RegistrationOut:
    from .security import audit

    previous = registration.status
    registration.status = status
    registration.status_note = note
    registration.reviewed_by = actor_email
    registration.reviewed_at = utcnow()
    registration.updated_at = utcnow()
    session.commit()
    audit(
        session,
        action="registration.status_change",
        entity="registration",
        entity_id=registration.registration_id,
        actor_email=actor_email,
        detail={"from": previous, "to": status},
        request=request,
        settings=settings,
    )
    session.commit()
    return registration_out(session, registration)


# ── Admin: content ───────────────────────────────────────────────────────


def parse_datetime(value: str | None):
    if not value:
        return None
    from datetime import datetime

    text = value.strip().replace("Z", "+00:00")
    try:
        parsed = datetime.fromisoformat(text)
    except ValueError:
        raise ValueError(f"'{value}' is not a valid ISO-8601 date/time")
    return parsed.replace(tzinfo=None)


def update_config(
    session: Session,
    settings: Settings,
    request: Request,
    *,
    cfg: TournamentConfig,
    data: dict[str, Any],
    actor_email: str,
) -> TournamentConfigOut:
    from .security import audit

    prize_fields = {
        "prize_pool_total",
        "cash_prize_pool",
        "goodies_and_merchandise",
        "champion_prize",
        "first_runner_up_prize",
        "second_runner_up_prize",
        "merit_prize_count",
        "merit_prize_amount",
        "merit_prize_total",
    }
    if any(field in data for field in prize_fields):
        merged = {
            "prize_pool_total": data.get("prize_pool_total", cfg.prize_pool_total),
            "cash_prize_pool": data.get("cash_prize_pool", cfg.cash_prize_pool),
            "goodies_and_merchandise": data.get(
                "goodies_and_merchandise", cfg.goodies_and_merchandise
            ),
            "champion_prize": data.get("champion_prize", cfg.champion_prize),
            "first_runner_up_prize": data.get(
                "first_runner_up_prize", cfg.first_runner_up_prize
            ),
            "second_runner_up_prize": data.get(
                "second_runner_up_prize", cfg.second_runner_up_prize
            ),
            "merit_prize_count": data.get("merit_prize_count", cfg.merit_prize_count),
            "merit_prize_amount": data.get("merit_prize_amount", cfg.merit_prize_amount),
            "merit_prize_total": data.get("merit_prize_total", cfg.merit_prize_total),
        }
        errors = validate_prize_config(merged)
        if errors:
            raise _error(request, 422, "prize_pool_mismatch", " ".join(errors))

    changed: dict[str, Any] = {}
    for field, value in data.items():
        if value is None and field in (
            "event_starts_at",
            "registration_opens_at",
            "registration_closes_at",
        ):
            setattr(cfg, field, None)
            changed[field] = None
            continue
        if field in ("event_starts_at", "registration_opens_at", "registration_closes_at"):
            try:
                parsed = parse_datetime(value)
            except ValueError as exc:
                raise _error(request, 422, "invalid_datetime", str(exc))
            setattr(cfg, field, parsed)
            changed[field] = iso_or_none(parsed)
            continue
        if field == "prize_tiers":
            cfg.prize_tiers_json = json.dumps(
                [tier.model_dump() if hasattr(tier, "model_dump") else tier for tier in value]
            )
            changed[field] = "updated"
            continue
        setattr(cfg, field, value)
        changed[field] = value

    session.commit()
    audit(
        session,
        action="config.update",
        entity="tournament_config",
        entity_id=cfg.tournament_id,
        actor_email=actor_email,
        detail={"fields": sorted(changed.keys())},
        request=request,
        settings=settings,
    )
    session.commit()
    tournament = session.get(Tournament, cfg.tournament_id)
    return config_out(session, tournament, cfg)


def save_logo(
    session: Session,
    settings: Settings,
    upload: UploadFile,
    category: str,
) -> UploadOut:
    payload = upload.file.read()
    try:
        storage_key, url = storage.save_logo(settings, upload, payload, category)
    except storage.UploadRejected as exc:
        raise HTTPException(
            status_code=422,
            detail={"error": {"code": exc.code, "message": exc.message}},
        )
    return UploadOut(
        url=url, storage_key=storage_key, size_bytes=len(payload),
        content_type=upload.content_type or "application/octet-stream",
    )


def audit_rows(session: Session, limit: int = 100) -> list[AuditLog]:
    return list(
        session.execute(
            select(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit)
        ).scalars().all()
    )


# Re-exported for routers that need the seeding helper.
ensure_tournament = tournament_config.ensure_tournament
replay_idempotent = IdempotencyKey
client_ip_for = client_ip
