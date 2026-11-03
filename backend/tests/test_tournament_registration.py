"""Registration journeys B, C, D and H — individual entry, duplicates,
college validation and per-participant data isolation."""

from __future__ import annotations

from tests.tournament_helpers import (
    ADMIN_EMAIL,
    OTHER_EMAIL,
    STUDENT_EMAIL,
    add_college,
    registration_payload,
    sign_in,
    tournament_app,
)


def test_registration_requires_authentication(app_factory):
    client, _ = tournament_app(app_factory)
    sign_in(client, ADMIN_EMAIL)
    college = add_college(client, "Onboarded College")

    signed_out = tournament_app(app_factory)[0]
    response = signed_out.post(
        "/api/v1/tournament/register", json=registration_payload(college["id"])
    )
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "auth_required"


def test_registration_requires_consent_and_valid_mobile(app_factory):
    client, _ = tournament_app(app_factory)
    sign_in(client, STUDENT_EMAIL)
    college = add_college(client, "Onboarded College") if False else None
    # College must be created by an admin.
    admin_client, _ = tournament_app(app_factory)
    sign_in(admin_client, ADMIN_EMAIL)
    college = add_college(admin_client, "Onboarded College")

    missing_consent = registration_payload(college["id"])
    missing_consent["consent_event_participation"] = False
    response = client.post("/api/v1/tournament/register", json=missing_consent)
    assert response.status_code == 422
    assert "Consent" in response.json()["error"]["message"]

    bad_mobile = registration_payload(college["id"], mobile="123")
    response = client.post("/api/v1/tournament/register", json=bad_mobile)
    assert response.status_code == 422
    assert "mobile" in response.json()["error"]["message"]


def test_happy_path_registration(app_factory):
    """Journey B: sign in → pick an onboarded college → review → submit."""
    admin_client, _ = tournament_app(app_factory)
    sign_in(admin_client, ADMIN_EMAIL)
    college = add_college(admin_client, "Onboarded College", location="Mumbai")

    client, _ = tournament_app(app_factory)
    participant = sign_in(client, STUDENT_EMAIL)
    assert participant["email_verified"] is True

    response = client.post(
        "/api/v1/tournament/register",
        json=registration_payload(college["id"]),
        headers={"Idempotency-Key": "journey-b-1"},
    )
    assert response.status_code == 201, response.text
    body = response.json()
    registration = body["registration"]

    assert body["already_registered"] is False
    assert registration["registration_id"].startswith("MTT-")
    assert registration["college_id"] == college["id"]
    assert registration["college_name"] == "Onboarded College"
    assert registration["email"] == STUDENT_EMAIL
    # Default policy: submissions are reviewed, never auto-approved.
    assert registration["status"] == "under_review"
    assert registration["email_verified"] is True
    purposes = {c["purpose"] for c in registration["consents"]}
    assert "mtt_event_participation" in purposes
    assert "mtt_privacy_policy" in purposes

    # The dashboard only shows this participant's own registration.
    me = client.get("/api/v1/tournament/me/registration").json()
    assert me["registration"]["id"] == registration["id"]
    assert me["registration"]["registration_id"] == registration["registration_id"]


def test_duplicate_registration_is_rejected_as_duplicate(app_factory):
    """Journey C: a second submission answers with the existing entry."""
    admin_client, _ = tournament_app(app_factory)
    sign_in(admin_client, ADMIN_EMAIL)
    college = add_college(admin_client, "Onboarded College")

    client, _ = tournament_app(app_factory)
    sign_in(client, STUDENT_EMAIL)

    first = client.post(
        "/api/v1/tournament/register", json=registration_payload(college["id"])
    )
    assert first.status_code == 201

    second = client.post(
        "/api/v1/tournament/register", json=registration_payload(college["id"])
    )
    assert second.status_code == 200
    assert second.json()["already_registered"] is True
    assert second.json()["registration"]["id"] == first.json()["registration"]["id"]

    # Only one row exists.
    rows = admin_client.get("/api/v1/admin/tournament/registrations").json()
    assert rows["total"] == 1


def test_idempotency_key_replays_the_same_response(app_factory):
    admin_client, _ = tournament_app(app_factory)
    sign_in(admin_client, ADMIN_EMAIL)
    college = add_college(admin_client, "Onboarded College")

    client, _ = tournament_app(app_factory)
    sign_in(client, STUDENT_EMAIL)

    payload = registration_payload(college["id"])
    first = client.post(
        "/api/v1/tournament/register", json=payload, headers={"Idempotency-Key": "abc123"}
    )
    replay = client.post(
        "/api/v1/tournament/register", json=payload, headers={"Idempotency-Key": "abc123"}
    )
    assert first.status_code == 201
    assert replay.status_code == 201
    assert replay.json()["registration"]["id"] == first.json()["registration"]["id"]
    rows = admin_client.get("/api/v1/admin/tournament/registrations").json()
    assert rows["total"] == 1


