"""Database engine/session wiring + startup seed content.

Local development uses SQLite (zero-config); ARCHITECTURE.md §8 targets
PostgreSQL 16+ on Neon in production — the DSN is fully configurable via
DATABASE_URL in .env.
"""

from __future__ import annotations

import os
from contextlib import contextmanager

from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from .models import Base


def build_engine(database_url: str) -> Engine:
    connect_args = {}
    if database_url.startswith("sqlite"):
        connect_args["check_same_thread"] = False

        @event.listens_for(Engine, "connect")
        def _set_sqlite_pragma(dbapi_connection, connection_record):  # pragma: no cover
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()

        # ensure the parent directory exists (e.g. ./data)
        path = database_url.split("///", 1)[-1]
        if path and path != ":memory:":
            os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)

    engine = create_engine(database_url, connect_args=connect_args, future=True)
    return engine


def init_db(engine: Engine) -> None:
    Base.metadata.create_all(engine)


@contextmanager
def session_scope(engine: Engine):
    session = Session(engine, expire_on_commit=False, autoflush=False)
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def seed_if_empty(engine: Engine) -> None:
    """Insert the demo content set once (product, updates, postings).

    The team endpoint stays available but is intentionally unseeded —
    the public team surface ships with no fabricated people.
    """
    from .models import JobPosting, Product, Update
    from .utils import now_utc, uuid7

    with Session(engine) as session:
        from sqlalchemy import select

        # Guarantee the canonical QRA product on EVERY startup, not only on a
        # fresh database. The waitlist looks the product up by slug, so a
        # database missing it rejects every signup with "select a valid
        # product" — which is exactly what happens if the file is reset under a
        # running server. Demo updates/postings still seed only once.
        ensure_product = session.execute(
            select(Product).where(Product.slug == "qra")
        ).scalar_one_or_none() is None

        products = [
            Product(
                id=uuid7(), slug="qra", name="QRA",
                tagline="Making financial information easier to understand.",
                description_md=(
                    "QRA is being built to make the financial information "
                    "behind an investment easier to understand. Financial "
                    "statements, results, filings and developments are "
                    "explained in plain language, with the source behind every "
                    "explanation.\n\n"
                    "### What it is being built to do\n"
                    "Start with a company. The information that matters — the "
                    "business, the numbers, what changed, and what could change "
                    "the picture — is brought together and explained in "
                    "language you don't need to be a financial professional to "
                    "follow.\n\n"
                    "### What QRA is not\n"
                    "- Not a tip service — it does not tell you what to buy or "
                    "sell.\n"
                    "- Not a prediction engine — it does not forecast prices or "
                    "promise returns.\n"
                    "- Not an advisor — QRA does not provide investment advice "
                    "and does not make investment decisions for anyone. It "
                    "explains; you decide.\n\n"
                    "### Status\n"
                    "**Early development — waitlist open.**"
                ),
                domain=None, status="waitlist_only", display_order=1,
                accepts_waitlist=True, created_at=now_utc(), updated_at=now_utc(),
            ),
        ]
        if ensure_product:
            session.add_all(products)
            session.commit()

        updates = [
            Update(id=uuid7(), slug="waitlist-open",
                   title="Early access to QRA is open",
                   body_md=(
                       "The waitlist for QRA is open. Early access opens in "
                       "cohorts, in waitlist order.\n\n"
                       "Joining takes ten seconds: one email, and you're in "
                       "line. Waitlist updates only — no spam."
                   ),
                   published_at=now_utc(), created_at=now_utc()),
            Update(id=uuid7(), slug="why-we-built-qra",
                   title="Why we're building QRA",
                   body_md=(
                       "Investing has become easier to access. Understanding "
                       "it is still difficult.\n\n"
                       "Financial information is scattered across annual "
                       "reports, results, filings, news and financial websites "
                       "— and for someone investing for the first time, turning "
                       "all of that into something understandable is "
                       "overwhelming. QRA is being built to close that gap: "
                       "explain the information behind an investment in plain "
                       "language, show where each explanation came from, and "
                       "leave the decision with the investor."
                   ),
                   published_at=now_utc(), created_at=now_utc()),
            Update(id=uuid7(), slug="hiring", title="We're hiring",
                   body_md=(
                       "Founding engineers, a product designer and a growth "
                       "generalist — see the [careers page](/careers) and "
                       "apply in under five minutes. We're a small, "
                       "remote-first team building QRA."
                   ),
                   published_at=now_utc(), created_at=now_utc()),
        ]
        if session.query(Update).count() == 0:
            session.add_all(updates)

        postings = [
            JobPosting(
                id=uuid7(), slug="founding-engineer", title="Founding Engineer (AI & Data)",
                department="Engineering", location_type="remote", location="India (remote)",
                employment_type="full_time",
                description_md=(
                    "You'll build the systems that power QRA: the pipelines "
                    "that collect and normalize financial information, the "
                    "layer that explains it, and the interface where people "
                    "read those explanations — alongside the founding team.\n\n"
                    "### The stack\n"
                    "Next.js (App Router, TypeScript) frontend, FastAPI/"
                    "PostgreSQL backend, data pipelines for filings, statements "
                    "and news, managed hosting."
                ),
                requirements_md=(
                    "- 3+ years building production web apps or data systems "
                    "(TypeScript or Python)\n"
                    "- Comfortable owning the full stack: pipelines, APIs, UI\n"
                    "- Bias for boring, well-tested architecture\n"
                    "- Based in India (remote-first team)"
                ),
                compensation_range=None, status="open", created_at=now_utc(),
            ),
            JobPosting(
                id=uuid7(), slug="product-designer", title="Product Designer",
                department="Design", location_type="remote", location="India (remote)",
                employment_type="full_time",
                description_md=(
                    "Design how financial information is explained: how the "
                    "business, the numbers, the risks and what changed are "
                    "presented so someone investing for the first time can "
                    "actually understand them. Accessibility is a hard target, "
                    "not a stretch goal."
                ),
                requirements_md=(
                    "- Strong portfolio of shipped web product work\n"
                    "- Fluency with design systems and WCAG 2.2 AA\n"
                    "- Experience designing for mobile-first audiences"
                ),
                compensation_range=None, status="open", created_at=now_utc(),
            ),
            JobPosting(
                id=uuid7(), slug="growth-generalist", title="Growth & Community",
                department="Growth", location_type="remote", location="India (remote)",
                employment_type="full_time",
                description_md=(
                    "Own the top of the funnel: waitlist conversion, launch "
                    "announcements, community. You'll work with consent-first "
                    "analytics — no dark patterns here."
                ),
                requirements_md=(
                    "- Shipped and measured a launch before\n"
                    "- Comfortable with email, content and community channels\n"
                    "- Data-literate; respects privacy"
                ),
                compensation_range=None, status="open", created_at=now_utc(),
            ),
            JobPosting(
                id=uuid7(), slug="intern-summer-2025", title="Engineering Intern (closed)",
                department="Engineering", location_type="remote", location="India (remote)",
                employment_type="intern",
                description_md="This posting is closed and kept for reference.",
                requirements_md="-", compensation_range=None, status="closed",
                created_at=now_utc(),
            ),
        ]
        if session.query(JobPosting).count() == 0:
            session.add_all(postings)
        session.commit()
