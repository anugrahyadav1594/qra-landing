"""
Cross-cutting HTTP concerns:

  1. X-Request-ID on every response (correlates logs, §13.1 error envelope).
  2. Concurrency gate — MAX_CONCURRENT_SESSIONS (§22.3): above the limit the
     server answers 503 + Retry-After instead of degrading.
  3. Origin / Sec-Fetch-Site check on mutating methods (§15.9) — enforced
     when ENFORCE_ORIGIN_CHECK=true (production), off in local development.
"""

from __future__ import annotations

import json
import secrets
from urllib.parse import urlsplit

from .config import Settings

MUTATING_METHODS = {"POST", "PUT", "PATCH", "DELETE"}


class PlatformMiddleware:
    """Pure ASGI middleware (one class, deterministic ordering)."""

    def __init__(self, app, settings: Settings) -> None:
        self.app = app
        self.settings = settings
        self._active = 0
        self._max = settings.max_concurrent_sessions

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        request_id = secrets.token_hex(8)
        scope.setdefault("state", {})["request_id"] = request_id

        # 2. Concurrency gate — answer fast while at capacity.
        if self._active >= self._max:
            await self._respond(
                send, 503, request_id,
                {"error": {"code": "capacity_full",
                           "message": "Server is at capacity. Please retry shortly.",
                           "request_id": request_id}},
                extra_headers={"Retry-After": "30"},
            )
            return

        # 3. Origin check on mutating methods (§15.9). Off in development.
        if self.settings.enforce_origin_check:
            method = scope.get("method", "GET")
            headers = {k.decode().lower(): v.decode() for k, v in scope.get("headers", [])}
            origin = headers.get("origin")
            host = headers.get("host", "")
            if method in MUTATING_METHODS and origin:
                origin_host = urlsplit(origin).netloc
                if origin_host and origin_host != host and origin not in self.settings.cors_origin_list:
                    await self._respond(
                        send, 403, request_id,
                        {"error": {"code": "csrf_origin_rejected",
                                   "message": "Cross-origin state-changing request rejected.",
                                   "request_id": request_id}},
                    )
                    return

        self._active += 1
        response_started = False

        async def wrapped_send(message):
            nonlocal response_started
            if message["type"] == "http.response.start":
                response_started = True
                message.setdefault("headers", [])
                headers_list = [
                    (k.decode().lower() if isinstance(k, bytes) else k.lower(),
                     v if isinstance(v, bytes) else v.encode())
                    for k, v in message["headers"]
                ]
                if not any(k == b"x-request-id" for k, _ in headers_list):
                    message["headers"] = list(message["headers"]) + [
                        (b"x-request-id", request_id.encode())
                    ]
            await send(message)

        try:
            await self.app(scope, receive, wrapped_send)
        finally:
            self._active -= 1

    async def _respond(self, send, status: int, request_id: str, payload: dict,
                       extra_headers: dict | None = None):
        body = json.dumps(payload).encode("utf-8")
        headers = [
            (b"content-type", b"application/json; charset=utf-8"),
            (b"x-request-id", request_id.encode()),
        ]
        headers += [(k.encode(), str(v).encode()) for k, v in (extra_headers or {}).items()]
        await send({"type": "http.response.start", "status": status, "headers": headers})
        await send({"type": "http.response.body", "body": body})
