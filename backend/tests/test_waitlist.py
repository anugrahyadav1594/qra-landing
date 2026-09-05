"""Waitlist endpoint — §9: happy path, dedupe, idempotency, validation,
capacity, spam screen."""

import json

from app.models import ConsentRecord, WaitlistEntry


def test_join_waitlist_creates_entry(client, product_id, waitlist_payload):
    response = client.post("/api/v1/waitlist", json=waitlist_payload())
    assert response.status_code == 201
    body = response.json()
    assert body["already_present"] is False
    assert body["status"] == "registered"
    assert body["entry_id"]
    assert body["product_id"] == product_id

    with client.app_state.session_factory() as session:
        entry = session.query(WaitlistEntry).one()
        assert entry.email_normalized == "tester@example.com"
        consent = session.get(ConsentRecord, entry.consent_id)
        assert consent.purpose == "waitlist_contact"
        assert consent.granted is True


def test_join_by_slug(client, waitlist_payload):
    payload = waitlist_payload(product_id=None)
    payload["slug"] = "aurora"
    response = client.post("/api/v1/waitlist", json=payload)
    assert response.status_code == 201


def test_duplicate_returns_existing_with_200(client, product_id, waitlist_payload):
    payload = waitlist_payload()
    first = client.post("/api/v1/waitlist", json=payload)
    second = client.post("/api/v1/waitlist", json=payload)
    assert first.status_code == 201
    assert second.status_code == 200
    assert second.json()["already_present"] is True
    assert second.json()["entry_id"] == first.json()["entry_id"]
    with client.app_state.session_factory() as session:
        assert session.query(WaitlistEntry).count() == 1


def test_email_normalization_dedupes(client, waitlist_payload):
    client.post("/api/v1/waitlist", json=waitlist_payload(email="Person@Example.com"))
    response = client.post("/api/v1/waitlist", json=waitlist_payload(email="person@example.com"))
    assert response.status_code == 200
    assert response.json()["already_present"] is True


def test_unknown_product_rejected(client, waitlist_payload):
    response = client.post("/api/v1/waitlist", json=waitlist_payload(product_id="nope"))
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "product_not_found"


def test_disposable_email_rejected(client, waitlist_payload):
    response = client.post("/api/v1/waitlist",
                           json=waitlist_payload(email="spammer@mailinator.com"))
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "disposable_email"


def test_consent_required(client, waitlist_payload):
    response = client.post(
        "/api/v1/waitlist", json=waitlist_payload(consent_waitlist_contact=False))
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "consent_required"


def test_honeypot_silently_dropped(client, product_id, waitlist_payload):
    response = client.post(
        "/api/v1/waitlist", json=waitlist_payload(company_website="http://spam.example"))
    assert response.status_code == 200
    assert response.json()["status"] == "dropped"
    with client.app_state.session_factory() as session:
        assert session.query(WaitlistEntry).count() == 0


def test_idempotency_key_replays_response(client, product_id, waitlist_payload):
    headers = {"Idempotency-Key": "11111111-1111-7111-8111-111111111111"}
    first = client.post("/api/v1/waitlist", json=waitlist_payload(), headers=headers)
    second = client.post("/api/v1/waitlist", json=waitlist_payload(), headers=headers)
    assert first.status_code == 201
    assert second.status_code == 201
    assert second.json() == first.json()
    with client.app_state.session_factory() as session:
        assert session.query(WaitlistEntry).count() == 1


def test_waitlist_total_capacity(client, product_id, waitlist_payload, app_factory):
    app, settings = app_factory(max_waitlist_entries=2, waitlist_per_ip_per_hour=1000,
                                waitlist_per_product_per_day=1000,
                                waitlist_per_email_per_day=1000,
                                waitlist_per_email_per_hour=1000,
                                waitlist_per_ip_per_minute=1000)
    from fastapi.testclient import TestClient
    with TestClient(app) as capped_client:
        assert capped_client.post("/api/v1/waitlist",
                                  json=waitlist_payload(email="a@example.com")).status_code == 201
        assert capped_client.post("/api/v1/waitlist",
                                  json=waitlist_payload(email="b@example.com")).status_code == 201
        response = capped_client.post("/api/v1/waitlist",
                                      json=waitlist_payload(email="c@example.com"))
        assert response.status_code == 422
        assert response.json()["error"]["code"] == "waitlist_full"


def test_source_attribution_stored(client, product_id, waitlist_payload):
    payload = waitlist_payload(source={"utm_source": "twitter", "page": "/waitlist"})
    response = client.post("/api/v1/waitlist", json=payload)
    assert response.status_code == 201
    with client.app_state.session_factory() as session:
        entry = session.query(WaitlistEntry).one()
        assert json.loads(entry.source_json)["utm_source"] == "twitter"
