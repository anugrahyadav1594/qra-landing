"""
Validated logo uploads.

Rules:
  * allow-list of raster types only (SVG is refused — it can carry script);
  * file size capped by ``MTT_MAX_LOGO_SIZE_MB``;
  * content type is sniffed from magic bytes, never trusting the header;
  * filenames are generated server-side (``<uuid>.<ext>``) — the uploaded
    name is never used, so path traversal is impossible;
  * ``STORAGE_BACKEND=local`` writes under ``UPLOAD_DIR/tournament``,
    ``STORAGE_BACKEND=s3`` is the production path (documented, requires the
    optional `boto3` dependency and the S3_* settings).
"""

from __future__ import annotations

import os
import uuid
from typing import Final

from fastapi import HTTPException, UploadFile

from ..config import Settings

ALLOWED: Final[dict[bytes, tuple[str, str]]] = {
    b"\x89PNG\r\n\x1a\n": ("png", "image/png"),
    b"\xff\xd8\xff": ("jpg", "image/jpeg"),
    b"RIFF": ("webp", "image/webp"),
}

MAX_MAGIC = 12


class UploadRejected(Exception):
    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message


def sniff(content_type: str | None, head: bytes) -> tuple[str, str] | None:
    for magic, value in ALLOWED.items():
        if head.startswith(magic):
            return value
    # WEBP: `RIFF....WEBP`
    if head.startswith(b"RIFF") and b"WEBP" in head[:MAX_MAGIC]:
        return ("webp", "image/webp")
    _ = content_type  # header is advisory only
    return None


def validate_upload(settings: Settings, upload: UploadFile, payload: bytes) -> tuple[str, str]:
    limit = int(settings.mtt_max_logo_size_mb) * 1024 * 1024
    if not payload:
        raise UploadRejected("empty_file", "The uploaded file is empty.")
    if len(payload) > limit:
        raise UploadRejected(
            "file_too_large",
            f"Logo must be {settings.mtt_max_logo_size_mb} MB or smaller.",
        )
    detected = sniff(upload.content_type, payload[:MAX_MAGIC])
    if detected is None:
        raise UploadRejected(
            "unsupported_file_type",
            "Upload a PNG, JPG or WebP image (SVG is not accepted for security reasons).",
        )
    return detected


def save_logo(settings: Settings, upload: UploadFile, payload: bytes, category: str) -> tuple[str, str]:
    """Persist an upload and return ``(storage_key, url)``."""
    extension, mime = validate_upload(settings, upload, payload)

    if settings.storage_backend == "s3":
        return _save_s3(settings, payload, mime, extension, category)
    if settings.storage_backend not in ("local", ""):
        raise UploadRejected(
            "storage_backend_unsupported",
            f"Storage backend '{settings.storage_backend}' is not supported.",
        )

    safe_category = "".join(ch for ch in category if ch.isalnum() or ch in "-_").strip("-_")
    if not safe_category:
        safe_category = "misc"
    directory = os.path.join(settings.upload_dir, "tournament", safe_category)
    os.makedirs(directory, exist_ok=True)
    filename = f"{uuid.uuid4().hex}.{extension}"
    path = os.path.join(directory, filename)
    with open(path, "wb") as handle:
        handle.write(payload)
    storage_key = f"tournament/{safe_category}/{filename}"
    return storage_key, f"/api/v1/tournament/files/{safe_category}/{filename}"


def _save_s3(
    settings: Settings, payload: bytes, mime: str, extension: str, category: str
) -> tuple[str, str]:
    """Production object storage. Requires `boto3` and the S3_* settings."""
    if not settings.s3_bucket:
        raise UploadRejected("storage_not_configured", "S3_BUCKET is not configured.")
    try:
        import boto3  # type: ignore
    except ImportError as exc:  # pragma: no cover - optional dependency
        raise UploadRejected(
            "storage_not_configured",
            "STORAGE_BACKEND=s3 requires boto3: pip install boto3",
        ) from exc
    key = f"tournament/{category}/{uuid.uuid4().hex}.{extension}"
    client = boto3.client(
        "s3",
        region_name=settings.s3_region,
        endpoint_url=settings.s3_endpoint_url or None,
    )
    client.put_object(
        Bucket=settings.s3_bucket, Key=key, Body=payload, ContentType=mime,
        ACL="private",
    )
    base = settings.s3_endpoint_url or f"https://{settings.s3_bucket}.s3.{settings.s3_region}.amazonaws.com"
    return key, f"{base.rstrip('/')}/{key}"


def resolve_local_path(settings: Settings, category: str, filename: str) -> str:
    """Safe path resolution for the file-serving route (no traversal)."""
    if not filename or "/" in filename or "\\" in filename or ".." in filename:
        raise HTTPException(status_code=404, detail={"error": {"code": "not_found", "message": "Not found."}})
    safe_category = "".join(ch for ch in category if ch.isalnum() or ch in "-_").strip("-_")
    if not safe_category:
        raise HTTPException(status_code=404, detail={"error": {"code": "not_found", "message": "Not found."}})
    path = os.path.abspath(
        os.path.join(settings.upload_dir, "tournament", safe_category, filename)
    )
    root = os.path.abspath(os.path.join(settings.upload_dir, "tournament", safe_category))
    if not path.startswith(root + os.sep):
        raise HTTPException(status_code=404, detail={"error": {"code": "not_found", "message": "Not found."}})
    return path
