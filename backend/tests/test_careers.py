"""Careers: public postings + application flow with resume upload rules."""

from app.models import File as FileRow, JobApplication


def resume_bytes() -> bytes:
    return b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF\n"


def _apply(client, slug="founding-engineer", email="candidate@example.com", **kwargs):
    data = {
        "name": kwargs.get("name", "Ada Lovelace"),
        "email": kwargs.get("email", email),
        "phone": kwargs.get("phone", "+919999999999"),
        "cover_note": kwargs.get("cover_note", "I would love to join."),
        "consent_careers": str(kwargs.get("consent_careers", True)).lower(),
        "honeypot": kwargs.get("honeypot", ""),
    }
    files = {"resume": ("resume.pdf", kwargs.get("resume", resume_bytes()),
                        kwargs.get("mime", "application/pdf"))}
    return client.post(f"/api/v1/careers/{slug}/apply", data=data, files=files)


def test_list_only_open_postings(client):
    data = client.get("/api/v1/careers").json()
    slugs = [p["slug"] for p in data["postings"]]
    assert "founding-engineer" in slugs
    assert all(p["status"] != "closed" for p in data["postings"])
    assert "intern-summer-2025" not in slugs


def test_get_open_posting(client):
    response = client.get("/api/v1/careers/founding-engineer")
    assert response.status_code == 200
    assert response.json()["title"].startswith("Founding Engineer")


def test_closed_posting_hidden(client):
    assert client.get("/api/v1/careers/intern-summer-2025").status_code == 404


def test_apply_creates_application_and_stores_resume(client):
    response = _apply(client)
    assert response.status_code == 201
    body = response.json()
    assert body["status"] == "received"
    with client.app_state.session_factory() as session:
        application = session.query(JobApplication).one()
        assert application.email_normalized == "candidate@example.com"
        file_row = session.get(FileRow, application.resume_file_id)
        assert file_row.mime == "application/pdf"
        assert file_row.size_bytes == len(resume_bytes())
        import os
        path = os.path.join(client.settings.upload_dir, f"{file_row.id}.pdf")
        assert os.path.exists(path)


def test_duplicate_application_409(client):
    assert _apply(client).status_code == 201
    response = _apply(client)
    assert response.status_code == 409
    assert response.json()["error"]["code"] == "duplicate_application"


def test_apply_to_closed_posting_422(client):
    response = _apply(client, slug="intern-summer-2025")
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "posting_closed"


def test_apply_unknown_posting_404(client):
    assert _apply(client, slug="does-not-exist").status_code == 404


def test_non_pdf_resume_rejected(client):
    response = _apply(client, mime="text/html", resume=b"<html></html>")
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "resume_type_not_allowed"


def test_oversize_resume_413(client):
    app, settings = client.app_factory(max_resume_size_mb=1)
    from fastapi.testclient import TestClient
    with TestClient(app) as capped:
        big = b"%PDF-1.4\n" + b"x" * (2 * 1024 * 1024)
        response = _apply(capped, resume=big)
        assert response.status_code == 413
        assert response.json()["error"]["code"] == "file_too_large"


def test_disposable_email_rejected(client):
    response = _apply(client, email="junk@guerrillamail.com")
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "disposable_email"
