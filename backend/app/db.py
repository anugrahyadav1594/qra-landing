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
    """Insert the demo content set once (products, team, updates, postings)."""
    from .models import JobPosting, Product, TeamMember, Update
    from .utils import now_utc, uuid7

    with Session(engine) as session:
        if session.query(Product).count() > 0:
            return

        products = [
            Product(
                id=uuid7(), slug="aurora", name="Aurora",
                tagline="Your data, searchable in seconds — private by default.",
                description_md=(
                    "Aurora is our first product: a private, local-first knowledge "
                    "base with instant full-text search.\n\n"
                    "### Why it exists\n"
                    "Notes, docs and links end up scattered across apps. Aurora gives "
                    "them one home that stays on *your* devices until you decide "
                    "otherwise.\n\n"
                    "### Status\n"
                    "**Waitlist open** — early access rolls out in small cohorts."
                ),
                domain="product-a.com", status="waitlist_only", display_order=1,
                accepts_waitlist=True, created_at=now_utc(), updated_at=now_utc(),
            ),
            Product(
                id=uuid7(), slug="beacon", name="Beacon",
                tagline="Share a page, know exactly who engaged with it.",
                description_md=(
                    "Beacon is link sharing with signal: see who opened your links, "
                    "on which device, and when.\n\n"
                    "### Principles\n"
                    "- No creepy pixels — engagement is explicit and consent-first.\n"
                    "- Recipient privacy is the product, not an afterthought.\n\n"
                    "### Status\n"
                    "**Waitlist open** — first cohorts ship this quarter."
                ),
                domain="product-b.com", status="waitlist_only", display_order=2,
                accepts_waitlist=True, created_at=now_utc(), updated_at=now_utc(),
            ),
            Product(
                id=uuid7(), slug="canvas", name="Canvas",
                tagline="A shared whiteboard for teams that hate meetings.",
                description_md=(
                    "Canvas is a fast, multiplayer-friendly whiteboard built for "
                    "async teams.\n\n"
                    "### Status\n"
                    "In research. Join the waitlist to shape the product and get "
                    "first access."
                ),
                domain="product-c.com", status="waitlist_only", display_order=3,
                accepts_waitlist=True, created_at=now_utc(), updated_at=now_utc(),
            ),
        ]
        session.add_all(products)

        team = [
            TeamMember(id=uuid7(), name="Aarav Mehta", role="Founder & CEO",
                       bio="Previously built payments infrastructure at scale. "
                            "Believes boring architecture ships great products.",
                       display_order=1, created_at=now_utc()),
            TeamMember(id=uuid7(), name="Priya Nair", role="Head of Engineering",
                       bio="Full-stack engineer with a security-first mindset. "
                            "Owns the platform's architecture and reliability.",
                       display_order=2, created_at=now_utc()),
            TeamMember(id=uuid7(), name="Rohan Kapoor", role="Head of Design",
                       bio="Designs calm, accessible interfaces. Says no to dark "
                            "patterns before breakfast.",
                       display_order=3, created_at=now_utc()),
            TeamMember(id=uuid7(), name="Sana Iyer", role="Head of Growth",
                       bio="Turns early users into communities. Runs experiments "
                            "that respect consent and privacy.",
                       display_order=4, created_at=now_utc()),
        ]
        session.add_all(team)

        updates = [
            Update(id=uuid7(), slug="waitlist-open", title="The waitlist is open",
                   body_md=(
                       "We've opened the waitlist for our first three products: "
                       "**Aurora**, **Beacon** and **Canvas**.\n\n"
                       "Joining takes ten seconds and helps us sequence early "
                       "access fairly — first come, first served, no spam."
                   ),
                   published_at=now_utc(), created_at=now_utc()),
            Update(id=uuid7(), slug="why-one-identity",
                   title="Why every product will share one account",
                   body_md=(
                       "Every product we build will sign you in with the same "
                       "identity — one account, one profile, one privacy center. "
                       "No duplicate accounts, no re-verifying your email five "
                       "times.\n\n"
                       "The architecture for this is already decided: credentials "
                       "live with a hardened auth provider, while the identity "
                       "graph stays with us."
                   ),
                   published_at=now_utc(), created_at=now_utc()),
            Update(id=uuid7(), slug="hiring", title="We're hiring",
                   body_md=(
                       "Founding engineers, a product designer and a growth "
                       "generalist — see the [careers page](/careers) and apply "
                       "in under five minutes."
                   ),
                   published_at=now_utc(), created_at=now_utc()),
        ]
        session.add_all(updates)

        postings = [
            JobPosting(
                id=uuid7(), slug="founding-engineer", title="Founding Engineer (Full-stack)",
                department="Engineering", location_type="remote", location="India (remote)",
                employment_type="full_time",
                description_md=(
                    "You'll build the platform that every QRA product runs on: "
                    "the public website, the identity layer, and the engagement "
                    "forms — alongside the founding team.\n\n"
                    "### The stack\n"
                    "Next.js (App Router, TypeScript) frontend, FastAPI/PostgreSQL "
                    "backend, Cloudflare edge, managed auth."
                ),
                requirements_md=(
                    "- 3+ years building production web apps (React + a typed backend)\n"
                    "- Comfortable owning security: auth flows, rate limits, audit trails\n"
                    "- Bias for boring, well-tested architecture\n"
                    "- Based in India (remote-first team)"
                ),
                compensation_range="₹35–60L + equity", status="open", created_at=now_utc(),
            ),
            JobPosting(
                id=uuid7(), slug="product-designer", title="Product Designer",
                department="Design", location_type="remote", location="India (remote)",
                employment_type="full_time",
                description_md=(
                    "Design the public surface of QRA: landing pages, form flows, "
                    "and the shared design system our products will build on. "
                    "Accessibility is a hard target, not a stretch goal."
                ),
                requirements_md=(
                    "- Strong portfolio of shipped web product work\n"
                    "- Fluency with design systems and WCAG 2.2 AA\n"
                    "- Experience designing for mobile-first audiences"
                ),
                compensation_range=None, status="open", created_at=now_utc(),
            ),
            JobPosting(
                id=uuid7(), slug="growth-generalist", title="Growth Generalist",
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
        session.add_all(postings)
        session.commit()
