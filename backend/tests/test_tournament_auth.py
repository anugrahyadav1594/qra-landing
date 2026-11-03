"""Identity: passwordless one-time codes, sessions, rate limits, admin gate."""

from __future__ import annotations

from tests.tournament_helpers import (
    ADMIN_EMAIL,
    STUDENT_EMAIL,
    add_college,
    registration_payload,
    sign_in,
    tournament_app,
)


def test_one_time_code_flow_creates_a_verified_session(app_factory):
    client, _ = tournament_app(app_factory)

    requested = client.post(
        "/api/v1/tournament/auth/otp/request", json={"email": STUDENT_EMAIL}
    )
    assert requested.status_code == 200
    code = requested.json()["dev_code"]
    assert len(code) == 6 and code.isdigit()

    verified = client.post(
        "/api/v1/tournament/auth/otp/verify", json={"email": STUDENT_EMAIL, "code": code}
    )
    assert verified.status_code == 200
    assert verified.json()["participant"]["email_verified"] is True

    session = client.get("/api/v1/tournament/auth/session").json()
    assert session["signed_in"] is True
    assert session["participant"]["email"] == STUDENT_EMAIL

    client.post("/api/v1/tournament/auth/logout")
    assert client.get("/api/v1/tournament/auth/session").json()["signed_in"] is False


def test_wrong_code_is_rejected(app_factory):
    client, _ = tournament_app(app_factory)
    requested = client.post(
        "/api/v1/tournament/auth/otp/request", json={"email": STUDENT_EMAIL}
    )
    code = requested.json()["dev_code"]
    wrong = "000000" if code != "000000" else "111111"
    response = client.post(
        "/api/v1/tournament/auth/otp/verify", json={"email": STUDENT_EMAIL, "code": wrong}
    )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "invalid_code"


def test_code_is_single_use(app_factory):
    client, _ = tournament_app(app_factory)
    requested = client.post(
        "/api/v1/tournament/auth/otp/request", json={"email": STUDENT_EMAIL}
    )
    code = requested.json()["dev_code"]
    assert client.post(
        "/api/v1/tournament/auth/otp/verify", json={"email": STUDENT_EMAIL, "code": code}
    ).status_code == 200
    assert client.post(
        "/api/v1/tournament/auth/otp/verify", json={"email": STUDENT_EMAIL, "code": code}
    ).status_code == 422


def test_otp_rate_limit(app_factory):
    client, _ = tournament_app(app_factory, mtt_otp_requests_per_email_per_hour=2)
    for _ in range(2):
        assert client.post(
            "/api/v1/tournament/auth/otp/request", json={"email": STUDENT_EMAIL}
        ).status_code == 200
    limited = client.post(
        "/api/v1/tournament/auth/otp/request", json={"email": STUDENT_EMAIL}
    )
    assert limited.status_code == 429
    assert limited.json()["error"]["code"] == "rate_limited"


def test_registration_rate_limit(app_factory):
    admin, _ = tournament_app(app_factory)
    sign_in(admin, ADMIN_EMAIL)
    college = add_college(admin, "Rate College")

    client, _ = tournament_app(app_factory, mtt_registrations_per_ip_per_hour=1)
    sign_in(client, STUDENT_EMAIL)
    assert client.post(
        "/api/v1/tournament/register", json=registration_payload(college["id"])
    ).status_code == 201
    limited = client.post(
        "/api/v1/tournament/register", json=registration_payload(college["id"])
    )
    assert limited.status_code == 429


def test_dev_code_is_never_exposed_in_production(app_factory):
    client, settings = tournament_app(
        app_factory, environment="production", mtt_expose_otp_in_response=True
    )
    assert settings.expose_otp is False
    response = client.post(
        "/api/v1/tournament/auth/otp/request", json={"email": STUDENT_EMAIL}
    )
    assert response.status_code == 200
    assert "dev_code" not in response.json()


def test_invalid_email_is_rejected(app_factory):
    client, _ = tournament_app(app_factory)
    response = client.post(
        "/api/v1/tournament/auth/otp/request", json={"email": "not-an-email"}
    )
    assert response.status_code == 422


def test_unknown_fields_are_rejected(app_factory):
    client, _ = tournament_app(app_factory)
    response = client.post(
        "/api/v1/tournament/auth/otp/request",
        json={"email": STUDENT_EMAIL, "surprise": True},
    )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"


def test_clerk_enabled_fails_closed_on_an_unverifiable_token(app_factory, monkeypatch):
    """Clerk is optional. When it is configured it must never accept a token
    it cannot verify — the request is refused rather than trusted."""
    from app.tournament import security

    client, _ = tournament_app(
        app_factory,
        clerk_issuer="https://example.clerk.accounts.dev",
        clerk_jwks_url="https://example.clerk.accounts.dev/.well-known/jwks.json",
    )

    def boom(settings, token):
        raise RuntimeError("JWKS unreachable")

    monkeypatch.setattr(security, "resolve_clerk_email", boom)
    response = client.get(
        "/api/v1/tournament/me", headers={"Authorization": "Bearer forged.token.value"}
    )
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "invalid_token"

    # The built-in passwordless flow keeps working alongside Clerk.
    sign_in(client, STUDENT_EMAIL)
    assert client.get("/api/v1/tournament/me").status_code == 200
