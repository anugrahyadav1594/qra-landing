"""
Tournament entities.

Identifier policy follows the rest of the platform (ADR-002): every
externally visible primary key is an app-generated UUIDv7 string, never a
sequence. Registrations additionally carry a short, human-readable
`registration_id` (e.g. ``MTT-4KQ8ZP``) that is safe to print on a badge.

Duplicate-registration protection is enforced by the database, not by
application code alone: partial-unique indexes (``registration_status !=
'cancelled'``) on (tournament, participant) and (tournament, email).
"""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.sql import text

from ..models import Base  # shared declarative base — single metadata object
from ..utils import utcnow

__all__ = [
    "Base",
    "Tournament",
    "TournamentConfig",
    "College",
    "Sponsor",
    "Participant",
    "OtpCode",
    "Session",
    "Registration",
    "RegistrationConsent",
    "LeaderboardEntry",
    "Announcement",
    "AdminRole",
    "AuditLog",
]

assert issubclass(Base, DeclarativeBase)


def _pk() -> Mapped[str]:
    return mapped_column(String(36), primary_key=True)


def _ts() -> Mapped[datetime]:
    return mapped_column(DateTime, default=utcnow)


def _updated() -> Mapped[datetime]:
    return mapped_column(DateTime, default=utcnow, onupdate=utcnow)


ACTIVE_REGISTRATION_PREDICATE = "status != 'cancelled'"


class Tournament(Base):
    """The event itself. One row per edition (slug is stable: ``mtt``)."""

    __tablename__ = "tournament_events"

    id: Mapped[str] = _pk()
    slug: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(160))
    short_name: Mapped[str] = mapped_column(String(24), default="MTT")
    organizer: Mapped[str] = mapped_column(String(160), default="")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    created_at: Mapped[datetime] = _ts()
    updated_at: Mapped[datetime] = _updated()


