"""
Outbound email for the tournament.

SMTP is optional: when ``SMTP_HOST`` is empty every message is logged at INFO
and the platform keeps working (registration still succeeds, confirmation
content is returned to the client). Nothing here is ever fatal to a request.
"""

from __future__ import annotations

import logging
import smtplib
from email.message import EmailMessage
from typing import Iterable

from ..config import Settings

logger = logging.getLogger("qra.tournament.mail")


class EmailResult:
    def __init__(self, sent: bool, provider: str, detail: str = "") -> None:
        self.sent = sent
        self.provider = provider
        self.detail = detail

    def as_dict(self) -> dict:
        return {"sent": self.sent, "provider": self.provider, "detail": self.detail}


def _send(settings: Settings, to: str, subject: str, body: str) -> EmailResult:
    if not settings.smtp_enabled:
        logger.info("[email disabled] to=%s subject=%s\n%s", to, subject, body)
        return EmailResult(False, "log", "SMTP_HOST is not configured — message logged only.")

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = settings.smtp_from
    message["To"] = to
    message.set_content(body)

    try:
        with smtplib.SMTP(settings.smtp_host, int(settings.smtp_port), timeout=10) as server:
            if settings.smtp_starttls:
                server.starttls()
            if settings.smtp_user:
                server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(message)
        return EmailResult(True, "smtp", "")
    except Exception as exc:  # pragma: no cover - depends on network
        logger.warning("Email delivery failed to %s: %s", to, exc)
        return EmailResult(False, "smtp_error", str(exc))


def send_one_time_code(settings: Settings, email: str, code: str) -> EmailResult:
    body = (
        f"Your verification code for {settings.__class__.__name__ and 'MTT'} is:\n\n"
        f"    {code}\n\n"
        "It expires in "
        f"{settings.mtt_otp_ttl_minutes} minutes. If you did not request it, "
        "you can ignore this message.\n\n"
        "— Quant Relic Analytics Private Limited"
    )
    return _send(settings, email, "Your MTT sign-in code", body)


def send_registration_confirmation(
    settings: Settings,
    *,
    email: str,
    name: str,
    registration_id: str,
    college_name: str | None,
    status: str,
    event_name: str,
    dashboard_url: str,
) -> EmailResult:
    lines: Iterable[str] = (
        f"Hi {name},",
        "",
        f"Your registration for {event_name} has been received.",
        "",
        f"  Registration ID : {registration_id}",
        f"  College         : {college_name or '—'}",
        f"  Status          : {status.replace('_', ' ').title()}",
        "",
        f"Track your entry, announcements and next steps: {dashboard_url}",
        "",
        "Registration does not by itself confirm a tournament slot — your "
        "entry is reviewed and the status above always reflects the current "
        "decision.",
        "",
        "— Quant Relic Analytics Private Limited",
    )
    return _send(
        settings, email, f"MTT registration received — {registration_id}", "\n".join(lines)
    )
