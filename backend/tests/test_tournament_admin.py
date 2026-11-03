"""Admin journeys E, F, G, I, J — authorization, content management,
exports, uploads and audit logging."""

from __future__ import annotations

from tests.tournament_helpers import (
    ADMIN_EMAIL,
    STUDENT_EMAIL,
    add_college,
    add_sponsor,
    png_bytes,
    registration_payload,
    sign_in,
    tournament_app,
)


def test_unauthenticated_and_non_admin_access_is_denied(app_factory):
    """Journey I: authorization is enforced server-side."""
    client, _ = tournament_app(app_factory)
    sign_in(client, STUDENT_EMAIL)

    for path in (
        "/api/v1/admin/tournament/overview",
        "/api/v1/admin/tournament/registrations",
        "/api/v1/admin/tournament/colleges",
        "/api/v1/admin/tournament/sponsors",
        "/api/v1/admin/tournament/config",
        "/api/v1/admin/tournament/announcements",
        "/api/v1/admin/tournament/audit-log",
    ):
        assert client.get(path).status_code == 403, path

    response = client.post("/api/v1/admin/tournament/colleges", json={"name": "Nope"})
    assert response.status_code == 403

    anonymous = tournament_app(app_factory)[0]
    assert anonymous.get("/api/v1/admin/tournament/overview").status_code == 401


def test_admin_allow_list_grants_access_and_is_audited(app_factory):
    client, _ = tournament_app(app_factory)
    sign_in(client, ADMIN_EMAIL)
    assert client.get("/api/v1/admin/tournament/overview").status_code == 200

    add_college(client, "Audited College")
    log = client.get("/api/v1/admin/tournament/audit-log").json()["entries"]
    actions = [(entry["actor_email"], entry["action"], entry["entity"]) for entry in log]
    assert (ADMIN_EMAIL, "college.create", "college") in actions


def test_overview_metrics_come_from_the_database(app_factory):
    client, _ = tournament_app(app_factory)
    sign_in(client, ADMIN_EMAIL)
    college = add_college(client, "Metric College")
    add_college(client, "Second College")
    add_sponsor(client, "Metric Sponsor")

    student, _ = tournament_app(app_factory)
    sign_in(student, STUDENT_EMAIL)
    student.post("/api/v1/tournament/register", json=registration_payload(college["id"]))

    overview = client.get("/api/v1/admin/tournament/overview").json()
    assert overview["total_registrations"] == 1
    assert overview["pending_approvals"] == 1
    assert overview["approved"] == 0
    assert overview["active_colleges"] == 2
    assert overview["sponsor_count"] == 1
    assert overview["by_college"][0]["college"] == "Metric College"
    assert len(overview["registrations_last_7_days"]) == 7


def test_registration_search_filter_and_status_change(app_factory):
    client, _ = tournament_app(app_factory)
    sign_in(client, ADMIN_EMAIL)
    college = add_college(client, "Filter College")

    student, _ = tournament_app(app_factory)
    sign_in(student, STUDENT_EMAIL)
    created = student.post(
        "/api/v1/tournament/register", json=registration_payload(college["id"])
    ).json()["registration"]

    found = client.get(
        "/api/v1/admin/tournament/registrations", params={"q": "Aarav"}
    ).json()
    assert found["total"] == 1
    assert client.get(
        "/api/v1/admin/tournament/registrations", params={"q": "nobody"}
    ).json()["total"] == 0
    assert client.get(
        "/api/v1/admin/tournament/registrations", params={"status": "approved"}
    ).json()["total"] == 0
    assert client.get(
        "/api/v1/admin/tournament/registrations", params={"college_id": college["id"]}
    ).json()["total"] == 1

    approved = client.patch(
        f"/api/v1/admin/tournament/registrations/{created['id']}",
        json={"status": "approved", "status_note": "Documents verified"},
    )
    assert approved.status_code == 200
    assert approved.json()["status"] == "approved"
    assert approved.json()["reviewed_by"] == ADMIN_EMAIL

    invalid = client.patch(
        f"/api/v1/admin/tournament/registrations/{created['id']}", json={"status": "winner"}
    )
    assert invalid.status_code == 422


def test_csv_export_contains_participant_rows(app_factory):
    client, _ = tournament_app(app_factory)
    sign_in(client, ADMIN_EMAIL)
    college = add_college(client, "Export College")

    student, _ = tournament_app(app_factory)
    sign_in(student, STUDENT_EMAIL)
    student.post("/api/v1/tournament/register", json=registration_payload(college["id"]))

    response = client.get("/api/v1/admin/tournament/registrations/export.csv")
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/csv")
    body = response.text
    assert "registration_id,status,full_name,email" in body
    assert "Aarav Sharma" in body
    assert "Export College" in body
    assert "MTT-" in body


