"""Shared fixtures. Every test gets an isolated app: fresh SQLite file,
fresh upload dir, no developer .env loaded, proxy headers trusted."""

from __future__ import annotations

import os

import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app


def make_settings(tmp_path, **overrides) -> Settings:
    values = {
        "environment": "test",
        "database_url": f"sqlite:///{tmp_path / 'test.db'}",
        "upload_dir": str(tmp_path / "uploads"),
        "min_submit_time_seconds": 0,  # time check disabled by default
        "trust_proxy": True,
        "block_disposable_emails": True,
        "honeypot_field_name": "company_website",
        "cors_origins": "http://localhost:3000",
    }
    values.update(overrides)
    return Settings(_env_file=None, **values)


@pytest.fixture
def app_factory(tmp_path):
    """Returns make_app(**overrides) -> (app, settings)."""
    def _make(**overrides):
        settings = make_settings(tmp_path, **overrides)
        app = create_app(settings)
        return app, settings
    return _make


@pytest.fixture
def client(app_factory):
    app, settings = app_factory()
    with TestClient(app) as test_client:
        test_client.app_state = app.state
        test_client.settings = settings
        test_client.app_factory = app_factory
        yield test_client


@pytest.fixture
def product_id(client):
    """Id of the first seeded product (QRA)."""
    data = client.get("/api/v1/products").json()
    return data["products"][0]["id"]


@pytest.fixture
def waitlist_payload(product_id):
    return lambda **overrides: {
        "slug": None,
        "product_id": product_id,
        "email": "tester@example.com",
        "consent_waitlist_contact": True,
        "consent_marketing_email": False,
        "honeypot": "",
        "client_ts": 10**13,
        **overrides,
    }


@pytest.fixture
def feedback_payload():
    return lambda **overrides: {
        "category": "website",
        "message": "The landing page looks great, nice work.",
        "rating": 5,
        "page_slug": "/feedback",
        "honeypot": "",
        "client_ts": 10**13,
        **overrides,
    }

