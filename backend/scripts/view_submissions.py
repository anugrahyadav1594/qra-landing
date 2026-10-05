#!/usr/bin/env python
"""View every waitlist signup and contact/feedback query stored in the database.

Reads through the same DATABASE_URL the API uses, so it works unchanged whether
the data lives in the local SQLite file (backend/data/qra.db) or in Postgres.

Usage (from the repo root):

    backend/.venv/bin/python backend/scripts/view_submissions.py            # both tables
    backend/.venv/bin/python backend/scripts/view_submissions.py waitlist   # one table
    backend/.venv/bin/python backend/scripts/view_submissions.py feedback
    backend/.venv/bin/python backend/scripts/view_submissions.py --json     # machine-readable

Nothing is written; this is read-only.
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

# Make `app` importable, and resolve relative database paths (the default
# `sqlite:///./data/qra.db`) exactly as the API does — relative to backend/,
# not wherever this script happens to be invoked from.
_BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(_BACKEND_DIR))
os.chdir(_BACKEND_DIR)

from sqlalchemy import select  # noqa: E402
from sqlalchemy.orm import Session  # noqa: E402

from app.config import get_settings  # noqa: E402
from app.db import build_engine  # noqa: E402
from app.models import Feedback, Product, WaitlistEntry  # noqa: E402


def _rows(session: Session):
    waitlist = session.execute(
        select(WaitlistEntry, Product.name)
        .join(Product, WaitlistEntry.product_id == Product.id)
        .order_by(WaitlistEntry.created_at.desc())
    ).all()
    feedback = session.execute(
        select(Feedback).order_by(Feedback.created_at.desc())
    ).scalars().all()
    return waitlist, feedback


def main() -> int:
    args = [a for a in sys.argv[1:]]
    as_json = "--json" in args
    args = [a for a in args if not a.startswith("--")]
    which = args[0] if args else "all"

    settings = get_settings()
    engine = build_engine(settings.database_url)

    with Session(engine) as session:
        waitlist, feedback = _rows(session)

        if as_json:
            payload = {
                "database_url": settings.database_url,
                "waitlist": [
                    {
                        "email": e.email_normalized,
                        "product": name,
                        "status": e.status,
                        "referral_code": e.referral_code,
                        "source": e.source_json,
                        "created_at": e.created_at.isoformat() if e.created_at else None,
                    }
                    for e, name in waitlist
                ],
                "feedback": [
                    {
                        "category": f.category,
                        "message": f.message,
                        "contact_name": f.contact_name,
                        "contact_email": f.contact_email,
                        "status": f.status,
                        "page": f.page_slug,
                        "created_at": f.created_at.isoformat() if f.created_at else None,
                    }
                    for f in feedback
                ],
            }
            print(json.dumps(payload, indent=2, ensure_ascii=False))
            return 0

        print(f"Database: {settings.database_url}\n")

        if which in ("all", "waitlist"):
            print(f"═══ Waitlist signups ({len(waitlist)}) ═══")
            if not waitlist:
                print("  (none yet)")
            for e, name in waitlist:
                when = e.created_at.strftime("%Y-%m-%d %H:%M") if e.created_at else "?"
                print(f"  {when}  {e.email_normalized:<32} [{name}]  status={e.status}")
                if e.referral_code:
                    print(f"           referral: {e.referral_code}")
                if e.source_json:
                    print(f"           source:   {e.source_json}")
            print()

        if which in ("all", "feedback"):
            print(f"═══ Contact / feedback queries ({len(feedback)}) ═══")
            if not feedback:
                print("  (none yet)")
            for f in feedback:
                when = f.created_at.strftime("%Y-%m-%d %H:%M") if f.created_at else "?"
                who = f.contact_email or "anonymous"
                print(f"  {when}  [{f.category}]  {who}  status={f.status}")
                if f.contact_name:
                    print(f"           name:    {f.contact_name}")
                print(f"           message: {f.message}")
                if f.page_slug:
                    print(f"           page:    {f.page_slug}")
                print()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
