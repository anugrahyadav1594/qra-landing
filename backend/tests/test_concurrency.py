"""Concurrency gate — MAX_CONCURRENT_SESSIONS (§22.3, assumption A2)."""

import asyncio
import time

import httpx


def test_concurrency_gate_returns_503(app_factory):
    app, settings = app_factory(max_concurrent_sessions=2)

    def slow():
        time.sleep(0.6)
        return {"ok": True}

    app.add_api_route("/_test/slow", slow, methods=["GET"])

    async def fire():
        transport = httpx.ASGITransport(app=app, raise_app_exceptions=False)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            responses = await asyncio.gather(
                client.get("/_test/slow"),
                client.get("/_test/slow"),
                client.get("/_test/slow"),
            )
            return [r.status_code for r in responses]

    codes = sorted(asyncio.run(fire()))
    assert codes == [200, 200, 503]


def test_below_limit_all_succeed(app_factory):
    app, settings = app_factory(max_concurrent_sessions=10)

    def ok():
        return {"ok": True}

    app.add_api_route("/_test/ok", ok, methods=["GET"])

    async def fire():
        transport = httpx.ASGITransport(app=app, raise_app_exceptions=False)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            responses = await asyncio.gather(*[client.get("/_test/ok") for _ in range(5)])
            return [r.status_code for r in responses]

    assert asyncio.run(fire()) == [200] * 5
