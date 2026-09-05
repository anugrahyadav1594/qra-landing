"""Feedback endpoint — §10: happy path, validation, dedupe, category caps."""

from app.models import ConsentRecord, Feedback


def test_submit_feedback(client, feedback_payload):
    response = client.post("/api/v1/feedback", json=feedback_payload())
    assert response.status_code == 201
    body = response.json()
    assert body["status"] == "new"
    assert body["duplicate"] is False
    with client.app_state.session_factory() as session:
        entry = session.query(Feedback).one()
        assert entry.category == "website"
        consent = session.get(ConsentRecord, entry.consent_id)
        assert consent.purpose == "feedback"


def test_message_too_short(client, feedback_payload):
    response = client.post("/api/v1/feedback", json=feedback_payload(message="too short"))
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"


def test_bad_category_rejected(client, feedback_payload):
    response = client.post("/api/v1/feedback", json=feedback_payload(category="hack"))
    assert response.status_code == 422


def test_rating_bounds(client, feedback_payload):
    response = client.post("/api/v1/feedback", json=feedback_payload(rating=9))
    assert response.status_code == 422


def test_unsafe_url_rejected(client, feedback_payload):
    response = client.post("/api/v1/feedback",
                           json=feedback_payload(url="javascript:alert(1)"))
    assert response.status_code == 422


def test_fingerprint_dedupe_within_window(client, feedback_payload):
    payload = feedback_payload()
    first = client.post("/api/v1/feedback", json=payload)
    second = client.post("/api/v1/feedback", json=payload)
    assert first.status_code == 201
    assert second.status_code == 200
    assert second.json()["duplicate"] is True
    assert second.json()["id"] == first.json()["id"]
    with client.app_state.session_factory() as session:
        assert session.query(Feedback).count() == 1


def test_honeypot_silently_dropped(client, feedback_payload):
    response = client.post(
        "/api/v1/feedback", json=feedback_payload(company_website="bot-filled"))
    assert response.status_code == 200
    assert response.json()["status"] == "dropped"
    with client.app_state.session_factory() as session:
        assert session.query(Feedback).count() == 0


def test_contact_fields_optional(client, feedback_payload):
    response = client.post("/api/v1/feedback", json=feedback_payload(
        contact_name="Ada", contact_email="ada@example.com"))
    assert response.status_code == 201
