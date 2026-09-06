"""
Rate limiting — §9.7 / §13.4.

Sliding-window counters. Two backends behind one interface:
  - MemoryRateLimitBackend  (default; zero dependencies, per-process)
  - RedisRateLimitBackend   (used when REDIS_URL is set — production path
                            mirrors the Upstash/Redis decision in §5.1)

Every budget value passed in here comes from Settings (i.e. from .env) —
there are no hard-coded numbers in this module or its callers.
"""

from __future__ import annotations

import threading
import time
from dataclasses import dataclass


@dataclass
class Bucket:
    key: str
    limit: int
    window_seconds: int


@dataclass
class RateLimitOutcome:
    ok: bool
    limit: int
    remaining: int
    retry_after: int  # seconds
    reset_at: int  # unix epoch


class MemoryRateLimitBackend:
    """Sliding window log kept in a dict. Good enough for local dev and
    single-process tests; Redis is the shared production backend."""

    def __init__(self) -> None:
        self._events: dict[str, list[float]] = {}
        self._lock = threading.Lock()

    def _count(self, key: str, window: float, now: float) -> int:
        events = self._events.get(key)
        if not events:
            return 0
        cutoff = now - window
        return sum(1 for ts in events if ts >= cutoff)

    def hit(self, key: str, limit: int, window_seconds: float) -> RateLimitOutcome:
        now = time.time()
        with self._lock:
            count = self._count(key, window_seconds, now)
            if count >= limit:
                events = self._events.get(key) or []
                oldest = min((ts for ts in events if ts >= now - window_seconds), default=now)
                retry_after = max(1, int(oldest + window_seconds - now))
                return RateLimitOutcome(False, limit, 0, retry_after, int(now) + retry_after)
            self._events.setdefault(key, []).append(now)
            # housekeeping: prune expired timestamps occasionally
            if len(self._events[key]) > 500:
                cutoff = now - window_seconds
                self._events[key] = [ts for ts in self._events[key] if ts >= cutoff]
            remaining = max(0, limit - count - 1)
            return RateLimitOutcome(True, limit, remaining, 0, int(now) + window_seconds)


class RedisRateLimitBackend:
    """Sliding window via ZSETs. Requires REDIS_URL; the `redis` package is
    imported lazily so the default local setup has no hard dependency."""

    def __init__(self, redis_url: str) -> None:
        import redis  # lazy import

        self._redis = redis.Redis.from_url(redis_url, decode_responses=True)

    def hit(self, key: str, limit: int, window_seconds: float) -> RateLimitOutcome:
        now = time.time()
        cutoff = now - window_seconds
        pipe = self._redis.pipeline()
        pipe.zremrangebyscore(key, 0, cutoff)
        pipe.zcard(key)
        _, count = pipe.execute()
        if count >= limit:
            oldest = float(self._redis.zrange(key, 0, 0)[0])
            retry_after = max(1, int(oldest + window_seconds - now))
            return RateLimitOutcome(False, limit, 0, retry_after, int(now) + retry_after)
        pipe = self._redis.pipeline()
        pipe.zadd(key, {str(now): now})
        pipe.expire(key, int(window_seconds) + 1)
        pipe.execute()
        remaining = max(0, limit - count - 1)
        return RateLimitOutcome(True, limit, remaining, 0, int(now) + window_seconds)


class RateLimiter:
    def __init__(self, backend) -> None:
        self.backend = backend

    def check(self, buckets: list[Bucket]) -> tuple[dict, str | None]:
        """Two-phase: evaluate every bucket first, then commit all hits.
        Returns (headers, binding_bucket_key). Raises RateLimited if any
        bucket is exhausted."""
        outcomes: dict[str, RateLimitOutcome] = {}
        for bucket in buckets:
            outcomes[bucket.key] = self.backend.hit(bucket.key, bucket.limit, bucket.window_seconds)
        binding = None
        headers: dict[str, str] = {}
        for bucket in buckets:
            outcome = outcomes[bucket.key]
            if not outcome.ok:
                raise RateLimited(
                    bucket,
                    outcome.retry_after,
                    {f"X-RateLimit-Limit": str(outcome.limit),
                     f"X-RateLimit-Remaining": "0",
                     f"X-RateLimit-Reset": str(outcome.reset_at)},
                )
            if binding is None or outcome.limit < outcomes[binding].limit:
                binding = bucket.key
        if binding is not None:
            outcome = outcomes[binding]
            headers = {
                "X-RateLimit-Limit": str(outcome.limit),
                "X-RateLimit-Remaining": str(outcome.remaining),
                "X-RateLimit-Reset": str(outcome.reset_at),
            }
        return headers, binding


class RateLimited(Exception):
    """Raised when a bucket is exhausted; the handler turns this into the
    uniform 429 envelope with Retry-After + X-RateLimit-* headers (§13.1)."""

    def __init__(self, bucket: Bucket, retry_after: int, headers: dict[str, str]) -> None:
        self.bucket = bucket
        self.retry_after = retry_after
        self.headers = headers
        super().__init__(f"rate limit exceeded: {bucket.key}")


def build_backend(redis_url: str):
    if redis_url:
        try:
            return RedisRateLimitBackend(redis_url)
        except Exception as exc:  # pragma: no cover - depends on live Redis
            import logging

            logging.getLogger("qra").warning(
                "REDIS_URL is set but Redis is unreachable (%s); falling back "
                "to the in-memory rate limiter. Limits are then per-process, "
                "not shared.", exc)
    return MemoryRateLimitBackend()
