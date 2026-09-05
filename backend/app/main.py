"""QRA platform API — FastAPI application.

Local development entry point. The public HTTP contract is versioned under
`/api/v1/*` per ARCHITECTURE.md §13 / ADR-007.
"""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import Settings
from .db import build_engine, init_db, seed_if_empty
from .errors import register_exception_handlers
from .middleware import PlatformMiddleware
from .rate_limit import build_backend, RateLimiter
from .routers import careers, content, feedback, health, waitlist


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or Settings()
    engine = build_engine(settings.database_url)

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        init_db(engine)
        seed_if_empty(engine)
        import os

        os.makedirs(settings.upload_dir, exist_ok=True)
        yield

    app = FastAPI(
        title="QRA API",
        version="1.0.0",
        docs_url="/api/docs" if settings.environment != "production" else None,
        openapi_url="/api/openapi.json" if settings.environment != "production" else None,
        lifespan=lifespan,
    )

    app.state.settings = settings
    app.state.engine = engine
    app.state.session_factory = _session_factory(engine)
    app.state.limiter = RateLimiter(build_backend(settings.redis_url))

    # CORS: explicit allowlist only, no wildcard (§15.9).
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["*"],
        max_age=600,
    )
    # Request id + concurrency gate + origin checks (one ASGI middleware).
    app.add_middleware(PlatformMiddleware, settings=settings)

    register_exception_handlers(app)

    app.include_router(health.router)
    app.include_router(content.router)
    app.include_router(waitlist.router)
    app.include_router(feedback.router)
    app.include_router(careers.router)

    @app.get("/")
    def root():
        return {"name": "QRA API", "docs": "/api/docs"}

    return app


def _session_factory(engine):
    from sqlalchemy.orm import sessionmaker

    return sessionmaker(bind=engine, expire_on_commit=False, autoflush=False)


app = create_app()
