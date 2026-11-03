"""Tournament request/response schemas.

Same contract rules as the rest of the platform (§13.1/§15.3): snake_case on
the wire, unknown keys rejected, explicit length caps, control characters
stripped, strict status vocabularies.
"""

from __future__ import annotations

import re
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from ..schemas import StrictModel, strip_controls
from ..utils import normalize_email

# ── Vocabularies ─────────────────────────────────────────────────────────

REGISTRATION_STATUSES = (
    "draft",
    "email_verification_pending",
    "submitted",
    "under_review",
    "approved",
    "rejected",
    "waitlisted",
    "cancelled",
)

ADMIN_SETABLE_STATUSES = (
    "submitted",
    "under_review",
    "approved",
    "rejected",
    "waitlisted",
    "cancelled",
)

SPONSOR_CATEGORIES = (
    "title_sponsor",
    "associate_sponsor",
    "event_partner",
    "supporting_partner",
    "other_partner",
)

ANNOUNCEMENT_CATEGORIES = (
    "general",
    "registrations",
    "qualifying_rounds",
    "reminder",
    "rules",
)

CONSENT_PURPOSES = (
    "mtt_event_participation",
    "mtt_privacy_policy",
    "mtt_marketing_email",
)

MOBILE_RE = re.compile(r"^[0-9]{10,15}$")
ACADEMIC_YEARS = (
    "First year",
    "Second year",
    "Third year",
    "Fourth year",
    "Fifth year",
    "Postgraduate",
    "Other",
)


def _clean(value: Optional[str], limit: int | None = None) -> Optional[str]:
    if value is None:
        return None
    cleaned = strip_controls(value)
    if limit:
        cleaned = cleaned[:limit]
    return cleaned or None


# ── Public responses ─────────────────────────────────────────────────────


class OutModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class PrizeTierOut(OutModel):
    key: str
    label: str
    amount: int
    count: int
    kind: str
    note: Optional[str] = None


class TournamentConfigOut(OutModel):
    slug: str
    name: str
    short_name: str
    organizer: str
    tagline: str
    hero_headline: str
    hero_subhead: str
    status_label: str
    participation_type: str
    qualifying_format: str
    location_context: str
    currency: str
    prize_pool_total: int
    cash_prize_pool: int
    goodies_and_merchandise: int
    champion_prize: int
    first_runner_up_prize: int
    second_runner_up_prize: int
    merit_prize_count: int
    merit_prize_amount: int
    merit_prize_total: int
    prize_tiers: list[PrizeTierOut]
    event_starts_at: Optional[str] = None
    registration_opens_at: Optional[str] = None
    registration_closes_at: Optional[str] = None
    venue: Optional[str] = None
    eligibility: Optional[str] = None
    competition_format: Optional[str] = None
    qualifying_round_info: Optional[str] = None
    final_round_info: Optional[str] = None
    description: Optional[str] = None
    rules_md: Optional[str] = None
    registrations_open: bool
    auto_approve_registrations: bool
    leaderboard_enabled: bool
    contact_email: Optional[str] = None
    updated_at: Optional[str] = None
    # Real counts, computed from the database (never fabricated content).
    college_count: int = 0
    sponsor_count: int = 0
    registration_count: int = 0


class CollegeOut(OutModel):
    id: str
    name: str
    location: Optional[str] = None
    logo_url: Optional[str] = None
    description: Optional[str] = None
    is_active: bool
    accepts_registrations: bool
    display_order: int = 0
    registration_count: int = 0
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class SponsorOut(OutModel):
    id: str
    name: str
    logo_url: Optional[str] = None
    website_url: Optional[str] = None
    category: str
    display_order: int
    is_active: bool


class AnnouncementOut(OutModel):
    id: str
    title: str
    body_md: str
    category: str
    pinned: bool
    is_published: bool
    published_at: Optional[str] = None


class LeaderboardEntryOut(OutModel):
    id: str
    display_name: str
    college_name: Optional[str] = None
    score: Optional[float] = None
    rank: Optional[int] = None
    qualification_status: Optional[str] = None
    note: Optional[str] = None
    updated_at: Optional[str] = None


class LeaderboardOut(OutModel):
    enabled: bool
    updated_at: Optional[str] = None
    entries: list[LeaderboardEntryOut]


# ── Identity ─────────────────────────────────────────────────────────────


class OtpRequestIn(StrictModel):
    email: str = Field(max_length=254)
    turnstile_token: Optional[str] = None
    client_ts: Optional[int] = None

    @field_validator("email")
    @classmethod
    def _email(cls, v: str) -> str:
        normalized = normalize_email(v)
        if not normalized:
            raise ValueError("not a valid email address")
        return normalized


