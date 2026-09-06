"""Spam controls (§10.3): honeypot, minimum submit time, Turnstile gating."""

import time

from fastapi.testclient import TestClient

from app.models import Feedback, WaitlistEntry


def test_min_submit_time_screen(app_factory, feedback_payload):
    """Submissions faster than MIN_SUBMIT_TIME_SECONDS are dropped silently."""
    app, settings = app_factory(min_submit_time_seconds=3)
    with TestClient(app) as client:
        now_ms = int(time.time() * 1000)
        response = client.post(
            "/api/v1/feedback",
            json=feedback_payload(client_ts=now_ms),  # submitted ~0s ago
        )
        assert response.status_code == 200
        assert response.json()["status"] == "dropped"
        with app.state.session_factory() as session:
            assert session.query(Feedback).count() == 0


def test_slow_human_submission_accepted(app_factory, feedback_payload):
    app, settings = app_factory(min_submit_time_seconds=3)
    with TestClient(app) as client:
        old_ts = int(time.time() * 1000) - 30_000  # 30 s spent on the form
        response = client.post("/api/v1/feedback", json=feedback_payload(client_ts=old_ts))
        assert response.status_code == 201


def test_turnstile_required_when_configured(app_factory, waitlist_payload):
    app, settings = app_factory(turnstile_secret_key="1x0000000000000000000000000000000AA")
    with TestClient(app) as client:
        response = client.post("/api/v1/waitlist", json=waitlist_payload(turnstile_token=None))
        assert response.status_code == 403
        assert response.json()["error"]["code"] == "turnstile_failed"
        with app.state.session_factory() as session:
            assert session.query(WaitlistEntry).count() == 0


def test_turnstile_skipped_without_secret(client, waitlist_payload):
    response = client.post("/api/v1/waitlist", json=waitlist_payload(turnstile_token=None))
    assert response.status_code == 201
