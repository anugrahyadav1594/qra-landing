"""Health endpoints (§6.1 system routes)."""

from __future__ import annotations

import os

from fastapi import APIRouter, Request

router = APIRouter(prefix="/api/v1", tags=["health"])


@router.get("/health")
def health(request: Request):
    settings = request.app.state.settings
    return {
        "status": "ok",
        "environment": settings.environment,
        "version": "1.0.0",
    }


@router.get("/health/deep")
def health_deep(request: Request):
    """DB + storage reachability plus the effective tunable budgets, so the
    configured numbers can be verified without reading code."""
    settings = request.app.state.settings
    checks: dict[str, str | bool | dict] = {}

    # database
    try:
        from sqlalchemy import text

        with request.app.state.session_factory() as session:
            session.execute(text("SELECT 1"))
        checks["database"] = "ok"
    except Exception as exc:  # pragma: no cover
        checks["database"] = f"error: {exc}"

    # rate-limit backend
    backend = request.app.state.limiter.backend
    checks["rate_limiter_backend"] = type(backend).__name__
    checks["redis_configured"] = bool(settings.redis_url)

    # upload dir
    upload_dir = settings.upload_dir
    checks["upload_dir"] = os.path.isdir(upload_dir)
    checks["upload_dir_path"] = os.path.abspath(upload_dir)

    checks["limits"] = settings.limits_snapshot()
    return {"status": "ok", **checks}