class OtpVerifyIn(StrictModel):
    email: str = Field(max_length=254)
    code: str = Field(min_length=4, max_length=12)

    @field_validator("email")
    @classmethod
    def _email(cls, v: str) -> str:
        normalized = normalize_email(v)
        if not normalized:
            raise ValueError("not a valid email address")
        return normalized

    @field_validator("code")
    @classmethod
    def _code(cls, v: str) -> str:
        return re.sub(r"[^0-9]", "", v)


class ParticipantOut(OutModel):
    id: str
    email: str
    email_verified: bool
    full_name: Optional[str] = None
    is_admin: bool = False
    created_at: Optional[str] = None


class SessionOut(OutModel):
    signed_in: bool
    participant: Optional[ParticipantOut] = None
    registration: Optional["RegistrationOut"] = None
    auth_provider: str = "otp"


# ── Registration ─────────────────────────────────────────────────────────


class RegistrationIn(StrictModel):
    full_name: str = Field(min_length=2, max_length=200)
    email: str = Field(max_length=254)
    mobile: str = Field(min_length=10, max_length=15)
    college_id: str = Field(min_length=1, max_length=36)
    course: Optional[str] = Field(default=None, max_length=120)
    academic_year: Optional[str] = Field(default=None, max_length=40)
    city: Optional[str] = Field(default=None, max_length=120)
    consent_event_participation: bool = False
    consent_privacy_policy: bool = False
    consent_marketing_email: bool = False
    turnstile_token: Optional[str] = None
    honeypot: Optional[str] = None
    client_ts: Optional[int] = None

    @field_validator("email")
    @classmethod
    def _email(cls, v: str) -> str:
        normalized = normalize_email(v)
        if not normalized:
            raise ValueError("not a valid email address")
        return normalized

    @field_validator("full_name", "course", "city", "academic_year")
    @classmethod
    def _clean_text(cls, v: Optional[str]) -> Optional[str]:
        return _clean(v)

    @field_validator("mobile")
    @classmethod
    def _mobile(cls, v: str) -> str:
        digits = re.sub(r"[^0-9]", "", v or "")
        # Accept a leading Indian country code, then require 10 digits.
        if len(digits) == 12 and digits.startswith("91"):
            digits = digits[2:]
        if len(digits) == 11 and digits.startswith("0"):
            digits = digits[1:]
        if not MOBILE_RE.match(digits):
            raise ValueError("enter a valid 10-digit mobile number")
        return digits


