"""Shared tournament dependencies."""

from __future__ import annotations

from fastapi import Depends, Request
from sqlalchemy.orm import Session

from ..deps import get_session
from .config import ensure_tournament
from .models import Tournament, TournamentConfig


def get_settings(request: Request):
    return request.app.state.settings


def get_tournament(
    request: Request, session: Session = Depends(get_session)
) -> tuple[Tournament, TournamentConfig]:
    """The active tournament + its configuration (seeded on first use)."""
    tournament, config = ensure_tournament(session)
    session.commit()
    return tournament, config
