"""Quantrelic's Mumbai Trading Tournament (MTT) — tournament platform.

A self-contained module that extends the existing QRA FastAPI backend:

    models.py       SQLAlchemy entities (tournament, colleges, sponsors,
                    registrations, leaderboard, consents, audit log)
    schemas.py      Pydantic request/response contracts (strict, capped)
    config.py       default tournament configuration + prize reconciliation
    security.py     passwordless email one-time-code identity, sessions,
                    optional Clerk JWT verification, admin authorization
    storage.py      validated logo uploads (local backend; S3 optional)
    notifications.py email delivery (SMTP when configured, logged otherwise)
    service.py      business logic + audit logging
    routers/        public, participant and admin HTTP routes
"""

__all__ = ["models", "schemas", "service", "security", "storage", "notifications"]
