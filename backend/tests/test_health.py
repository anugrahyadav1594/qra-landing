"""Health endpoints + error envelope shape (§13.1)."""


def test_liveness(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["environment"] == "test"
    assert response.headers.get("x-request-id")


def test_deep_health_reports_effective_limits(client):
    response = client.get("/api/v1/health/deep")
    assert response.status_code == 200
    body = response.json()
    assert body["database"] == "ok"
    assert body["upload_dir"] is True
    limits = body["limits"]
    # The effective budget values are exposed, not hard-coded anywhere else.
    assert limits["waitlist_per_ip_per_hour"] == 10
    assert limits["max_concurrent_sessions"] == 2000
    assert limits["max_waitlist_entries"] == 50000


def test_error_envelope_on_404(client):
    response = client.get("/api/v1/products/does-not-exist")
    assert response.status_code == 404
    body = response.json()
    assert body["error"]["code"] == "not_found"
    assert "request_id" in body["error"]


def test_validation_error_envelope(client, waitlist_payload):
    response = client.post("/api/v1/waitlist", json=waitlist_payload(email="not-an-email"))
    assert response.status_code == 422
    body = response.json()
    assert body["error"]["code"] == "validation_error"
    assert "email" in body["error"]["message"]


def test_unknown_keys_rejected(client, waitlist_payload):
    payload = waitlist_payload()
    payload["__proto__"] = {"polluted": True}
    response = client.post("/api/v1/waitlist", json=payload)
    assert response.status_code == 422