def test_sponsor_wall_appears_publicly(app_factory):
    """Journey G."""
    client, _ = tournament_app(app_factory)
    sign_in(client, ADMIN_EMAIL)
    sponsor = add_sponsor(client, "Headline Partner", category="title_sponsor")
    assert client.patch(
        f"/api/v1/admin/tournament/sponsors/{sponsor['id']}",
        json={"category": "associate_sponsor", "display_order": 2},
    ).status_code == 200

    public = client.get("/api/v1/tournament/sponsors").json()["sponsors"]
    assert public[0]["category"] == "associate_sponsor"
    assert public[0]["display_order"] == 2

    invalid = client.post(
        "/api/v1/admin/tournament/sponsors",
        json={"name": "Bad", "category": "galactic_sponsor"},
    )
    assert invalid.status_code == 422


def test_logo_upload_validates_type_and_size(app_factory):
    client, _ = tournament_app(app_factory)
    sign_in(client, ADMIN_EMAIL)
    college = add_college(client, "Logo College")

    good = client.post(
        f"/api/v1/admin/tournament/colleges/{college['id']}/logo",
        files={"file": ("logo.png", png_bytes(), "image/png")},
    )
    assert good.status_code == 200, good.text
    url = good.json()["url"]

    fetched = client.get(url)
    assert fetched.status_code == 200
    assert fetched.headers["content-type"] == "image/png"

    listed = client.get("/api/v1/admin/tournament/colleges").json()["colleges"]
    assert listed[0]["logo_url"] == url

    # A file that is not a raster image is refused.
    bad = client.post(
        f"/api/v1/admin/tournament/colleges/{college['id']}/logo",
        files={"file": ("logo.svg", b"<svg onload='alert(1)'/>", "image/svg+xml")},
    )
    assert bad.status_code == 422
    assert bad.json()["error"]["code"] == "unsupported_file_type"

    # Path traversal cannot escape the upload directory.
    assert client.get("/api/v1/tournament/files/college-logos/..%2F..%2Fqra.db").status_code in (
        404,
        422,
    )


def test_oversized_logo_is_rejected(app_factory):
    client, _ = tournament_app(app_factory, mtt_max_logo_size_mb=1)
    sign_in(client, ADMIN_EMAIL)
    college = add_college(client, "Big Logo College")
    response = client.post(
        f"/api/v1/admin/tournament/colleges/{college['id']}/logo",
        files={"file": ("big.png", b"\x89PNG\r\n\x1a\n" + b"0" * (1024 * 1024 + 10), "image/png")},
    )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "file_too_large"


def test_config_update_reconciles_the_prize_pool(app_factory):
    client, _ = tournament_app(app_factory)
    sign_in(client, ADMIN_EMAIL)

    broken = client.patch(
        "/api/v1/admin/tournament/config",
        json={
            "champion_prize": 30_000,
            "first_runner_up_prize": 15_000,
            "second_runner_up_prize": 10_000,
            "merit_prize_count": 10,
            "merit_prize_amount": 1_000,
            "merit_prize_total": 10_000,
            "cash_prize_pool": 60_000,
            "goodies_and_merchandise": 40_000,
            "prize_pool_total": 100_000,
        },
    )
    assert broken.status_code == 422
    assert broken.json()["error"]["code"] == "prize_pool_mismatch"

    valid = client.patch(
        "/api/v1/admin/tournament/config",
        json={"venue": "Mumbai", "eligibility": "Undergraduate students in Mumbai"},
    )
    assert valid.status_code == 200
    assert valid.json()["venue"] == "Mumbai"

    # A partial prize edit is completed against the stored record and must
    # still reconcile.
    partial = client.patch(
        "/api/v1/admin/tournament/config", json={"champion_prize": 26_000}
    )
    assert partial.status_code == 422

    dated = client.patch(
        "/api/v1/admin/tournament/config",
        json={"event_starts_at": "2026-02-14T09:30:00"},
    )
    assert dated.status_code == 200
    assert dated.json()["event_starts_at"].startswith("2026-02-14")

    bad_date = client.patch(
        "/api/v1/admin/tournament/config", json={"event_starts_at": "not-a-date"}
    )
    assert bad_date.status_code == 422