class RegistrationUpdateIn(StrictModel):
    """Participants may correct their own details until the entry is
    approved; college changes are re-validated against the live list."""

    full_name: Optional[str] = Field(default=None, min_length=2, max_length=200)
    mobile: Optional[str] = Field(default=None, min_length=10, max_length=15)
    college_id: Optional[str] = Field(default=None, min_length=1, max_length=36)
    course: Optional[str] = Field(default=None, max_length=120)
    academic_year: Optional[str] = Field(default=None, max_length=40)
    city: Optional[str] = Field(default=None, max_length=120)

    @field_validator("full_name", "course", "city", "academic_year")
    @classmethod
    def _clean_text(cls, v: Optional[str]) -> Optional[str]:
        return _clean(v)

    @field_validator("mobile")
    @classmethod
    def _mobile(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        digits = re.sub(r"[^0-9]", "", v)
        if len(digits) == 12 and digits.startswith("91"):
            digits = digits[2:]
        if not MOBILE_RE.match(digits):
            raise ValueError("enter a valid 10-digit mobile number")
        return digits


class ConsentOut(OutModel):
    purpose: str
    granted: bool
    policy_version: str
    created_at: Optional[str] = None


class RegistrationOut(OutModel):
    id: str
    registration_id: str
    status: str
    full_name: str
    email: str
    mobile: Optional[str] = None
    college_id: Optional[str] = None
    college_name: Optional[str] = None
    college_location: Optional[str] = None
    college_logo_url: Optional[str] = None
    course: Optional[str] = None
    academic_year: Optional[str] = None
    city: Optional[str] = None
    email_verified: bool
    status_note: Optional[str] = None
    reviewed_at: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    consents: list[ConsentOut] = []


class RegistrationAcceptedOut(OutModel):
    registration: RegistrationOut
    already_registered: bool = False
    message: str = ""


# ── Admin: colleges ──────────────────────────────────────────────────────


class CollegeIn(StrictModel):
    name: str = Field(min_length=2, max_length=200)
    location: Optional[str] = Field(default=None, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    is_active: bool = True
    accepts_registrations: bool = True
    display_order: int = Field(default=0, ge=0, le=9999)

    @field_validator("name", "location")
    @classmethod
    def _clean_text(cls, v: Optional[str]) -> Optional[str]:
        return _clean(v)

    @field_validator("description")
    @classmethod
    def _clean_desc(cls, v: Optional[str]) -> Optional[str]:
        return _clean(v, 2000)


class CollegeUpdateIn(StrictModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=200)
    location: Optional[str] = Field(default=None, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    logo_url: Optional[str] = Field(default=None, max_length=500)
    is_active: Optional[bool] = None
    accepts_registrations: Optional[bool] = None
    display_order: Optional[int] = Field(default=None, ge=0, le=9999)

    @field_validator("name", "location")
    @classmethod
    def _clean_text(cls, v: Optional[str]) -> Optional[str]:
        return _clean(v)


class SponsorIn(StrictModel):
    name: str = Field(min_length=2, max_length=200)
    website_url: Optional[str] = Field(default=None, max_length=500)
    category: str = "other_partner"
    display_order: int = Field(default=0, ge=0, le=9999)
    is_active: bool = True

    @field_validator("name")
    @classmethod
    def _clean_text(cls, v: Optional[str]) -> Optional[str]:
        return _clean(v)

    @field_validator("category")
    @classmethod
    def _category(cls, v: str) -> str:
        if v not in SPONSOR_CATEGORIES:
            raise ValueError(f"category must be one of: {', '.join(SPONSOR_CATEGORIES)}")
        return v

    @field_validator("website_url")
    @classmethod
    def _url(cls, v: Optional[str]) -> Optional[str]:
        value = _clean(v, 500)
        if value and not value.lower().startswith(("http://", "https://")):
            raise ValueError("website_url must start with http:// or https://")
        return value


class SponsorUpdateIn(StrictModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=200)
    website_url: Optional[str] = Field(default=None, max_length=500)
    logo_url: Optional[str] = Field(default=None, max_length=500)
    category: Optional[str] = None
    display_order: Optional[int] = Field(default=None, ge=0, le=9999)
    is_active: Optional[bool] = None

    @field_validator("name")
    @classmethod
    def _clean_text(cls, v: Optional[str]) -> Optional[str]:
        return _clean(v)

    @field_validator("category")
    @classmethod
    def _category(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in SPONSOR_CATEGORIES:
            raise ValueError(f"category must be one of: {', '.join(SPONSOR_CATEGORIES)}")
        return v

    @field_validator("website_url")
    @classmethod
    def _url(cls, v: Optional[str]) -> Optional[str]:
        value = _clean(v, 500)
        if value and not value.lower().startswith(("http://", "https://")):
            raise ValueError("website_url must start with http:// or https://")
        return value


# ── Admin: configuration ─────────────────────────────────────────────────


class PrizeTierIn(StrictModel):
    key: str = Field(max_length=40)
    label: str = Field(max_length=120)
    amount: int = Field(ge=0)
    count: int = Field(ge=1, default=1)
    kind: Literal["cash", "goodies"] = "cash"
    note: Optional[str] = Field(default=None, max_length=200)


class TournamentConfigUpdateIn(StrictModel):
    tagline: Optional[str] = Field(default=None, max_length=200)
    hero_headline: Optional[str] = Field(default=None, max_length=160)
    hero_subhead: Optional[str] = Field(default=None, max_length=400)
    status_label: Optional[str] = Field(default=None, max_length=120)
    participation_type: Optional[str] = Field(default=None, max_length=60)
    qualifying_format: Optional[str] = Field(default=None, max_length=200)
    location_context: Optional[str] = Field(default=None, max_length=120)
    currency: Optional[str] = Field(default=None, max_length=8)

    prize_pool_total: Optional[int] = Field(default=None, ge=0)
    cash_prize_pool: Optional[int] = Field(default=None, ge=0)
    goodies_and_merchandise: Optional[int] = Field(default=None, ge=0)
    champion_prize: Optional[int] = Field(default=None, ge=0)
    first_runner_up_prize: Optional[int] = Field(default=None, ge=0)
    second_runner_up_prize: Optional[int] = Field(default=None, ge=0)
    merit_prize_count: Optional[int] = Field(default=None, ge=0)
    merit_prize_amount: Optional[int] = Field(default=None, ge=0)
    merit_prize_total: Optional[int] = Field(default=None, ge=0)
    prize_tiers: Optional[list[PrizeTierIn]] = None

    event_starts_at: Optional[str] = Field(default=None, max_length=40)
    registration_opens_at: Optional[str] = Field(default=None, max_length=40)
    registration_closes_at: Optional[str] = Field(default=None, max_length=40)
    venue: Optional[str] = Field(default=None, max_length=300)
    eligibility: Optional[str] = Field(default=None, max_length=4000)
    competition_format: Optional[str] = Field(default=None, max_length=4000)
    qualifying_round_info: Optional[str] = Field(default=None, max_length=4000)
    final_round_info: Optional[str] = Field(default=None, max_length=4000)
    description: Optional[str] = Field(default=None, max_length=4000)
    rules_md: Optional[str] = Field(default=None, max_length=20000)
    contact_email: Optional[str] = Field(default=None, max_length=254)

    registrations_open: Optional[bool] = None
    auto_approve_registrations: Optional[bool] = None
    leaderboard_enabled: Optional[bool] = None

    @field_validator("contact_email")
    @classmethod
    def _contact_email(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return None
        normalized = normalize_email(v)
        if not normalized:
            raise ValueError("not a valid email address")
        return normalized

    @field_validator(
        "tagline",
        "hero_headline",
        "hero_subhead",
        "status_label",
        "participation_type",
        "qualifying_format",
        "location_context",
        "venue",
    )
    @classmethod
    def _clean_text(cls, v: Optional[str]) -> Optional[str]:
        return _clean(v)

    # NOTE: prize reconciliation is intentionally NOT validated here. Partial
    # updates are merged against the stored record in the service layer, which
    # raises `prize_pool_mismatch` with a stable error code.


# ── Admin: registrations, announcements, leaderboard ─────────────────────


class RegistrationStatusIn(StrictModel):
    status: str
    status_note: Optional[str] = Field(default=None, max_length=2000)

    @field_validator("status")
    @classmethod
    def _status(cls, v: str) -> str:
        if v not in ADMIN_SETABLE_STATUSES:
            raise ValueError(f"status must be one of: {', '.join(ADMIN_SETABLE_STATUSES)}")
        return v


class AnnouncementIn(StrictModel):
    title: str = Field(min_length=2, max_length=200)
    body_md: str = Field(max_length=8000)
    category: str = "general"
    pinned: bool = False
    is_published: bool = True

    @field_validator("title")
    @classmethod
    def _clean_text(cls, v: Optional[str]) -> Optional[str]:
        return _clean(v)

    @field_validator("category")
    @classmethod
    def _category(cls, v: str) -> str:
        if v not in ANNOUNCEMENT_CATEGORIES:
            raise ValueError(f"category must be one of: {', '.join(ANNOUNCEMENT_CATEGORIES)}")
        return v


class AnnouncementUpdateIn(StrictModel):
    title: Optional[str] = Field(default=None, min_length=2, max_length=200)
    body_md: Optional[str] = Field(default=None, max_length=8000)
    category: Optional[str] = None
    pinned: Optional[bool] = None
    is_published: Optional[bool] = None

    @field_validator("category")
    @classmethod
    def _category(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in ANNOUNCEMENT_CATEGORIES:
            raise ValueError(f"category must be one of: {', '.join(ANNOUNCEMENT_CATEGORIES)}")
        return v


class LeaderboardEntryIn(StrictModel):
    registration_id: Optional[str] = Field(default=None, max_length=36)
    display_name: str = Field(min_length=1, max_length=200)
    college_id: Optional[str] = Field(default=None, max_length=36)
    college_name: Optional[str] = Field(default=None, max_length=200)
    score: Optional[float] = None
    rank: Optional[int] = Field(default=None, ge=1)
    qualification_status: Optional[str] = Field(default=None, max_length=40)
    note: Optional[str] = Field(default=None, max_length=300)

    @field_validator("display_name", "college_name", "note")
    @classmethod
    def _clean_text(cls, v: Optional[str]) -> Optional[str]:
        return _clean(v)


class AuditLogOut(OutModel):
    id: str
    actor_email: Optional[str] = None
    action: str
    entity: str
    entity_id: Optional[str] = None
    detail_json: Optional[str] = None
    created_at: Optional[str] = None


class AdminOverviewOut(OutModel):
    total_registrations: int
    by_status: dict[str, int]
    by_college: list[dict[str, object]]
    pending_approvals: int
    approved: int
    active_colleges: int
    total_colleges: int
    sponsor_count: int
    published_announcements: int
    registrations_last_7_days: list[dict[str, object]]
    leaderboard_enabled: bool
    registrations_open: bool


class UploadOut(OutModel):
    url: str
    storage_key: str
    size_bytes: int
    content_type: str
