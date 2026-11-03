"""
Tournament configuration — the single source of truth for event content.

Everything the website shows about the event comes from the
``tournament_configs`` row (editable from the admin console). The constants
below seed that row on first boot and are used as the documented defaults;
they are never re-applied over an administrator's edits.

Confirmed facts (organiser-supplied) are seeded. Unconfirmed facts — dates,
venue, eligibility, qualification criteria, quotas, round structure — stay
NULL and are rendered by the UI as "to be announced".
"""

from __future__ import annotations

from typing import Any

from sqlalchemy.orm import Session

from ..utils import uuid7
from .models import Tournament, TournamentConfig

# ── Confirmed event identity ──────────────────────────────────────────────

EVENT_SLUG = "mtt"
EVENT_NAME = "Quantrelic's Mumbai Trading Tournament"
EVENT_SHORT_NAME = "MTT"
ORGANIZER = "Quant Relic Analytics Private Limited"

PARTICIPATION_TYPE = "Individual"
QUALIFYING_FORMAT = "College-level qualifying rounds"
LOCATION_CONTEXT = "Mumbai"

CURRENCY = "INR"
PRIZE_POOL_TOTAL = 100_000
CASH_PRIZE_POOL = 60_000
CHAMPION_PRIZE = 25_000
FIRST_RUNNER_UP_PRIZE = 15_000
SECOND_RUNNER_UP_PRIZE = 10_000
MERIT_PRIZE_COUNT = 10
MERIT_PRIZE_AMOUNT = 1_000
MERIT_PRIZE_TOTAL = MERIT_PRIZE_COUNT * MERIT_PRIZE_AMOUNT  # 10,000
GOODIES_AND_MERCHANDISE = 40_000

STATUS_LABEL = "MUMBAI'S TRADING COMPETITION"
HERO_HEADLINE = "THE MARKET IS YOUR ARENA."
HERO_SUBHEAD = (
    "Think strategically. Analyse the markets. Compete with the brightest "
    "minds across Mumbai."
)

QUALIFYING_PLACEHOLDER = "Detailed qualifying-round guidelines will be announced soon."

DEFAULT_PRIZE_TIERS: list[dict[str, Any]] = [
    {
        "key": "champion",
        "label": "Champion",
        "amount": CHAMPION_PRIZE,
        "count": 1,
        "kind": "cash",
        "note": "Highest honour of the tournament",
    },
    {
        "key": "first_runner_up",
        "label": "First Runner-up",
        "amount": FIRST_RUNNER_UP_PRIZE,
        "count": 1,
        "kind": "cash",
        "note": None,
    },
    {
        "key": "second_runner_up",
        "label": "Second Runner-up",
        "amount": SECOND_RUNNER_UP_PRIZE,
        "count": 1,
        "kind": "cash",
        "note": None,
    },
    {
        "key": "merit",
        "label": "Merit Prizes",
        "amount": MERIT_PRIZE_AMOUNT,
        "count": MERIT_PRIZE_COUNT,
        "kind": "cash",
        "note": f"{MERIT_PRIZE_COUNT} winners × ₹{MERIT_PRIZE_AMOUNT:,}",
    },
    {
        "key": "goodies",
        "label": "Goodies & Merchandise",
        "amount": GOODIES_AND_MERCHANDISE,
        "count": 1,
        "kind": "goodies",
        "note": "Participant rewards, kits and merchandise",
    },
]

SPONSOR_CATEGORY_LABELS = {
    "title_sponsor": "Title Sponsor",
    "associate_sponsor": "Associate Sponsor",
    "event_partner": "Event Partner",
    "supporting_partner": "Supporting Partner",
    "other_partner": "Partner",
}