def test_non_onboarded_college_is_rejected(app_factory):
    """Journey D: participants may only pick from the backend list."""
    admin_client, _ = tournament_app(app_factory)
    sign_in(admin_client, ADMIN_EMAIL)
    college = add_college(admin_client, "Onboarded College")
    # Deactivate it after creation: it must vanish from the options.
    admin_client.patch(
        f"/api/v1/admin/tournament/colleges/{college['id']}", json={"is_active": False}
    )

    client, _ = tournament_app(app_factory)
    sign_in(client, STUDENT_EMAIL)
    response = client.post(
        "/api/v1/tournament/register", json=registration_payload(college["id"])
    )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "college_not_onboarded"


def test_fabricated_college_id_is_rejected(app_factory):
    client, _ = tournament_app(app_factory)
    sign_in(client, STUDENT_EMAIL)
    response = client.post(
        "/api/v1/tournament/register",
        json=registration_payload("not-a-real-college-id"),
    )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "college_not_onboarded"


def test_registration_email_must_match_verified_identity(app_factory):
    admin_client, _ = tournament_app(app_factory)
    sign_in(admin_client, ADMIN_EMAIL)
    college = add_college(admin_client, "Onboarded College")

    client, _ = tournament_app(app_factory)
    sign_in(client, STUDENT_EMAIL)
    response = client.post(
        "/api/v1/tournament/register",
        json=registration_payload(college["id"], email="someone.else@example.edu"),
    )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "email_mismatch"


def test_participant_sees_only_their_own_registration(app_factory):
    """Journey H."""
    admin_client, _ = tournament_app(app_factory)
    sign_in(admin_client, ADMIN_EMAIL)
    college = add_college(admin_client, "Onboarded College")

    first_client, _ = tournament_app(app_factory)
    sign_in(first_client, STUDENT_EMAIL)
    mine = first_client.post(
        "/api/v1/tournament/register", json=registration_payload(college["id"])
    ).json()["registration"]

    second_client, _ = tournament_app(app_factory)
    sign_in(second_client, OTHER_EMAIL)
    theirs = second_client.get("/api/v1/tournament/me/registration").json()
    assert theirs["registration"] is None

    second_client.post(
        "/api/v1/tournament/register",
        json=registration_payload(college["id"], full_name="Isha Verma"),
    )
    mine_again = first_client.get("/api/v1/tournament/me/registration").json()
    assert mine_again["registration"]["id"] == mine["id"]
    assert mine_again["registration"]["full_name"] == "Aarav Sharma"


def test_participant_can_edit_then_locked_after_decision(app_factory):
    admin_client, _ = tournament_app(app_factory)
    sign_in(admin_client, ADMIN_EMAIL)
    college = add_college(admin_client, "Onboarded College")
    other = add_college(admin_client, "Another College")

    client, _ = tournament_app(app_factory)
    sign_in(client, STUDENT_EMAIL)
    client.post("/api/v1/tournament/register", json=registration_payload(college["id"]))

    updated = client.patch(
        "/api/v1/tournament/me/registration", json={"college_id": other["id"], "city": "Navi Mumbai"}
    )
    assert updated.status_code == 200
    assert updated.json()["college_id"] == other["id"]
    assert updated.json()["city"] == "Navi Mumbai"

    registration_id = updated.json()["id"]
    admin_client.patch(
        f"/api/v1/admin/tournament/registrations/{registration_id}",
        json={"status": "approved"},
    )
    locked = client.patch("/api/v1/tournament/me/registration", json={"city": "Pune"})
    assert locked.status_code == 409
    assert locked.json()["error"]["code"] == "registration_locked"


def test_honeypot_submission_is_dropped(app_factory):
    admin_client, _ = tournament_app(app_factory)
    sign_in(admin_client, ADMIN_EMAIL)
    college = add_college(admin_client, "Onboarded College")

    client, _ = tournament_app(app_factory)
    sign_in(client, STUDENT_EMAIL)
    payload = registration_payload(college["id"])
    payload["honeypot"] = "http://spam.example"
    response = client.post("/api/v1/tournament/register", json=payload)
    assert response.status_code == 200
    assert response.json().get("screened") is True
    rows = admin_client.get("/api/v1/admin/tournament/registrations").json()
    assert rows["total"] == 0
