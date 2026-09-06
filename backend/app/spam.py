"""Spam & abuse protection (§10.3): honeypot, minimum submit time,
disposable-email block, optional Cloudflare Turnstile verification."""

from __future__ import annotations

import logging
import time

import httpx

from .config import Settings

logger = logging.getLogger("qra")


class SpamScreen:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def is_screened(self, body: dict) -> bool:
        """Honeypot filled, or submitted faster than a human can type.

        Returns True when the submission should be silently dropped
        (respond 200 with no write — §10.3)."""
        honeypot_name = self.settings.honeypot_field_name
        if body.get(honeypot_name):
            return True
        min_seconds = self.settings.min_submit_time_seconds
        if min_seconds > 0:
            client_ts = body.get("client_ts")
            if isinstance(client_ts, (int, float)) and client_ts > 0:
                elapsed = (time.time() * 1000 - client_ts) / 1000
                if elapsed < min_seconds:
                    return True
        return False


def verify_turnstile(settings: Settings, token: str | None) -> bool:
    """Server-side Turnstile check (§9.1 step 1). When TURNSTILE_SECRET_KEY
    is empty (local development) verification is skipped — configure the
    key to enable it."""
    if not settings.turnstile_secret_key:
        return True
    if not token:
        return False
    try:
        response = httpx.post(
            settings.turnstile_verify_url,
            data={"secret": settings.turnstile_secret_key, "response": token},
            timeout=5.0,
        )
        data = response.json()
        return bool(data.get("success"))
    except Exception as exc:
        logger.warning("Turnstile verification failed: %s", exc)
        return False
