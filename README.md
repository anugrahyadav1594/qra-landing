# QRA — Landing Page & Platform

The **QRA company website**: public marketing pages, waitlist, feedback, contact and
careers-application flows — built to the specification in
**[`ARCHITECTURE.md`](./ARCHITECTURE.md)** (the single source of technical truth for
this platform).

| Layer | Stack | Where |
|---|---|---|
| Frontend | Next.js 14 (App Router, TypeScript, Tailwind) | [`frontend/`](./frontend) |
| Backend API | FastAPI (Python 3.11, Pydantic, SQLAlchemy) | [`backend/`](./backend) |
| API contract | Versioned `/api/v1/*`, JSON `snake_case`, uniform error envelope | ARCHITECTURE.md §13 |

> **Note on ADR-007:** the architecture doc specifies the API as Next.js route handlers
> inside one deployable. This repo implements the same `/api/v1/*` contract as a
> separate FastAPI service (per the project's chosen stack), with the Next.js dev
> server proxying `/api/*` to it — so the browser always talks same-origin and the
> contract remains identical. Merging the backend into the Next.js deployable later
> is a URL-rewrite change, exactly as ADR-007 describes.

---

## 1. Prerequisites (WSL / Ubuntu)

Run these once in your WSL terminal (Ubuntu 22.04 / 24.04 recommended):

```bash
# 1) Base packages
sudo apt update && sudo apt install -y git curl make python3 python3-venv python3-pip

# 2) Node.js 20+ via nvm (22 recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22
node -v && npm -v     # sanity check

# 3) Python
python3 --version     # needs 3.10+ (3.11/3.12 fine)

# 4) Get the code — clone into the Linux filesystem (~), NOT /mnt/c (much faster)
cd ~
git clone https://github.com/anugrahyadav1594/qra-landing.git
cd qra-landing
```

---

## 2. One-time setup

```bash
# from the repo root: installs a Python venv + all npm dependencies
make setup

# create the env files (the .env files are yours — edit freely)
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

That's it. The defaults work out of the box — SQLite database, in-memory rate
limiter, no external services needed.

---

## 3. Run the page locally

**Option A — one command, both servers** (Ctrl+C stops both):

```bash
make dev
```

**Option B — two terminals** (recommended while developing, gives you both logs):

```bash
# Terminal 1 — backend API  (http://localhost:8000, docs at http://localhost:8000/api/docs)
cd ~/qra-landing/backend
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

```bash
# Terminal 2 — frontend  (http://localhost:3000)
cd ~/qra-landing/frontend
npm run dev
```

Then open **http://localhost:3000** in your Windows browser (WSL2 forwards
localhost automatically).

Useful checks:

```bash
curl http://localhost:3000/api/v1/health                  # liveness (proxied through Next)
curl http://localhost:3000/api/v1/health/deep             # DB/storage checks + effective limits
curl http://localhost:3000/api/v1/products                # seeded product list
```

---

## 4. Rate limits & user limits — all editable via `.env`

**Nothing is hard-coded.** Every budget from ARCHITECTURE.md lives in
`backend/.env` (see [`backend/.env.example`](backend/.env.example) for the full
list). Edit the file, restart the backend, done.

