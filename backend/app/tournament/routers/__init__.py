"""Tournament HTTP routes (mounted under /api/v1 by app.main)."""

from . import admin, auth, participant, public

__all__ = ["public", "auth", "participant", "admin"]
