"""Public tournament endpoints, empty states and prize-pool reconciliation."""

from __future__ import annotations

from app.tournament.config import validate_prize_config
from tests.tournament_helpers import (
    add_college,
    add_sponsor,
    tournament_app,
)


def test_prize_pool_defaults_reconcile():
    errors = validate_prize_config(
        {
            "champion_prize": 25_000,
            "first_runner_up_prize": 15_000,
            "second_runner_up_prize": 10_000,
            "merit_prize_count": 10,
            "merit_prize_amount": 1_000,
            "merit_prize_total": 10_000,
            "cash_prize_pool": 60_000,
            "goodies_and_merchandise": 40_000,
            "prize_pool_total": 100_000,
        }
    )
    assert errors == []


def test_prize_pool_rejects_mismatch():
    errors = validate_prize_config(
        {
            "champion_prize": 30_000,
            "first_runner_up_prize": 15_000,
            "second_runner_up_prize": 10_000,
            "merit_prize_count": 10,
            "merit_prize_amount": 1_000,
            "merit_prize_total": 10_000,
            "cash_prize_pool": 60_000,
            "goodies_and_merchandise": 40_000,
            "prize_pool_total": 100_000,
        }
    )
    assert len(errors) == 1
    assert "Cash prizes must sum" in errors[0]


def test_public_tournament_exposes_confirmed_facts_only(app_factory):
    client, _ = tournament_app(app_factory)
    data = client.get("/api/v1/tournament").json()

    assert data["name"] == "Quantrelic's Mumbai Trading Tournament"
    assert data["short_name"] == "MTT"
    assert data["prize_pool_total"] == 100_000
    assert data["cash_prize_pool"] == 60_000
    assert data["champion_prize"] == 25_000
    assert data["first_runner_up_prize"] == 15_000
    assert data["second_runner_up_prize"] == 10_000
    assert data["merit_prize_count"] == 10
    assert data["merit_prize_amount"] == 1_000
    assert data["merit_prize_total"] == 10_000
    assert data["goodies_and_merchandise"] == 40_000
    assert data["participation_type"] == "Individual"

    # Unconfirmed facts are never fabricated.
    assert data["event_starts_at"] is None
    assert data["venue"] is None
    assert data["eligibility"] is None
    assert data["registration_closes_at"] is None
    assert "announced soon" in (data["qualifying_round_info"] or "")


def test_public_empty_states(app_factory):
    client, _ = tournament_app(app_factory)
    assert client.get("/api/v1/tournament/colleges").json() == {"colleges": []}
    assert client.get("/api/v1/tournament/sponsors").json() == {"sponsors": []}
    assert client.get("/api/v1/tournament/announcements").json() == {"announcements": []}
    board = client.get("/api/v1/tournament/leaderboard").json()
    assert board == {"enabled": False, "updated_at": None, "entries": []}


def test_colleges_and_sponsors_appear_when_activated(app_factory):
    client, _ = tournament_app(app_factory)
    from tests.tournament_helpers import ADMIN_EMAIL, sign_in

    sign_in(client, ADMIN_EMAIL)

    add_college(client, "Example Institute of Technology", location="Mumbai")
    add_sponsor(client, "Example Sponsor", category="title_sponsor")

    colleges = client.get("/api/v1/tournament/colleges").json()["colleges"]
    sponsors = client.get("/api/v1/tournament/sponsors").json()["sponsors"]
    assert [c["name"] for c in colleges] == ["Example Institute of Technology"]
    assert [s["name"] for s in sponsors] == ["Example Sponsor"]
    assert colleges[0]["logo_url"] is None  # nothing is fabricated


def test_inactive_college_hidden_from_public_list(app_factory):
    client, _ = tournament_app(app_factory)
    from tests.tournament_helpers import ADMIN_EMAIL, sign_in

    sign_in(client, ADMIN_EMAIL)
    college = add_college(client, "Second College")
    assert len(client.get("/api/v1/tournament/colleges").json()["colleges"]) == 1

    response = client.patch(
        f"/api/v1/admin/tournament/colleges/{college['id']}", json={"is_active": False}
    )
    assert response.status_code == 200
    assert client.get("/api/v1/tournament/colleges").json()["colleges"] == []


def test_public_read_endpoints_reject_unknown_payloads(app_factory):
    client, _ = tournament_app(app_factory)
    # Public reads must never leak admin routes without credentials.
    assert client.get("/api/v1/admin/tournament/registrations").status_code == 401
    assert client.get("/api/v1/admin/tournament/overview").status_code == 401
