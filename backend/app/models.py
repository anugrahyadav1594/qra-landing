"""
SQLAlchemy models — local development schema (SQLite).

Production targets PostgreSQL 16+ on Neon (§8, ADR-001); the schema mirrors
the table specs in ARCHITECTURE.md §8.2/§9.3/§10.2 so migrating is a
connection-string change plus Drizzle/SQL parity work.

Identifier policy (ADR-002): every externally facing PK is a UUIDv7 string,
never a sequence.
"""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import (
    Boolean, DateTime, ForeignKey, Index, Integer, SmallInteger, String, Text,
    UniqueConstraint,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

from .utils import utcnow


class Base(DeclarativeBase):
    pass


def _pk() -> Mapped[str]:
    return mapped_column(String(36), primary_key=True)


class Product(Base):
    __tablename__ = "products"

    id: Mapped[str] = _pk()
    slug: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    tagline: Mapped[str] = mapped_column(String(240), default="")
    description_md: Mapped[str] = mapped_column(Text, default="")
    domain: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(24), default="draft")  # draft|live|waitlist_only|archived
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    accepts_waitlist: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)


class TeamMember(Base):
    __tablename__ = "team_members"

    id: Mapped[str] = _pk()
    name: Mapped[str] = mapped_column(String(120))
    role: Mapped[str] = mapped_column(String(120))
    bio: Mapped[str] = mapped_column(Text, default="")
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class Update(Base):
    __tablename__ = "updates"

    id: Mapped[str] = _pk()
    slug: Mapped[str] = mapped_column(String(80), unique=True)
    title: Mapped[str] = mapped_column(String(200))
    body_md: Mapped[str] = mapped_column(Text, default="")
    published_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


def text_where_user_null():
    from sqlalchemy import text
    return text("user_id IS NULL")


def text_where_user_not_null():
    from sqlalchemy import text
    return text("user_id IS NOT NULL")


class WaitlistEntry(Base):
    __tablename__ = "waitlist_entries"
    __table_args__ = (
        # §9.4: the two partial-unique backstops against duplicates.
        Index("uniq_waitlist_anon", "product_id", "email_normalized",
              unique=True, sqlite_where=text_where_user_null()),
        Index("uniq_waitlist_user", "product_id", "user_id",
              unique=True, sqlite_where=text_where_user_not_null()),
    )

    id: Mapped[str] = _pk()
    user_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"), index=True)
    email_normalized: Mapped[str] = mapped_column(String(254), index=True)
    referral_code: Mapped[str | None] = mapped_column(String(64), nullable=True)
    source_json: Mapped[str | None] = mapped_column(Text, nullable=True)  # utm/page/referrer domain
    ip_hash: Mapped[str | None] = mapped_column(String(40), nullable=True)
    user_agent_summary: Mapped[str | None] = mapped_column(String(40), nullable=True)
    status: Mapped[str] = mapped_column(String(24), default="registered")
    consent_id: Mapped[str | None] = mapped_column(ForeignKey("consent_records.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)


class Feedback(Base):
    __tablename__ = "feedback"

    id: Mapped[str] = _pk()
    user_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    ip_hash: Mapped[str | None] = mapped_column(String(40), nullable=True)
    user_agent_summary: Mapped[str | None] = mapped_column(String(40), nullable=True)
    category: Mapped[str] = mapped_column(String(24), index=True)
    message: Mapped[str] = mapped_column(Text)
    rating: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    page_slug: Mapped[str | None] = mapped_column(String(200), nullable=True)
    url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    contact_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    contact_email: Mapped[str | None] = mapped_column(String(254), nullable=True)
    status: Mapped[str] = mapped_column(String(24), default="new")
    fingerprint: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    consent_id: Mapped[str | None] = mapped_column(ForeignKey("consent_records.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)


class JobPosting(Base):
    __tablename__ = "job_postings"

    id: Mapped[str] = _pk()
    slug: Mapped[str] = mapped_column(String(80), unique=True)
    title: Mapped[str] = mapped_column(String(200))
    department: Mapped[str] = mapped_column(String(120), default="")
    location_type: Mapped[str] = mapped_column(String(24), default="remote")  # remote|hybrid|office
    location: Mapped[str] = mapped_column(String(120), default="")
    employment_type: Mapped[str] = mapped_column(String(40), default="full_time")
    description_md: Mapped[str] = mapped_column(Text, default="")
    requirements_md: Mapped[str] = mapped_column(Text, default="")
    compensation_range: Mapped[str | None] = mapped_column(String(120), nullable=True)
    status: Mapped[str] = mapped_column(String(24), default="draft")  # draft|open|closed
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class File(Base):
    __tablename__ = "files"

    id: Mapped[str] = _pk()
    purpose: Mapped[str] = mapped_column(String(24), default="cv")
    original_name: Mapped[str] = mapped_column(String(255), default="")
    storage_key: Mapped[str] = mapped_column(String(500))
    mime: Mapped[str | None] = mapped_column(String(120), nullable=True)
    size_bytes: Mapped[int] = mapped_column(Integer, default=0)
    scan_status: Mapped[str] = mapped_column(String(24), default="not_required")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class JobApplication(Base):
    __tablename__ = "job_applications"
    __table_args__ = (
        # One application per person per posting.
        UniqueConstraint("job_posting_id", "email_normalized", name="uniq_application"),
    )

    id: Mapped[str] = _pk()
    job_posting_id: Mapped[str] = mapped_column(ForeignKey("job_postings.id"), index=True)
    name: Mapped[str] = mapped_column(String(200))
    email_normalized: Mapped[str] = mapped_column(String(254), index=True)
    phone_e164: Mapped[str | None] = mapped_column(String(32), nullable=True)
    cover_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    resume_file_id: Mapped[str | None] = mapped_column(ForeignKey("files.id"), nullable=True)
    status: Mapped[str] = mapped_column(String(24), default="received")
    consent_id: Mapped[str | None] = mapped_column(ForeignKey("consent_records.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    posting = relationship("JobPosting", lazy="joined")


class ConsentRecord(Base):
    __tablename__ = "consent_records"

    id: Mapped[str] = _pk()
    user_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    email_normalized: Mapped[str | None] = mapped_column(String(254), nullable=True)
    purpose: Mapped[str] = mapped_column(String(48))  # §16.3 vocabulary
    granted: Mapped[bool] = mapped_column(Boolean, default=True)
    policy_version: Mapped[str] = mapped_column(String(24), default="1.0")
    source_page: Mapped[str | None] = mapped_column(String(200), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class IdempotencyKey(Base):
    __tablename__ = "idempotency_keys"

    key: Mapped[str] = mapped_column(String(64), primary_key=True)
    response_json: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
