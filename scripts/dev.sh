#!/usr/bin/env bash
# Run the FastAPI backend and the Next.js frontend together.
# Ctrl+C stops both. Requires `make setup` to have been run once.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "▶ Starting FastAPI backend on http://localhost:8000 ..."
(cd "$ROOT/backend" && ./.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload) &
BACKEND_PID=$!

echo "▶ Starting Next.js frontend on http://localhost:3000 ..."
(cd "$ROOT/frontend" && npm run dev) &
FRONTEND_PID=$!

cleanup() {
  echo ""
  echo "■ Stopping servers…"
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
  wait 2>/dev/null || true
}
trap cleanup INT TERM EXIT

echo "✔ Both servers running — open http://localhost:3000"
echo "  Press Ctrl+C to stop."
wait
