"""Pydantic request/response schemas — the public contract (§13.1).

Rules: snake_case on the wire, strict input (unknown keys rejected),
length caps in characters, control characters stripped from text.
"""

from __future__ import annotations

import re
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from .utils import normalize_email

# ── Shared helpers ────────────────────────────────────────────────────────

CONTROL_CHARS_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
PHONE_RE = re.compile(r"^\+?[0-9\s\-()]{6,20}$")


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


def strip_controls(value: str) -> str:
    return CONTROL_CHARS_RE.sub("", value).strip()


# ── Waitlist ──────────────────────────────────────────────────────────────


class SourceIn(StrictModel):
    """§9.3: attribution — UTM params, page path, referrer domain only
    (never a full URL with query string, §20.2)."""
    utm_source: Optional[str] = Field(default=None, max_length=100)
    utm_medium: Optional[str] = Field(default=None, max_length=100)
    utm_campaign: Optional[str] = Field(default=None, max_length=100)
    page: Optional[str] = Field(default=None, max_length=200)
    referrer_domain: Optional[str] = Field(default=None, max_length=200)


class WaitlistIn(StrictModel):
    product_id: Optional[str] = None
    slug: Optional[str] = None
    email: str = Field(max_length=254)
    referral_code: Optional[str] = Field(default=None, max_length=64)
    source: Optional[SourceIn] = None
    consent_waitlist_contact: bool = False
    consent_marketing_email: bool = False
    turnstile_token: Optional[str] = None
    honeypot: Optional[str] = None
    client_ts: Optional[int] = None

    @field_validator("email")
    @classmethod
    def _valid_email(cls, v: str) -> str:
        normalized = normalize_email(v)
        if not normalized:
            raise ValueError("not a valid email address")
        return normalized

    @field_validator("referral_code")
    @classmethod
    def _clean_referral(cls, v: Optional[str]) -> Optional[str]:
        return strip_controls(v) if v else None


# ── Feedback ──────────────────────────────────────────────────────────────

FEEDBACK_CATEGORIES = ("website", "product", "sales", "careers", "security", "other")


class FeedbackIn(StrictModel):
    category: Literal["website", "product", "sales", "careers", "security", "other"]
    message: str = Field(min_length=10, max_length=4000)
    rating: Optional[int] = Field(default=None, ge=1, le=5)
    page_slug: Optional[str] = Field(default=None, max_length=200)
    url: Optional[str] = Field(default=None, max_length=500)
    contact_name: Optional[str] = Field(default=None, max_length=200)
    contact_email: Optional[str] = Field(default=None, max_length=254)
    turnstile_token: Optional[str] = None
    honeypot: Optional[str] = None
    client_ts: Optional[int] = None

    @field_validator("message")
    @classmethod
    def _clean_message(cls, v: str) -> str:
        return strip_controls(v)

    @field_validator("contact_email")
    @classmethod
    def _valid_contact_email(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return None
        normalized = normalize_email(v)
        if not normalized:
            raise ValueError("not a valid email address")
        return normalized

    @field_validator("url")
    @classmethod
    def _safe_url(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return None
        value = strip_controls(v)
        # Stored for context only, never fetched server-side (§10.3, SSRF guard).
        if not value.lower().startswith(("http://", "https://")):
            raise ValueError("url must start with http:// or https://")
        return value[:500]

    @field_validator("contact_name")
    @classmethod
    def _clean_name(cls, v: Optional[str]) -> Optional[str]:
        return strip_controls(v) if v else None


# ── Careers apply (multipart) ─────────────────────────────────────────────


def validate_phone(phone: Optional[str]) -> Optional[str]:
    if not phone:
        return None
    value = phone.strip()
    if not PHONE_RE.match(value):
        raise ValueError("not a valid phone number")
    return value


# ── Responses ─────────────────────────────────────────────────────────────


class WaitlistOut(StrictModel):
    entry_id: str
    product_id: str
    status: str
    already_present: bool


class FeedbackOut(StrictModel):
    id: str
    status: str
    duplicate: bool = False


class ApplyOut(StrictModel):
    application_id: str
    status: str