| `.env` variable | Default | Controls (architecture ref) |
|---|---|---|
| `MAX_REGISTERED_USERS` | `50000` | Cap on registered users (§22.3, assumption A2) |
| `MAX_CONCURRENT_SESSIONS` | `2000` | In-flight request gate — above this the API answers **503 + Retry-After** (§22.3) |
| `MAX_WAITLIST_ENTRIES` | `50000` | Total waitlist rows across products |
| `SUSTAINED_REQUESTS_PER_SECOND` / `BURST_*` | `40` / `300` / `300s` | Capacity model (§22.3) |
| `WAITLIST_PER_IP_PER_HOUR` | `10` | Waitlist per IP (§9.7) |
| `WAITLIST_PER_IP_PER_MINUTE` | `3` | Waitlist burst per IP (§9.7) |
| `WAITLIST_PER_EMAIL_PER_DAY` | `30` | Waitlist per email, daily (§9.7) |
| `WAITLIST_PER_EMAIL_PER_HOUR` | `5` | Waitlist per email, hourly (§9.7) |
| `WAITLIST_PER_PRODUCT_PER_DAY` | `200` | Waitlist per product, daily (§9.7) |
| `FEEDBACK_PER_IP_PER_MINUTE` / `_PER_DAY` | `5` / `20` | Feedback per IP (§10.1) |
| `FEEDBACK_PER_USER_PER_DAY` | `20` | Feedback per user (§10.1) |
| `FEEDBACK_AUTHENTICATED_PER_DAY` | `100` | Authed users (no Turnstile), §10.3 |
| `FEEDBACK_SECURITY_CATEGORY_PER_IP_PER_DAY` | `5` | Anti-abuse cap on the `security` category (§10.3) |
| `OTP_*` / `SIGNIN_*` | see `.env.example` | Auth budgets for Phase 4 (§11.4, §11.6) |
| `PUBLIC_READ_PER_IP_PER_MINUTE` | `120` | Public read endpoints (§13.4) |
| `AUTHED_API_PER_USER_PER_MINUTE` | `300` | Authed self-service API (§13.4) |
| `IDENTITY_API_*` / `ADMIN_API_*` / `UPLOAD_PRESIGN_*` / `EXPORT_*` / `DELETE_*` | see `.env.example` | Other API classes (§13.4) |
| `CAREERS_APPLY_PER_IP_PER_HOUR` | `5` | Job applications per IP |
| `MIN_SUBMIT_TIME_SECONDS` | `3` | Time-to-submit spam screen — `0` disables (§10.3) |
| `HONEYPOT_FIELD_NAME` | `company_website` | Honeypot trap field (must match `frontend/.env.local`) |
| `MAX_RESUME_SIZE_MB` | `10` | CV upload cap (§14.4) |
| `IDEMPOTENCY_KEY_TTL_HOURS` / `FEEDBACK_DEDUPE_WINDOW_HOURS` | `24` / `24` | §9.5 / §10.2 |
| `BLOCK_DISPOSABLE_EMAILS` | `true` | Disposable-email block (§9.4) |

**Verify your numbers are live** — `/api/v1/health/deep` returns every effective
budget:

```bash
curl -s http://localhost:8000/api/v1/health/deep | python3 -m json.tool | head -50
```

**Try it:** set `WAITLIST_PER_IP_PER_MINUTE=2` in `backend/.env`, restart the
backend, submit the waitlist form three times quickly — the third response is a
`429` with `Retry-After` and `X-RateLimit-Limit: 2` headers.

Optional extras in `backend/.env`:

- `REDIS_URL` — set it (e.g. `redis://localhost:6379`) to share limit counters
  across processes; leave empty for the built-in in-memory limiter.
