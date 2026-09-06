"""FastAPI dependencies: settings, DB session, rate-limit plumbing."""

from __future__ import annotations

from typing import Iterator

from fastapi import Request
from sqlalchemy.orm import Session

from .config import Settings
from .rate_limit import Bucket, RateLimited, RateLimiter
from .utils import client_ip


def get_settings(request: Request) -> Settings:
    return request.app.state.settings


def get_session(request: Request) -> Iterator[Session]:
    factory = request.app.state.session_factory
    session = factory()
    try:
        yield session
    finally:
        session.close()


def get_limiter(request: Request) -> RateLimiter:
    return request.app.state.limiter


def require_public_read_limit(request: Request):
    """§13.4: public reads are budgeted per IP (CDN-cached in production)."""
    settings: Settings = request.app.state.settings
    ip = client_ip(request, settings.trust_proxy)
    apply_buckets(request, [Bucket(
        key=f"pubread:{ip}",
        limit=settings.public_read_per_ip_per_minute,
        window_seconds=60,
    )])


def apply_buckets(request: Request, buckets: list[Bucket]) -> tuple[dict, str | None]:
    """Run the two-phase rate-limit check; converts RateLimited into the
    uniform 429 envelope with Retry-After (§13.1)."""
    limiter: RateLimiter = request.app.state.limiter
    try:
        return limiter.check(buckets)
    except RateLimited as exc:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=429,
            detail={
                "error": {
                    "code": "rate_limited",
                    "message": f"Too many requests. Retry in {exc.retry_after}s.",
                    "request_id": request.state.request_id if hasattr(request.state, "request_id") else "",
                }
            },
            headers={"Retry-After": str(exc.retry_after), **exc.headers},
        )
