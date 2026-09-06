"""Uniform error envelope (§13.1): {error: {code, message, request_id}}."""

from __future__ import annotations

from fastapi import HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError


def envelope(code: str, message: str, request_id: str = "") -> dict:
    return {"error": {"code": code, "message": message, "request_id": request_id}}


def raise_422(exc: ValidationError, request_id: str = ""):
    messages = []
    for err in exc.errors():
        loc = ".".join(str(part) for part in err["loc"] if str(part) != "body")
        msg = err["msg"].split("Value error, ")[-1]
        messages.append(f"{loc}: {msg}" if loc else msg)
    raise HTTPException(
        status_code=422,
        detail=envelope("validation_error", "; ".join(messages)[:500], request_id),
    )


def register_exception_handlers(app):
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        request_id = getattr(request.state, "request_id", "")
        headers = dict(exc.headers or {})
        detail = exc.detail
        if not (isinstance(detail, dict) and "error" in detail):
            detail = envelope(exc.__class__.__name__.lower(), str(detail), request_id)
        return JSONResponse(status_code=exc.status_code, content=detail, headers=headers)

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        request_id = getattr(request.state, "request_id", "")
        messages = []
        for err in exc.errors():
            loc = ".".join(str(part) for part in err["loc"] if str(part) != "body")
            msg = str(err["msg"]).split("Value error, ")[-1]
            messages.append(f"{loc}: {msg}" if loc else msg)
        return JSONResponse(
            status_code=422,
            content=envelope("validation_error", "; ".join(messages)[:500], request_id),
        )
