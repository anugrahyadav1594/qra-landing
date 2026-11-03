"""Helpers for the tournament test-suite (Journeys A–J)."""

from __future__ import annotations

import io

from fastapi.testclient import TestClient

ADMIN_EMAIL = "admin@quantrelic.in"
STUDENT_EMAIL = "student@example.edu"
OTHER_EMAIL = "other@example.edu"


def tournament_app(app_factory, **overrides):
    """App configured for fast, isolated tournament testing."""
    values = {
        "environment": "test",
        "mtt_expose_otp_in_response": True,
        "mtt_otp_requests_per_email_per_hour": 500,
        "mtt_otp_requests_per_ip_per_hour": 500,
        "mtt_registrations_per_ip_per_hour": 500,
        "mtt_registrations_per_email_per_day": 500,
        "public_read_per_ip_per_minute": 5000,
        "tournament_admin_emails": ADMIN_EMAIL,
        "min_submit_time_seconds": 0,
    }
    values.update(overrides)
    app, settings = app_factory(**values)
    # Create the schema immediately (tests use the client without entering
    # the ASGI lifespan context manager).
    from app.db import init_db

    init_db(app.state.engine)
    client = TestClient(app)
    client.settings = settings
    return client, settings


def sign_in(client: TestClient, email: str) -> dict:
    """Complete the passwordless flow and return the participant payload."""
    response = client.post(
        "/api/v1/tournament/auth/otp/request", json={"email": email}
    )
    assert response.status_code == 200, response.text
    code = response.json()["dev_code"]
    verified = client.post(
        "/api/v1/tournament/auth/otp/verify",
        json={"email": email, "code": code},
    )
    assert verified.status_code == 200, verified.text
    return verified.json()["participant"]


def add_college(client: TestClient, name: str, location: str = "Mumbai", **extra) -> dict:
    payload = {"name": name, "location": location, "is_active": True}
    payload.update(extra)
    response = client.post("/api/v1/admin/tournament/colleges", json=payload)
    assert response.status_code == 201, response.text
    return response.json()


def add_sponsor(client: TestClient, name: str, category: str = "title_sponsor", **extra) -> dict:
    payload = {"name": name, "category": category, "is_active": True}
    payload.update(extra)
    response = client.post("/api/v1/admin/tournament/sponsors", json=payload)
    assert response.status_code == 201, response.text
    return response.json()


def registration_payload(college_id: str, email: str = STUDENT_EMAIL, **overrides) -> dict:
    payload = {
        "full_name": "Aarav Sharma",
        "email": email,
        "mobile": "9876543210",
        "college_id": college_id,
        "course": "B.Tech Computer Science",
        "academic_year": "Third year",
        "city": "Mumbai",
        "consent_event_participation": True,
        "consent_privacy_policy": True,
        "consent_marketing_email": False,
        "honeypot": "",
        "client_ts": 10**13,
    }
    payload.update(overrides)
    return payload


def png_bytes() -> bytes:
    """A tiny valid PNG (1×1, transparent) used for logo uploads."""
    return (
        b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
        b"\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00"
        b"\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
    )


def upload_logo(client: TestClient, url: str, filename: str = "logo.png") -> dict:
    response = client.post(
        url,
        files={"file": (filename, io.BytesIO(png_bytes()), "image/png")},
    )
    return response
