"""Rate limits are enforced per §9.7 / §13.4 — and the numbers come from
the environment, not from code. These tests prove both halves."""

from fastapi.testclient import TestClient

IP_HEADERS = {"X-Forwarded-For": "203.0.113.7"}


def test_waitlist_429_with_retry_after_and_headers(app_factory, waitlist_payload):
    app, settings = app_factory(waitlist_per_ip_per_minute=2)
    with TestClient(app) as client:
        assert client.post("/api/v1/waitlist", json=waitlist_payload(),
                           headers=IP_HEADERS).status_code == 201
        assert client.post("/api/v1/waitlist", json=waitlist_payload(email="two@example.com"),
                           headers=IP_HEADERS).status_code == 201
        response = client.post("/api/v1/waitlist", json=waitlist_payload(email="three@example.com"),
                               headers=IP_HEADERS)
        assert response.status_code == 429
        body = response.json()
        assert body["error"]["code"] == "rate_limited"
        assert "Retry-After" in response.headers
        assert int(response.headers["X-RateLimit-Limit"]) == 2
        assert response.headers["X-RateLimit-Remaining"] == "0"
        assert response.headers["X-RateLimit-Reset"].isdigit()


def test_per_email_limit_is_distinct_from_per_ip(app_factory, waitlist_payload):
    """Per-email limits catch distributed spam across IPs (§9.7)."""
    app, settings = app_factory(waitlist_per_email_per_hour=1,
                                waitlist_per_ip_per_hour=100,
                                waitlist_per_ip_per_minute=100)
    with TestClient(app) as client:
        assert client.post("/api/v1/waitlist", json=waitlist_payload(email="spam@example.com"),
                           headers=IP_HEADERS).status_code == 201
        # Different IP, same email → still limited.
        response = client.post("/api/v1/waitlist", json=waitlist_payload(email="spam@example.com"),
                               headers={"X-Forwarded-For": "198.51.100.9"})
        assert response.status_code == 429


def test_env_value_controls_allowed_requests(app_factory, waitlist_payload):
    """If .env raises the number, more requests are allowed — the limit is
    not hard-coded anywhere."""
    for limit, allowed in [(2, 2), (5, 5)]:
        app, settings = app_factory(waitlist_per_ip_per_minute=limit,
                                    waitlist_per_email_per_hour=1000,
                                    waitlist_per_email_per_day=1000,
                                    waitlist_per_ip_per_hour=1000)
        with TestClient(app) as client:
            ok = 0
            for i in range(limit + 3):
                response = client.post(
                    "/api/v1/waitlist",
                    json=waitlist_payload(email=f"user{limit}x{i}@example.com"),
                    headers=IP_HEADERS)
                if response.status_code == 201:
                    ok += 1
                else:
                    assert response.status_code == 429
            assert ok == allowed


def test_waitlist_per_product_daily_cap(app_factory, waitlist_payload):
    app, settings = app_factory(waitlist_per_product_per_day=3,
                                waitlist_per_ip_per_hour=100,
                                waitlist_per_ip_per_minute=100,
                                waitlist_per_email_per_day=100,
                                waitlist_per_email_per_hour=100)
    with TestClient(app) as client:
        for i in range(3):
            assert client.post("/api/v1/waitlist",
                               json=waitlist_payload(email=f"p{i}@example.com"),
                               headers=IP_HEADERS).status_code == 201
        response = client.post("/api/v1/waitlist",
                               json=waitlist_payload(email="p4@example.com"),
                               headers={"X-Forwarded-For": "192.0.2.55"})
        assert response.status_code == 429


def test_feedback_rate_limits(app_factory, feedback_payload):
    app, settings = app_factory(feedback_per_ip_per_minute=2)
    with TestClient(app) as client:
        assert client.post("/api/v1/feedback", json=feedback_payload(),
                           headers=IP_HEADERS).status_code == 201
        assert client.post("/api/v1/feedback",
                           json=feedback_payload(message="second distinct message here"),
                           headers=IP_HEADERS).status_code == 201
        response = client.post("/api/v1/feedback",
                               json=feedback_payload(message="third distinct message here"),
                               headers=IP_HEADERS)
        assert response.status_code == 429
        assert response.json()["error"]["code"] == "rate_limited"


def test_security_category_cap(app_factory, feedback_payload):
    app, settings = app_factory(feedback_security_category_per_ip_per_day=2,
                                feedback_per_ip_per_minute=100,
                                feedback_per_ip_per_day=100)
    with TestClient(app) as client:
        for i in range(2):
            assert client.post(
                "/api/v1/feedback",
                json=feedback_payload(category="security",
                                      message=f"security report number {i} here"),
                headers=IP_HEADERS).status_code == 201
        response = client.post(
            "/api/v1/feedback",
            json=feedback_payload(category="security", message="third security report here"),
            headers=IP_HEADERS)
        assert response.status_code == 429


def test_public_read_limit(app_factory):
    app, settings = app_factory(public_read_per_ip_per_minute=3)
    with TestClient(app) as client:
        for _ in range(3):
            assert client.get("/api/v1/products", headers=IP_HEADERS).status_code == 200
        response = client.get("/api/v1/products", headers=IP_HEADERS)
        assert response.status_code == 429
