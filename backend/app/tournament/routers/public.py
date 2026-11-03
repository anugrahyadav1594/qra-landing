"""Public tournament read endpoints — no authentication, IP-budgeted."""

from __future__ import annotations

import os

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from ...deps import get_session, require_public_read_limit
from ..config import EVENT_SLUG
from ..deps import get_settings, get_tournament
from ..models import Tournament, TournamentConfig
from ..schemas import (
    AnnouncementOut,
    CollegeOut,
    LeaderboardOut,
    SponsorOut,
    TournamentConfigOut,
)
from ..service import (
    config_out,
    leaderboard_out,
    public_announcements,
    public_colleges,
    public_sponsors,
)
from ..storage import resolve_local_path

router = APIRouter(prefix="/api/v1/tournament", tags=["tournament"])

_CONTENT_TYPES = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
}


@router.get("", response_model=TournamentConfigOut)
def get_tournament_overview(
    request: Request,
    session: Session = Depends(get_session),
    tournament_and_config: tuple[Tournament, TournamentConfig] = Depends(get_tournament),
    _limit=Depends(require_public_read_limit),
):
    """Event configuration + real counts. No unconfirmed dates are invented:
    unconfigured fields are returned as null."""
    tournament, config = tournament_and_config
    return config_out(session, tournament, config)


@router.get("/colleges")
def list_colleges(
    request: Request,
    session: Session = Depends(get_session),
    _limit=Depends(require_public_read_limit),
):
    """Active, onboarded colleges only — this list drives the registration
    dropdown. Participants never type a college name."""
    return {"colleges": [c.model_dump() for c in public_colleges(session)]}


@router.get("/sponsors")
def list_sponsors(
    request: Request,
    session: Session = Depends(get_session),
    _limit=Depends(require_public_read_limit),
):
    return {"sponsors": [s.model_dump() for s in public_sponsors(session)]}


@router.get("/announcements")
def list_announcements(
    request: Request,
    session: Session = Depends(get_session),
    tournament_and_config: tuple[Tournament, TournamentConfig] = Depends(get_tournament),
    _limit=Depends(require_public_read_limit),
):
    tournament, _ = tournament_and_config
    rows = public_announcements(session, tournament.id)
    return {"announcements": [r.model_dump() for r in rows]}


@router.get("/leaderboard", response_model=LeaderboardOut)
def leaderboard(
    request: Request,
    session: Session = Depends(get_session),
    tournament_and_config: tuple[Tournament, TournamentConfig] = Depends(get_tournament),
    _limit=Depends(require_public_read_limit),
):
    """Real standings only. Returns `enabled: false` until an administrator
    publishes results — the UI then shows the pre-event state."""
    _, config = tournament_and_config
    return leaderboard_out(session, config)


@router.get("/files/{category}/{filename}")
def serve_file(category: str, filename: str, request: Request):
    """Serve a stored logo. Path is resolved against a strict allow-list —
    a user-supplied filename can never escape the upload directory."""
    settings = get_settings(request)
    path = resolve_local_path(settings, category, filename)
    if not os.path.isfile(path):
        raise HTTPException(
            status_code=404,
            detail={"error": {"code": "not_found", "message": "File not found."}},
        )
    extension = os.path.splitext(filename)[1].lower()
    return FileResponse(
        path,
        media_type=_CONTENT_TYPES.get(extension, "application/octet-stream"),
        headers={
            "Cache-Control": "public, max-age=31536000, immutable",
            "X-Content-Type-Options": "nosniff",
            "Content-Security-Policy": "default-src 'none'; sandbox",
        },
    )


__all__ = ["router", "EVENT_SLUG", "AnnouncementOut", "CollegeOut", "SponsorOut"]