def validate_prize_config(values: dict[str, Any]) -> list[str]:
    """Reconcile the prize pool. Returns a list of human-readable errors."""
    errors: list[str] = []
    merit_count = int(values.get("merit_prize_count", 0))
    merit_amount = int(values.get("merit_prize_amount", 0))
    merit_total = int(values.get("merit_prize_total", 0))
    cash_pool = int(values.get("cash_prize_pool", 0))
    goodies = int(values.get("goodies_and_merchandise", 0))
    total = int(values.get("prize_pool_total", 0))

    computed_merit = merit_count * merit_amount
    if computed_merit != merit_total:
        errors.append(
            f"Merit prizes must reconcile: {merit_count} × ₹{merit_amount:,} = "
            f"₹{computed_merit:,}, not ₹{merit_total:,}."
        )

    computed_cash = (
        int(values.get("champion_prize", 0))
        + int(values.get("first_runner_up_prize", 0))
        + int(values.get("second_runner_up_prize", 0))
        + computed_merit
    )
    if computed_cash != cash_pool:
        errors.append(
            f"Cash prizes must sum to the cash pool: ₹{computed_cash:,} ≠ ₹{cash_pool:,}."
        )

    computed_total = cash_pool + goodies
    if computed_total != total:
        errors.append(
            f"Cash pool + goodies must equal the total prize pool: "
            f"₹{computed_total:,} ≠ ₹{total:,}."
        )
    return errors


def default_config_values() -> dict[str, Any]:
    return {
        "tagline": "Mumbai's trading competition",
        "hero_headline": HERO_HEADLINE,
        "hero_subhead": HERO_SUBHEAD,
        "status_label": STATUS_LABEL,
        "participation_type": PARTICIPATION_TYPE,
        "qualifying_format": QUALIFYING_FORMAT,
        "location_context": LOCATION_CONTEXT,
        "currency": CURRENCY,
        "prize_pool_total": PRIZE_POOL_TOTAL,
        "cash_prize_pool": CASH_PRIZE_POOL,
        "goodies_and_merchandise": GOODIES_AND_MERCHANDISE,
        "champion_prize": CHAMPION_PRIZE,
        "first_runner_up_prize": FIRST_RUNNER_UP_PRIZE,
        "second_runner_up_prize": SECOND_RUNNER_UP_PRIZE,
        "merit_prize_count": MERIT_PRIZE_COUNT,
        "merit_prize_amount": MERIT_PRIZE_AMOUNT,
        "merit_prize_total": MERIT_PRIZE_TOTAL,
        # Deliberately NULL: dates, venue, eligibility, qualification rules.
        "event_starts_at": None,
        "registration_opens_at": None,
        "registration_closes_at": None,
        "venue": None,
        "eligibility": None,
        "competition_format": None,
        "qualifying_round_info": QUALIFYING_PLACEHOLDER,
        "final_round_info": None,
        "description": None,
        "rules_md": None,
        "contact_email": None,
        "registrations_open": True,
        "auto_approve_registrations": False,
        "leaderboard_enabled": False,
    }


def ensure_tournament(session: Session) -> tuple[Tournament, TournamentConfig]:
    """Get (or seed) the MTT event row and its configuration record."""
    tournament = (
        session.query(Tournament).filter(Tournament.slug == EVENT_SLUG).one_or_none()
    )
    if tournament is None:
        tournament = Tournament(
            id=uuid7(),
            slug=EVENT_SLUG,
            name=EVENT_NAME,
            short_name=EVENT_SHORT_NAME,
            organizer=ORGANIZER,
            is_active=True,
        )
        session.add(tournament)
        session.flush()

    config = (
        session.query(TournamentConfig)
        .filter(TournamentConfig.tournament_id == tournament.id)
        .one_or_none()
    )
    if config is None:
        import json

        values = dict(default_config_values())
        values["prize_tiers_json"] = json.dumps(DEFAULT_PRIZE_TIERS)
        config = TournamentConfig(id=uuid7(), tournament_id=tournament.id, **values)
        session.add(config)
        session.flush()

    if not config.prize_tiers_json:
        import json

        config.prize_tiers_json = json.dumps(DEFAULT_PRIZE_TIERS)
        session.flush()

    return tournament, config


def iso_or_none(value) -> str | None:
    return value.isoformat() if value is not None else None


def prize_tiers(config: TournamentConfig) -> list[dict[str, Any]]:
    import json

    if not config.prize_tiers_json:
        return DEFAULT_PRIZE_TIERS
    try:
        tiers = json.loads(config.prize_tiers_json)
        if isinstance(tiers, list) and tiers:
            return tiers
    except (ValueError, TypeError):
        pass
    return DEFAULT_PRIZE_TIERS
