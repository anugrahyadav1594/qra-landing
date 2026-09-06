"""Small shared helpers: UUIDv7 ids, email normalization, client hints."""

import hashlib
import re
import secrets
import time
import unicodedata
import uuid
from datetime import datetime, timezone

# ── Identifiers ───────────────────────────────────────────────────────────
# ADR-002: UUIDv7, app-generated, time-ordered, unguessable. Never sequential.


def uuid7() -> str:
    """UUIDv7: 48-bit unix-milliseconds timestamp + 74 bits of randomness."""
    millis = int(time.time() * 1000)
    rand = secrets.token_bytes(10)
    b = bytearray(16)
    b[0:6] = millis.to_bytes(6, "big")
    b[6] = 0x70 | (rand[0] & 0x0F)  # version 7
    b[7] = rand[1]
    b[8] = 0x80 | (rand[2] & 0x3F)  # RFC 4122 variant
    b[9:16] = rand[3:10]
    return str(uuid.UUID(bytes=bytes(b)))


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def utcnow() -> datetime:
    """Naive UTC now — used for SQLite datetime columns (kept consistent
    everywhere so arithmetic between columns and code never mixes
    offset-naive with offset-aware values)."""
    return datetime.utcnow()


def sha256_hex(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def ip_hash(ip: str, pepper: str = "local-dev-pepper") -> str:
    """§8.1: IP addresses are stored hashed (HMAC-grade), never raw."""
    return sha256_hex(f"{pepper}|{ip}")[:40]


# ── Email normalization (§9.4) ────────────────────────────────────────────
# lowercase + trim + NFC unicode normalization. Plus-tags are deliberately
# kept (users use them on purpose).

EMAIL_RE = re.compile(r"^[^@\s]{1,64}@[^@\s]{1,255}$")

DISPOSABLE_DOMAINS = {
    "10minutemail.com", "mailinator.com", "guerrillamail.com", "tempmail.com",
    "throwawaymail.com", "sharklasers.com", "yopmail.com", "getnada.com",
    "dispostable.com", "maildrop.cc", "temp-mail.org", "fakeinbox.com",
    "trashmail.com", "mintemail.com", "spam4.me", "mailnesia.com",
    "grr.la", "emailondeck.com", "mohmal.com", "0-mail.com",
    "tempmail.ninja", "tempmail.de", "mailcatch.com", "inboxalias.com",
    "oneoffemail.com", "spambox.us", "boun.cr", "mailsac.com",
    "burnermail.io", "temporary-mail.net", "dropmail.me", "anonaddy.com",
    "simplelogin.com",
}


def normalize_email(email: str | None) -> str | None:
    if not email:
        return None
    value = unicodedata.normalize("NFC", email.strip().lower())
    return value if EMAIL_RE.match(value) else None


def is_disposable_email(email: str, extra: list[str] | None = None) -> bool:
    domain = email.rsplit("@", 1)[-1]
    return domain in DISPOSABLE_DOMAINS or domain in (extra or [])


# ── Client hints ──────────────────────────────────────────────────────────


def client_ip(request, trust_proxy: bool) -> str:
    """Derive the client IP. Behind a proxy/edge we only trust the proxy
    header (X-Forwarded-For first hop, or Cloudflare CF-Connecting-IP);
    never a raw user-supplied X-Forwarded-For when trust_proxy is off."""
    if trust_proxy:
        cf_ip = request.headers.get("cf-connecting-ip")
        if cf_ip:
            return cf_ip.strip()
        xff = request.headers.get("x-forwarded-for")
        if xff:
            return xff.split(",")[0].strip()
    host = getattr(getattr(request, "client", None), "host", None)
    return host or "unknown"


UA_PATTERNS = [
    ("chrome", "Chrome"), ("firefox", "Firefox"), ("safari", "Safari"),
    ("edge", "Edge"), ("opera", "Opera"), ("curl", "curl"),
]


def user_agent_summary(user_agent: str | None) -> str:
    """Browser family only — never the raw UA string (§20.2)."""
    ua = (user_agent or "").lower()
    for token, label in UA_PATTERNS:
        if token in ua:
            return label
    return "other"