- `TURNSTILE_SECRET_KEY` — set it to require Cloudflare Turnstile on all public
  forms (then also set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` in `frontend/.env.local`).
  Empty = bot check skipped (fine for local testing).

---

## 5. Running the tests

### Backend — 54 pytest tests (API contract, rate limits, spam screens, dedupe,
idempotency, concurrency gate, capacity caps, upload rules)

```bash
cd ~/qra-landing/backend
source .venv/bin/activate
pytest                 # full suite
pytest -v              # verbose
pytest tests/test_rate_limits.py   # just the rate-limit suite
```

### Frontend — 21 Vitest tests (zod schemas, form behaviour, 429 handling,
XSS-safe Markdown renderer)

```bash
cd ~/qra-landing/frontend
npm test               # run once
npm run test:watch     # watch mode
```

### Everything + static checks

```bash
make test              # backend + frontend suites
make lint              # ESLint (Next core-web-vitals)
make typecheck         # tsc --noEmit
```

### Smoke test the running app

```bash
# happy path
curl -s -X POST http://localhost:8000/api/v1/waitlist \
  -H 'Content-Type: application/json' \
  -d '{"slug":"aurora","email":"you@example.com","consent_waitlist_contact":true,"honeypot":"","client_ts":1757100000000}'
# duplicate → 200 {"already_present": true}
# honeypot filled → 200 {"screened": true, "status": "dropped"}
# disposable email → 422 {"error":{"code":"disposable_email", ...}}
# burst → 429 + Retry-After
```

---

## 6. Repository layout

```
qra-landing/
├── ARCHITECTURE.md          # the spec this repo implements (§1-§29, ADRs)
├── Makefile                 # make setup / dev / test / lint / typecheck / build
├── scripts/dev.sh           # run backend + frontend together
├── backend/
│   ├── .env.example         # EVERY tunable number lives here
│   ├── requirements.txt     # runtime deps
│   ├── requirements-dev.txt # + pytest
│   ├── pytest.ini
│   ├── app/
│   │   ├── main.py          # FastAPI app factory (CORS, middleware, routers)
│   │   ├── config.py        # pydantic-settings — all budgets from .env
│   │   ├── middleware.py    # X-Request-ID, concurrency gate, origin checks
│   │   ├── rate_limit.py    # sliding-window limiter (memory + optional Redis)
│   │   ├── spam.py          # honeypot, submit timing, Turnstile
│   │   ├── models.py        # SQLAlchemy schema (UUIDv7 PKs, partial-unique dedupe)
│   │   ├── schemas.py       # strict Pydantic I/O contract
│   │   ├── db.py            # engine + seed content
│   │   └── routers/         # health, products/team/updates, waitlist, feedback, careers
│   └── tests/               # 54 tests
└── frontend/
    ├── .env.example
    ├── next.config.js       # /api/* → FastAPI rewrite + prod security headers
    ├── app/                 # all public routes from §6.1 (+ robots/sitemap/security.txt)
    ├── components/          # Nav, Footer, forms (waitlist/feedback/apply), Markdown
    ├── lib/                 # API client w/ fallback seed, zod schemas, constants
    └── __tests__/           # 21 tests
```

## 7. API surface (implemented)

| Endpoint | Method | Notes |
|---|---|---|
| `/api/v1/health`, `/api/v1/health/deep` | GET | Liveness + effective limits |
| `/api/v1/products`, `/api/v1/products/{slug}` | GET | Public showcase |
| `/api/v1/team`, `/api/v1/updates` | GET | Public content |
| `/api/v1/careers`, `/api/v1/careers/{slug}` | GET | Open roles only |
| `/api/v1/careers/{slug}/apply` | POST (multipart) | PDF resume ≤ `MAX_RESUME_SIZE_MB`, dedupe per email |
| `/api/v1/waitlist` | POST | Rate-limited, idempotent, duplicate-free, consent-recorded |
| `/api/v1/feedback` | POST | Category allowlist, fingerprint dedupe, spam-screened |

All errors use the §13.1 envelope `{"error": {"code", "message", "request_id"}}`;
all rate limits return `429` + `Retry-After` + `X-RateLimit-*` headers.

## 8. What's intentionally not here yet (per the roadmap)

- **Identity/auth (Phase 4):** Clerk, Google/email/phone OTP — the `OTP_*` /
  `SIGNIN_*` env vars are already defined but only take effect once those flows land.
- **Admin dashboard (Phase 4+):** `/admin/*`, audit log UI, exports.
- **Object storage & scanning (Phase 5):** CVs are stored locally under
  `backend/uploads/` (git-ignored); production targets Cloudflare R2 + ClamAV.
- **Redis sharing:** optional via `REDIS_URL`; local default is per-process memory.
- **Legal texts:** `/privacy` and `/terms` are placeholder copy pending counsel
  review (§16.1), and `company.com` / `security@company.com` references are
  placeholders (§24, open question O1).

## 9. Troubleshooting (WSL)

| Problem | Fix |
|---|---|
| `python3 -m venv` fails | `sudo apt install python3-venv` |
| `npm install` is slow / times out | run it in the Linux filesystem (`~`), not `/mnt/c`; retry with `npm install --prefer-offline` |
| `EADDRINUSE` on port 8000/3000 | `sudo lsof -i :8000` (or `ss -tlnp`) and kill the PID, or change `BACKEND_PORT` in `backend/.env` |
| Page loads but forms fail with "Network error" | backend not running — start it (`make backend`); check `curl localhost:8000/api/v1/health` |
| Changed `.env` but limits didn't move | restart the backend (env is read at startup) |
| 429s while testing | expected — raise the numbers in `backend/.env` and restart |
| Windows browser can't reach localhost:3000 | WSL2 forwards automatically; if not, `wsl --shutdown` in PowerShell and retry, or use `http://$(hostname -I | awk '{print $1}'):3000` |
| `make: command not found` | `sudo apt install make` |

---

*Architecture: [ARCHITECTURE.md](./ARCHITECTURE.md) · Testing strategy: §18 ·
Rate-limit budgets: §9.7, §10.1, §11.6, §13.4 · Capacity: §22.3*