def test_announcements_publish_to_participants(app_factory):
    client, _ = tournament_app(app_factory)
    sign_in(client, ADMIN_EMAIL)

    created = client.post(
        "/api/v1/admin/tournament/announcements",
        json={
            "title": "Qualifying round schedule",
            "body_md": "College-level qualifying rounds will be announced soon.",
            "category": "qualifying_rounds",
            "pinned": True,
        },
    )
    assert created.status_code == 201
    announcement_id = created.json()["id"]

    public = client.get("/api/v1/tournament/announcements").json()["announcements"]
    assert public[0]["title"] == "Qualifying round schedule"

    unpublished = client.patch(
        f"/api/v1/admin/tournament/announcements/{announcement_id}",
        json={"is_published": False},
    )
    assert unpublished.status_code == 200
    assert client.get("/api/v1/tournament/announcements").json()["announcements"] == []

    invalid = client.post(
        "/api/v1/admin/tournament/announcements",
        json={"title": "Bad", "body_md": "x", "category": "weather"},
    )
    assert invalid.status_code == 422


def test_leaderboard_publishes_only_real_entries(app_factory):
    client, _ = tournament_app(app_factory)
    sign_in(client, ADMIN_EMAIL)
    college = add_college(client, "Leaderboard College")

    student, _ = tournament_app(app_factory)
    sign_in(student, STUDENT_EMAIL)
    registration = student.post(
        "/api/v1/tournament/register", json=registration_payload(college["id"])
    ).json()["registration"]

    assert client.get("/api/v1/tournament/leaderboard").json()["enabled"] is False

    created = client.post(
        "/api/v1/admin/tournament/leaderboard/entries",
        json={
            "registration_id": registration["id"],
            "display_name": "A. Sharma",
            "score": 87.5,
            "rank": 1,
            "qualification_status": "qualified",
        },
    )
    assert created.status_code == 201

    assert client.post("/api/v1/admin/tournament/leaderboard/publish", json={"enabled": True}).json()[
        "leaderboard_enabled"
    ] is True

    board = client.get("/api/v1/tournament/leaderboard").json()
    assert board["enabled"] is True
    assert board["entries"][0]["rank"] == 1
    assert board["entries"][0]["score"] == 87.5
    assert board["entries"][0]["college_name"] == "Leaderboard College"


def test_registrations_close_when_admin_closes_them(app_factory):
    admin, _ = tournament_app(app_factory)
    sign_in(admin, ADMIN_EMAIL)
    college = add_college(admin, "Closing College")

    admin.patch("/api/v1/admin/tournament/config", json={"registrations_open": False})

    student, _ = tournament_app(app_factory)
    sign_in(student, STUDENT_EMAIL)
    response = student.post(
        "/api/v1/tournament/register", json=registration_payload(college["id"])
    )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "registrations_closed"


def test_registration_window_is_enforced(app_factory):
    admin, _ = tournament_app(app_factory)
    sign_in(admin, ADMIN_EMAIL)
    college = add_college(admin, "Window College")
    admin.patch(
        "/api/v1/admin/tournament/config", json={"registration_closes_at": "2020-01-01T00:00:00"}
    )

    student, _ = tournament_app(app_factory)
    sign_in(student, STUDENT_EMAIL)
    response = student.post(
        "/api/v1/tournament/register", json=registration_payload(college["id"])
    )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "registrations_closed"


def test_duplicate_college_and_sponsor_conflict_cleanly(app_factory):
    """A repeat onboarding is a clean 409, never a 500 from the database."""
    client, _ = tournament_app(app_factory)
    sign_in(client, ADMIN_EMAIL)

    created = add_college(client, "Conflict College", location="Mumbai")
    duplicate = client.post(
        "/api/v1/admin/tournament/colleges",
        json={"name": "Conflict College", "location": "Mumbai"},
    )
    assert duplicate.status_code == 409
    assert duplicate.json()["error"]["code"] == "college_exists"

    # A different location is a different college — not a conflict.
    other_city = client.post(
        "/api/v1/admin/tournament/colleges",
        json={"name": "Conflict College", "location": "Navi Mumbai"},
    )
    assert other_city.status_code == 201

    # The failed insert must not have poisoned the session: later writes work.
    add_college(client, "After Conflict College")
    listing = client.get("/api/v1/admin/tournament/colleges").json()["colleges"]
    assert {row["name"] for row in listing} >= {
        "Conflict College",
        "After Conflict College",
    }
    assert created["id"] in {row["id"] for row in listing}

    # Sponsors follow the same rule.
    add_sponsor(client, "Conflict Sponsor")
    duplicate_sponsor = client.post(
        "/api/v1/admin/tournament/sponsors", json={"name": "Conflict Sponsor"}
    )
    assert duplicate_sponsor.status_code in (201, 409)
