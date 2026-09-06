"""
Application configuration.

EVERY numeric budget (rate limits, user/capacity limits) is read from the
environment / .env file — nothing is hard-coded in the business logic.

Default values are the "initial budgets" from ARCHITECTURE.md (marked
*tune from staging*), overridable via `.env`:

  - waitlist budgets ........... §9.7
  - feedback budgets ........... §10.1 / §10.3
  - auth/OTP budgets ........... §11.4 / §11.6
  - general API budgets ........ §13.4
  - capacity model ............. §22.3 (assumption A2)
"""

from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        # Look for .env in the backend dir, the repo root, or the parent dir,
        # depending on where the process is started from. Real environment
        # variables always win over .env values.
        env_file=(".env", "../.env", "../../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # ── Server ────────────────────────────────────────────────────────────
    environment: str = "development"
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    database_url: str = "sqlite:///./data/qra.db"
    redis_url: str = ""  # optional; empty = in-memory rate limiter
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    trust_proxy: bool = True  # take client IP from X-Forwarded-For / CF-Connecting-IP
    enforce_origin_check: bool = False  # §15.9; enable in production

    # ── Capacity / user limits (§22.3, assumption A2) ─────────────────────
    max_registered_users: int = 50_000  # Phase-4 gate: cap on created users
    max_concurrent_sessions: int = 2_000  # active in-flight requests (503 above)
    sustained_requests_per_second: int = 40
    burst_requests_per_second: int = 300
    burst_window_seconds: int = 300
    max_waitlist_entries: int = 50_000  # total waitlist rows across products

    # ── Rate limits: waitlist (§9.7) ──────────────────────────────────────
    waitlist_per_ip_per_hour: int = 10
    waitlist_per_ip_per_minute: int = 3
    waitlist_per_email_per_day: int = 30
    waitlist_per_email_per_hour: int = 5
    waitlist_per_product_per_day: int = 200

    # ── Rate limits: feedback (§10.1, §10.3) ─────────────────────────────
    feedback_per_ip_per_minute: int = 5
    feedback_per_ip_per_day: int = 20
    feedback_per_user_per_day: int = 20
    feedback_authenticated_per_day: int = 100  # authed users, no Turnstile
    feedback_security_category_per_ip_per_day: int = 5

    # ── Rate limits: auth / OTP budgets (§11.4, §11.6) ───────────────────
    otp_code_ttl_minutes: int = 5
    otp_max_verify_attempts: int = 5
    otp_verify_lockout_minutes: int = 15
    otp_requests_per_phone_per_15_min: int = 3
    otp_requests_per_phone_per_day: int = 5
    otp_requests_per_ip_per_hour: int = 10
    otp_request_cooldown_seconds: int = 60
    signin_attempts_per_ip_per_15_min: int = 10
    signin_attempts_per_user_per_day: int = 10

    # ── Rate limits: general API (§13.4) ─────────────────────────────────
    public_read_per_ip_per_minute: int = 120
    authed_api_per_user_per_minute: int = 300
    identity_api_per_client_per_minute: int = 100
    identity_api_per_client_per_day: int = 1_000
    admin_api_per_admin_per_minute: int = 60
    upload_presign_per_user_per_hour: int = 10
    export_per_user_per_day: int = 1
    delete_requests_per_ip_per_day: int = 2

    # ── Rate limits: careers ──────────────────────────────────────────────
    careers_apply_per_ip_per_hour: int = 5

    # ── Spam protection (§10.3) ───────────────────────────────────────────
    honeypot_field_name: str = "company_website"
    min_submit_time_seconds: int = 3  # 0 disables the check
    block_disposable_emails: bool = True
    disposable_domains_extra: str = ""  # comma-separated additions

    # ── Idempotency & dedupe ──────────────────────────────────────────────
    idempotency_key_ttl_hours: int = 24  # §9.5
    feedback_dedupe_window_hours: int = 24  # §10.2

    # ── Cloudflare Turnstile (skipped while secret is empty) ─────────────
    turnstile_secret_key: str = ""
    turnstile_verify_url: str = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

    # ── Uploads (careers CV; §14.4 v1: PDF only) ─────────────────────────
    max_resume_size_mb: int = 10
    max_cover_note_chars: int = 4_000
    upload_dir: str = "uploads"

    # ── Consent (purpose vocabulary §16.3) ────────────────────────────────
    policy_version: str = "1.0"

    # ── Content limits (validation caps; §15.3) ───────────────────────────
    feedback_message_max_chars: int = 4_000
    feedback_message_min_chars: int = 10
    feedback_url_max_chars: int = 500
    referral_code_max_chars: int = 64
    name_max_chars: int = 200

    @property
    def cors_origin_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.environment.lower() in ("production", "prod")

    @property
    def disposable_domains_extra_list(self) -> List[str]:
        return [d.strip().lower() for d in self.disposable_domains_extra.split(",") if d.strip()]

    def limits_snapshot(self) -> dict:
        """All tunable budget values, exposed by /api/v1/health/deep so the
        effective configuration can be verified without reading code."""
        return {
            "max_registered_users": self.max_registered_users,
            "max_concurrent_sessions": self.max_concurrent_sessions,
            "sustained_requests_per_second": self.sustained_requests_per_second,
            "burst_requests_per_second": self.burst_requests_per_second,
            "burst_window_seconds": self.burst_window_seconds,
            "max_waitlist_entries": self.max_waitlist_entries,
            "waitlist_per_ip_per_hour": self.waitlist_per_ip_per_hour,
            "waitlist_per_ip_per_minute": self.waitlist_per_ip_per_minute,
            "waitlist_per_email_per_day": self.waitlist_per_email_per_day,
            "waitlist_per_email_per_hour": self.waitlist_per_email_per_hour,
            "waitlist_per_product_per_day": self.waitlist_per_product_per_day,
            "feedback_per_ip_per_minute": self.feedback_per_ip_per_minute,
            "feedback_per_ip_per_day": self.feedback_per_ip_per_day,
            "feedback_per_user_per_day": self.feedback_per_user_per_day,
            "feedback_authenticated_per_day": self.feedback_authenticated_per_day,
            "feedback_security_category_per_ip_per_day": self.feedback_security_category_per_ip_per_day,
            "otp_code_ttl_minutes": self.otp_code_ttl_minutes,
            "otp_max_verify_attempts": self.otp_max_verify_attempts,
            "otp_verify_lockout_minutes": self.otp_verify_lockout_minutes,
            "otp_requests_per_phone_per_15_min": self.otp_requests_per_phone_per_15_min,
            "otp_requests_per_phone_per_day": self.otp_requests_per_phone_per_day,
            "otp_requests_per_ip_per_hour": self.otp_requests_per_ip_per_hour,
            "otp_request_cooldown_seconds": self.otp_request_cooldown_seconds,
            "signin_attempts_per_ip_per_15_min": self.signin_attempts_per_ip_per_15_min,
            "signin_attempts_per_user_per_day": self.signin_attempts_per_user_per_day,
            "public_read_per_ip_per_minute": self.public_read_per_ip_per_minute,
            "authed_api_per_user_per_minute": self.authed_api_per_user_per_minute,
            "identity_api_per_client_per_minute": self.identity_api_per_client_per_minute,
            "identity_api_per_client_per_day": self.identity_api_per_client_per_day,
            "admin_api_per_admin_per_minute": self.admin_api_per_admin_per_minute,
            "upload_presign_per_user_per_hour": self.upload_presign_per_user_per_hour,
            "export_per_user_per_day": self.export_per_user_per_day,
            "delete_requests_per_ip_per_day": self.delete_requests_per_ip_per_day,
            "careers_apply_per_ip_per_hour": self.careers_apply_per_ip_per_hour,
            "min_submit_time_seconds": self.min_submit_time_seconds,
            "max_resume_size_mb": self.max_resume_size_mb,
        }


@lru_cache
def get_settings() -> Settings:
    return Settings()