class TournamentConfig(Base):
    """Every editable tournament field lives here — nothing about the event
    is hard-coded in the frontend or in Python.

    Unconfirmed facts (dates, venue, eligibility, qualification criteria)
    stay NULL; the UI renders an explicit "to be announced" state instead of
    inventing content.
    """

    __tablename__ = "tournament_configs"

    id: Mapped[str] = _pk()
    tournament_id: Mapped[str] = mapped_column(
        ForeignKey("tournament_events.id"), unique=True, index=True
    )

    # ── Identity ──────────────────────────────────────────────────────────
    tagline: Mapped[str] = mapped_column(String(200), default="Mumbai's trading competition")
    hero_headline: Mapped[str] = mapped_column(String(160), default="THE MARKET IS YOUR ARENA.")
    hero_subhead: Mapped[str] = mapped_column(String(400), default="")
    status_label: Mapped[str] = mapped_column(String(120), default="MUMBAI'S TRADING COMPETITION")
    participation_type: Mapped[str] = mapped_column(String(60), default="Individual")
    qualifying_format: Mapped[str] = mapped_column(
        String(200), default="College-level qualifying rounds"
    )
    location_context: Mapped[str] = mapped_column(String(120), default="Mumbai")
    currency: Mapped[str] = mapped_column(String(8), default="INR")

    # ── Prize pool (₹1,00,000 as confirmed by the organisers) ─────────────
    prize_pool_total: Mapped[int] = mapped_column(Integer, default=100_000)
    cash_prize_pool: Mapped[int] = mapped_column(Integer, default=60_000)
    goodies_and_merchandise: Mapped[int] = mapped_column(Integer, default=40_000)
    champion_prize: Mapped[int] = mapped_column(Integer, default=25_000)
    first_runner_up_prize: Mapped[int] = mapped_column(Integer, default=15_000)
    second_runner_up_prize: Mapped[int] = mapped_column(Integer, default=10_000)
    merit_prize_count: Mapped[int] = mapped_column(Integer, default=10)
    merit_prize_amount: Mapped[int] = mapped_column(Integer, default=1_000)
    merit_prize_total: Mapped[int] = mapped_column(Integer, default=10_000)
    prize_tiers_json: Mapped[str | None] = mapped_column(Text, nullable=True)

    # ── Event facts (all optional until confirmed) ────────────────────────
    event_starts_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    registration_opens_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    registration_closes_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    venue: Mapped[str | None] = mapped_column(String(300), nullable=True)
    eligibility: Mapped[str | None] = mapped_column(Text, nullable=True)
    competition_format: Mapped[str | None] = mapped_column(Text, nullable=True)
    qualifying_round_info: Mapped[str | None] = mapped_column(Text, nullable=True)
    final_round_info: Mapped[str | None] = mapped_column(Text, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    rules_md: Mapped[str | None] = mapped_column(Text, nullable=True)
    contact_email: Mapped[str | None] = mapped_column(String(254), nullable=True)

    # ── Operational switches ──────────────────────────────────────────────
    registrations_open: Mapped[bool] = mapped_column(Boolean, default=True)
    auto_approve_registrations: Mapped[bool] = mapped_column(Boolean, default=False)
    leaderboard_enabled: Mapped[bool] = mapped_column(Boolean, default=False)

    updated_at: Mapped[datetime] = _updated()


class College(Base):
    """An onboarded institution. Only active colleges that accept
    registrations are offered to participants — the dropdown is always
    driven by this table, never by free text."""

    __tablename__ = "tournament_colleges"
    __table_args__ = (UniqueConstraint("name", "location", name="uniq_college_name_location"),)

    id: Mapped[str] = _pk()
    name: Mapped[str] = mapped_column(String(200), index=True)
    location: Mapped[str | None] = mapped_column(String(200), nullable=True)
    logo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    accepts_registrations: Mapped[bool] = mapped_column(Boolean, default=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = _ts()
    updated_at: Mapped[datetime] = _updated()


class Sponsor(Base):
    __tablename__ = "tournament_sponsors"

    id: Mapped[str] = _pk()
    name: Mapped[str] = mapped_column(String(200))
    logo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    website_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    category: Mapped[str] = mapped_column(String(40), default="other_partner", index=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    created_at: Mapped[datetime] = _ts()
    updated_at: Mapped[datetime] = _updated()


class Participant(Base):
    """A person. Identity is passwordless (email one-time code) or, when
    Clerk is configured, linked by `external_id`. Passwords are never
    stored by this platform."""

    __tablename__ = "tournament_participants"

    id: Mapped[str] = _pk()
    email_normalized: Mapped[str] = mapped_column(String(254), unique=True, index=True)
    full_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    email_verified_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    auth_provider: Mapped[str] = mapped_column(String(24), default="otp")
    external_id: Mapped[str | None] = mapped_column(String(120), nullable=True, index=True)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    created_at: Mapped[datetime] = _ts()
    updated_at: Mapped[datetime] = _updated()


class OtpCode(Base):
    __tablename__ = "tournament_otp_codes"

    id: Mapped[str] = _pk()
    email_normalized: Mapped[str] = mapped_column(String(254), index=True)
    code_hash: Mapped[str] = mapped_column(String(64))
    purpose: Mapped[str] = mapped_column(String(24), default="signin")
    expires_at: Mapped[datetime] = mapped_column(DateTime)
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    consumed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    ip_hash: Mapped[str | None] = mapped_column(String(40), nullable=True)
    created_at: Mapped[datetime] = _ts()


class Session(Base):
    """Opaque, server-side session (random token, only its hash is stored)."""

    __tablename__ = "tournament_sessions"

    id: Mapped[str] = _pk()
    participant_id: Mapped[str] = mapped_column(
        ForeignKey("tournament_participants.id"), index=True
    )
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    ip_hash: Mapped[str | None] = mapped_column(String(40), nullable=True)
    user_agent_summary: Mapped[str | None] = mapped_column(String(40), nullable=True)
    created_at: Mapped[datetime] = _ts()


class Registration(Base):
    """One individual entry into the tournament.

    There is deliberately no team entity: participation is individual and
    each registration points at exactly one onboarded college.
    """

    __tablename__ = "tournament_registrations"
    __table_args__ = (
        Index(
            "uniq_registration_participant",
            "tournament_id",
            "participant_id",
            unique=True,
            sqlite_where=text(ACTIVE_REGISTRATION_PREDICATE),
        ),
        Index(
            "uniq_registration_email",
            "tournament_id",
            "email_normalized",
            unique=True,
            sqlite_where=text(ACTIVE_REGISTRATION_PREDICATE),
        ),
        Index("ix_registration_status", "tournament_id", "status"),
        Index("ix_registration_college", "tournament_id", "college_id"),
    )

    id: Mapped[str] = _pk()
    tournament_id: Mapped[str] = mapped_column(
        ForeignKey("tournament_events.id"), index=True
    )
    participant_id: Mapped[str] = mapped_column(
        ForeignKey("tournament_participants.id"), index=True
    )
    college_id: Mapped[str] = mapped_column(ForeignKey("tournament_colleges.id"), index=True)
    registration_id: Mapped[str] = mapped_column(String(32), unique=True, index=True)

    full_name: Mapped[str] = mapped_column(String(200))
    email_normalized: Mapped[str] = mapped_column(String(254), index=True)
    mobile: Mapped[str | None] = mapped_column(String(32), nullable=True)
    course: Mapped[str | None] = mapped_column(String(120), nullable=True)
    academic_year: Mapped[str | None] = mapped_column(String(40), nullable=True)
    city: Mapped[str | None] = mapped_column(String(120), nullable=True)

    status: Mapped[str] = mapped_column(String(32), default="submitted", index=True)
    status_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    reviewed_by: Mapped[str | None] = mapped_column(String(254), nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    email_verified_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    source_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    ip_hash: Mapped[str | None] = mapped_column(String(40), nullable=True)
    user_agent_summary: Mapped[str | None] = mapped_column(String(40), nullable=True)
    policy_version: Mapped[str] = mapped_column(String(24), default="1.0")

    created_at: Mapped[datetime] = _ts()
    updated_at: Mapped[datetime] = _updated()

    college = relationship("College", lazy="joined")
    participant = relationship("Participant", lazy="joined")


class RegistrationConsent(Base):
    """Immutable record of what the participant agreed to, and when.

    Event participation and privacy-policy consent are mandatory; marketing
    consent is always optional and stored separately.
    """

    __tablename__ = "tournament_registration_consents"

    id: Mapped[str] = _pk()
    registration_id: Mapped[str] = mapped_column(
        ForeignKey("tournament_registrations.id"), index=True
    )
    purpose: Mapped[str] = mapped_column(String(48))
    granted: Mapped[bool] = mapped_column(Boolean, default=True)
    policy_version: Mapped[str] = mapped_column(String(24), default="1.0")
    source_page: Mapped[str | None] = mapped_column(String(200), nullable=True)
    created_at: Mapped[datetime] = _ts()


class LeaderboardEntry(Base):
    """Real results only. Nothing here is generated client-side."""

    __tablename__ = "tournament_leaderboard_entries"

    id: Mapped[str] = _pk()
    tournament_id: Mapped[str] = mapped_column(ForeignKey("tournament_events.id"), index=True)
    registration_id: Mapped[str | None] = mapped_column(
        ForeignKey("tournament_registrations.id"), nullable=True, index=True
    )
    display_name: Mapped[str] = mapped_column(String(200))
    college_id: Mapped[str | None] = mapped_column(
        ForeignKey("tournament_colleges.id"), nullable=True
    )
    college_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    score: Mapped[float | None] = mapped_column(Float, nullable=True)
    rank: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    qualification_status: Mapped[str | None] = mapped_column(String(40), nullable=True)
    note: Mapped[str | None] = mapped_column(String(300), nullable=True)
    updated_at: Mapped[datetime] = _updated()


class Announcement(Base):
    __tablename__ = "tournament_announcements"

    id: Mapped[str] = _pk()
    tournament_id: Mapped[str] = mapped_column(ForeignKey("tournament_events.id"), index=True)
    title: Mapped[str] = mapped_column(String(200))
    body_md: Mapped[str] = mapped_column(Text, default="")
    category: Mapped[str] = mapped_column(String(40), default="general")
    pinned: Mapped[bool] = mapped_column(Boolean, default=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = _ts()
    updated_at: Mapped[datetime] = _updated()


class AdminRole(Base):
    __tablename__ = "tournament_admin_roles"
    __table_args__ = (UniqueConstraint("participant_id", name="uniq_admin_participant"),)

    id: Mapped[str] = _pk()
    participant_id: Mapped[str] = mapped_column(
        ForeignKey("tournament_participants.id"), index=True
    )
    email_normalized: Mapped[str] = mapped_column(String(254), index=True)
    role: Mapped[str] = mapped_column(String(32), default="admin")
    granted_by: Mapped[str | None] = mapped_column(String(254), nullable=True)
    created_at: Mapped[datetime] = _ts()


class AuditLog(Base):
    __tablename__ = "tournament_audit_log"

    id: Mapped[str] = _pk()
    actor_email: Mapped[str | None] = mapped_column(String(254), nullable=True, index=True)
    actor_participant_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    action: Mapped[str] = mapped_column(String(64), index=True)
    entity: Mapped[str] = mapped_column(String(64))
    entity_id: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    detail_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    ip_hash: Mapped[str | None] = mapped_column(String(40), nullable=True)
    created_at: Mapped[datetime] = _ts()
