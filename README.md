# Quantrelic Analytics — QRA Website

The **Quantrelic Analytics** website: public marketing pages for **QRA — the
Quantrelic Research Agent** (Quantrelic Analytics Private Limited's first
product, an AI-powered financial research tool) — plus waitlist, feedback,
contact and careers-application flows, **and the complete platform for
Quantrelic's Mumbai Trading Tournament (MTT)**: landing page, individual
registration, participant dashboard, leaderboard and a protected admin
console. Built to the specification in
**[`ARCHITECTURE.md`](./ARCHITECTURE.md)** (the single source of technical truth
for this platform).

> **Logo:** the brand mark is referenced at `frontend/public/image.png` and is
> always rendered at its original proportions. The committed file is a
> **placeholder** — replace it with the official `image.png` and it appears
> everywhere automatically (nav, footer, metadata, JSON-LD).

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

### Backend — pytest suite (API contract, rate limits, spam screens, dedupe,
idempotency, concurrency gate, capacity caps, upload rules, tournament
registration/authorization/prize-reconciliation)

```bash
cd ~/qra-landing/backend
source .venv/bin/activate
pytest                 # full suite
pytest -v              # verbose
pytest tests/test_rate_limits.py   # just the rate-limit suite
```

### Frontend — Vitest suite (zod schemas, form behaviour, 429 handling,
XSS-safe Markdown renderer, tournament prize maths, college picker, arena
intro under reduced motion)

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
  -d '{"slug":"qra","email":"you@example.com","consent_waitlist_contact":true,"honeypot":"","client_ts":1757100000000}'
# duplicate → 200 {"already_present": true}
# honeypot filled → 200 {"screened": true, "status": "dropped"}
# disposable email → 422 {"error":{"code":"disposable_email", ...}}
# burst → 429 + Retry-After
```

---

---

## 6. Mumbai Trading Tournament (MTT)

MTT is a trading competition for college students across Mumbai. Participants
**register individually** and **represent an onboarded college**; college-level
qualifying rounds are conducted before the final competition. The tournament
lives inside this repository as a self-contained module — the corporate site,
its pages and its API are untouched.

### 6.1 Routes

| Route | Purpose |
|---|---|
| `/tournament` | Landing page: arena hero, how it works, prize pool, colleges, sponsors, event details, FAQ, CTA |
| `/tournament/register` | 4-step individual registration wizard |
| `/tournament/success` | Registration confirmation ("You're in. Welcome to the arena.") |
| `/tournament/dashboard` | Participant control centre (own registration only) |
| `/tournament/leaderboard` | Real standings, or the pre-event state |
| `/tournament/rules` | Rules & regulations |
| `/tournament/faq` | Frequently asked questions |
| `/admin/tournament` | Protected admin console |

### 6.2 Confirmed vs configurable content

Confirmed by the organisers (seeded into `tournament_configs`):

| Fact | Value |
|---|---|
| Event name | Quantrelic's Mumbai Trading Tournament (MTT) |
| Organiser | Quant Relic Analytics Private Limited |
| Prize pool | **₹1,00,000** (₹60,000 cash + ₹40,000 goodies & merchandise) |
| Champion / 1st runner-up / 2nd runner-up | ₹25,000 / ₹15,000 / ₹10,000 |
| Merit prizes | 10 × ₹1,000 = ₹10,000 |
| Participation | Individual |
| Qualifiers | College-level qualifying rounds |
| Location context | Mumbai |

The prize pool is **validated on every save**: merit count × merit amount must
equal the merit total, the cash prizes must sum to the cash pool, and cash +
goodies must equal the declared total. A mismatch is rejected with
`prize_pool_mismatch`.

**Nothing unconfirmed is invented.** Dates, venue, eligibility, qualification
criteria, quotas, round structure and participant counts stay `null` until an
administrator fills them in; the UI renders an explicit "To be announced"
state, and the countdown does not appear at all until a real event date is set.

### 6.3 Design system

- **Palette:** `#090A0D` / `#111216` / `#191A20` backgrounds, `#F47C35` primary
  orange and `#FFAA70` secondary orange, `#F4F0E9` / `#96979E` text, hairline
  borders at `rgba(255,255,255,0.10)`.
- **Type:** Space Grotesk (display), Inter (interface), JetBrains Mono
  (registration IDs, data readouts) — all self-hosted via `@fontsource`.
- **Motifs:** the handcrafted **MTT arena ring** (SVG, `ArenaStatic.tsx`),
  notched panels, halftone + grain textures, technical grids, market-inspired
  ornament, asymmetric editorial layouts, sharp corners.

### 6.4 Startup animation — ENTER THE ARENA

`components/tournament/ArenaLoader.tsx` + `arena/arenaScene.ts` (Three.js).

1. **Power on (0–0.5 s)** — technical grid, a thin orange light sweeps across,
   the centre point ignites.
2. **The arena awakens (0.5–1.2 s)** — 28 ring segments complete the circle,
   the ring rotates in 3D, particles appear.
3. **Market ignition (1.2–1.9 s)** — candlesticks and a market line converge
   on the ring.
4. **Brand reveal (1.9–2.5 s)** — typography + "POWERED BY QUANT RELIC".
5. **Enter the arena (2.5–2.8 s)** — the ring expands past the frame and
   reveals the already-loaded hero.

Technical guarantees: one `requestAnimationFrame` loop with no React state
writes; Three.js is dynamically imported (it never blocks first paint) and
geometries/materials/textures are disposed on unmount; rendering pauses when
the canvas is off-screen or the tab is hidden; the sequence plays **once per
browser session** (`sessionStorage`), is **skippable** (button, Esc, click),
is **skipped entirely under `prefers-reduced-motion`**, falls back to the
handcrafted SVG arena when WebGL is unavailable, on data-saver and on small
screens, and never autoplays sound.

The same scene runs in `ambient` mode as the persistent hero ring.

### 6.5 Landing-page compositions (Phase 1)

The six content sections below the hero were art-directed as one system with
six different compositions. Shared primitives live in
`components/tournament/primitives.tsx` (section intro with index badge,
status tags, indexed surfaces, premium empty states) and the original vector
motifs in `components/tournament/motifs.tsx`; the CSS layer is the
`mtt-*` block in `app/globals.css`.

| # | Section | Composition |
|---|---|---|
| 01 | How the tournament works | **Tournament Journey** — a continuous rail through the seven stages, each with an index, a node marker, a stage glyph and a confirmed / to-be-announced status; a progression meter shows how much of the structure is locked. Vertical on mobile, three-column rows from `lg`. |
| 02 | Prize pool | **Championship Prize Experience** — the oversized ₹1,00,000 total on a technical prize plate, a derived 60/40 allocation bar, a three-place podium with an illuminated baseline, ten merit markers and a separate goodies allocation panel with a reconciliation line. |
| 03 | Participating colleges | **Campus Network** — a lattice of connected nodes around the arena. The empty state is the designed network with open slots; onboarded colleges take over the same lattice and are marked with node indices. |
| 04 | Sponsors & partners | **Partner Exhibition Wall** — hanging wires, spotlit frames and plinths, with fixed logo frame heights per tier, grayscale-until-hover marks and empty frames when no partnership is confirmed. |
| 05 | Event details | **Tournament Briefing Board** — a status panel (registration state, participation, qualifiers, location, pool) beside an indexed eight-row information sheet; the countdown only exists once a real date is configured, otherwise a designed "date not set" state is shown. |
| 06 | FAQ | **Editorial layout** — sticky left column (index, heading, arena schematic) beside a grouped accordion (Registration, Participation, Colleges, Competition, Prizes, Event information) with plus/minus indicators and CSS grid-template-rows transitions. `layout="stacked"` keeps a single column on `/tournament/faq`. |

Detailing rules: index numbers and section identifiers, registration marks
and corner brackets, measurement rules and tick strips, tiny uppercase
labels, coordinate-style annotations and per-section microcopy. Orange is
reserved for the prize figure, live status, active states and the podium —
everything else is graphite, hairline and type.

**Accessibility note:** the muted annotation colour is `#82838A` rather than
the brief's `#66676E`, which measured 3.6:1 on `#090A0C` and failed WCAG AA
for 9px labels. All entrance transitions are CSS-only, gated on
`prefers-reduced-motion`.

#### 6.5.1 Premium interaction pass (Phase 2)

Two parts were taken to championship interaction quality:

**MTT Command Bar** (`components/tournament/TournamentNavbar.tsx`) — a fixed
bar over an 80px reserved spacer (so the 66px compact state cannot shift the
page), graphite surface with restrained blur and an orange edge when
scrolled, an MTT emblem and wordmark, eight links on one line, a shared
orange indicator that moves between links (IntersectionObserver, never a
scroll handler), a primary Register capsule with a single light sweep and a
secondary Sign in. The link row is measured on mount and on resize: it drops
to *compact*, then *tight* spacing, and only falls back to the full-screen
overlay menu when it genuinely cannot fit. Below `lg` the overlay is the
intended pattern — indexed vertical links, Escape to close, scroll lock,
`aria-expanded` / `aria-controls`, focus moved into the panel.

**Championship Prize Arena** (`components/tournament/PrizePool.tsx`) — four
layers: technical environment (grid, radial measurement rings, coordinate
marks, platform baseline), editorial intro with the total allocation display
(₹1,00,000 counted up with thousand-snapping, precision corner brackets,
measurement rule, 60/40 allocation bar), the cash podium (champion elevated
and illuminated, runner-ups lower, baseline drawn centre-outward, one light
sweep), and the merit / merchandise panels with a reconciliation line.

**Background artwork (replaceable, portrait).** The prize section is a
five-layer environment: dark fallback → **portrait artwork stack** → dark
readability veil (with a localized scrim under the content column) → orange
atmospheric lighting → content. There is deliberately no grid layer: the
artwork supplies the atmosphere, the radial geometry and the financial
linework.

The supplied asset is a 3:4 portrait, so it is shown as one — a real image
element at 100% of a centred 1280px artwork column, `height: auto`,
`object-fit: contain`, `object-position: center top`. No `cover`, no crop,
no stretch, no tiling, no zoom-to-fill; the section is allowed to be as tall
as the artwork. Drop the file here and it is used automatically:

```
frontend/public/images/mtt-prize-background.png
```

Segments are configured in one file (`frontend/lib/prizeArtwork.ts`) as an
ordered vertical stack — `upper` / `main` / `lower` — so more artwork can be
stacked above or below later by flipping a flag; disabled segments render
nothing at all, and each segment keeps its own aspect ratio. Source spec,
seam handling and the WebP/AVIF recommendation are in
`frontend/public/images/README.md`.

Motion is **GSAP 3 + ScrollTrigger** (`lib/gsap.ts`, dynamically imported,
registered once): five independent once-only timelines (prize display, podium,
merit, merchandise, reconciliation), each created inside a
`gsap.context()` and reverted on unmount. Everything is transform/opacity
only, the number is written straight to the DOM (no per-frame React state),
`will-change` is cleared after each timeline, and `prefers-reduced-motion`
bypasses GSAP entirely so the section renders in its final state. The
section is never pinned and never scroll-speed dependent.

**Accessibility note:** the same `#82838A` muted token is used for
annotations (see above). All prize values are present in the server-rendered
HTML — if GSAP never loads, nothing is hidden.

### 6.6 Registration journey

`Identity → Your details → College → Review`

- **Identity:** passwordless six-digit email code. Verifying the code both
  signs the participant in and satisfies the email-verification requirement.
  No passwords are stored. Clerk is supported when
  `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_ISSUER`/`CLERK_JWKS_URL` are
  set; otherwise the built-in flow is used.
- **College:** a searchable, keyboard-accessible picker driven by
  `GET /api/v1/tournament/colleges`. Free-text college names are impossible —
  the backend rejects any id that is not an active, onboarded college.
- **Review:** mandatory consent for event participation and the privacy policy;
  marketing consent is optional and stored separately.
- **Submit:** spam screen → strict validation → Turnstile (when configured) →
  per-IP/per-email rate limits → idempotency replay → transactional insert.
  The success state is only shown after the backend commits.

Registration statuses: `draft`, `email_verification_pending`, `submitted`,
`under_review`, `approved`, `rejected`, `waitlisted`, `cancelled`. By default
entries arrive as **under review** (`AUTO_APPROVE_REGISTRATIONS` is
configurable), so a submission never implies an approved slot.

### 6.7 Admin console (`/admin/tournament`)

Overview · Registrations (search, filter, approve/reject, CSV export) ·
Colleges (add, edit, upload logo, activate/deactivate, registrations per
college) · Sponsors (tier, order, logo, active) · Event configuration (prize
pool, dates, venue, eligibility, rules, switches) · Announcements ·
Leaderboard (add standings, publish/hide) · Audit log.

Authorization is enforced on the **server** (`require_admin`): every admin
endpoint verifies the session and the administrator role; hiding a link grants
nothing. Administrators come from `TOURNAMENT_ADMIN_EMAILS` (granted the role
on first sign-in) or the `tournament_admin_roles` table. Every privileged
action writes an audit row with the acting administrator's email.

### 6.8 Data model (new tables)

`tournament_events`, `tournament_configs`, `tournament_colleges`,
`tournament_sponsors`, `tournament_participants`, `tournament_otp_codes`,
`tournament_sessions`, `tournament_registrations`,
`tournament_registration_consents`, `tournament_leaderboard_entries`,
`tournament_announcements`, `tournament_admin_roles`, `tournament_audit_log`.

Duplicate registrations are prevented by **partial-unique indexes** on
`(tournament_id, participant_id)` and `(tournament_id, email_normalized)`
where `status != 'cancelled'`, backed by an `IntegrityError` path that returns
the existing entry with `already_registered: true`.

**Migrations:** the platform creates its schema with SQLAlchemy
(`Base.metadata.create_all` at startup — idempotent). Local development uses
SQLite (`DATABASE_URL=sqlite:///./data/qra.db`); production targets
PostgreSQL by changing `DATABASE_URL` only. For an audited migration history,
point Alembic at `backend/app/models.py:Base.metadata` (shared by the
tournament models) — no application change is required.

### 6.9 Tournament API

Public

| Endpoint | Notes |
|---|---|
| `GET /api/v1/tournament` | Configuration + real college/sponsor/registration counts |
| `GET /api/v1/tournament/colleges` | Active, onboarded colleges (drives the dropdown) |
| `GET /api/v1/tournament/sponsors` | Active sponsors, ordered by tier |
| `GET /api/v1/tournament/announcements` | Published announcements |
| `GET /api/v1/tournament/leaderboard` | `enabled: false` until results are published |
| `GET /api/v1/tournament/files/{category}/{filename}` | Stored logos (path-traversal safe) |

Identity

| Endpoint | Notes |
|---|---|
| `POST /api/v1/tournament/auth/otp/request` | Sends a one-time code (rate-limited) |
| `POST /api/v1/tournament/auth/otp/verify` | Exchanges it for an httpOnly session |
| `GET /api/v1/tournament/auth/session` | Current identity + own registration |
| `POST /api/v1/tournament/auth/logout` | Revokes the session |

Participant (requires a verified session)

| Endpoint | Notes |
|---|---|
| `POST /api/v1/tournament/register` | Idempotent (`Idempotency-Key`), duplicate-safe |
| `GET /api/v1/tournament/me/registration` | Own registration only |
| `PATCH /api/v1/tournament/me/registration` | Edit while the entry is under review |

Admin (requires the admin role)

| Endpoint | Notes |
|---|---|
| `GET /api/v1/admin/tournament/overview` | Metrics computed from the database |
| `GET /api/v1/admin/tournament/registrations` | `q`, `college_id`, `status`, paging |
| `GET /api/v1/admin/tournament/registrations/export.csv` | CSV export (optionally per college) |
| `PATCH /api/v1/admin/tournament/registrations/{id}` | Status decision |
| `POST` / `PATCH /api/v1/admin/tournament/colleges[/{id}]` | CRUD + `POST /colleges/{id}/logo` |
| `POST` / `PATCH /api/v1/admin/tournament/sponsors[/{id}]` | CRUD + `POST /sponsors/{id}/logo` |
| `GET` / `PATCH /api/v1/admin/tournament/config` | All event fields, prize reconciliation |
| `POST` / `PATCH` / `DELETE /api/v1/admin/tournament/announcements[/{id}]` | Publishing |
| `POST /api/v1/admin/tournament/leaderboard/entries`, `POST /leaderboard/publish` | Standings |
| `GET /api/v1/admin/tournament/audit-log` | Administrative history |

### 6.10 Local setup for the tournament

```bash
cp backend/.env.example backend/.env      # then edit:
#   TOURNAMENT_ADMIN_EMAILS=you@quantrelic.in
#   MTT_EXPOSE_OTP_IN_RESPONSE=true        # dev only: prints the sign-in code
#   MIN_SUBMIT_TIME_SECONDS=0              # dev only: skip the submit-time screen
cp frontend/.env.example frontend/.env.local

make setup && make dev                     # backend :8000, frontend :3008
```

1. Open `/tournament` — the intro plays once.
2. Sign in at `/admin/tournament` with the admin email (the code is returned in
   the response while `MTT_EXPOSE_OTP_IN_RESPONSE=true`, otherwise it is logged
   by the backend).
3. Add colleges and sponsors in the console. They appear immediately on the
   public wall and in the registration dropdown.
4. Register a participant in a second browser session (or an incognito window)
   and watch the entry land in the console.

Email delivery is optional: with `SMTP_HOST` empty, confirmation emails and
one-time codes are **logged** by the backend and every journey still completes.

### 6.11 Security & privacy notes

- Server-side validation, strict schemas (unknown keys rejected), length caps.
- httpOnly, SameSite=Lax sessions (opaque random tokens, only hashes stored);
  `Secure` is forced in production.
- Admin authorization enforced per request; audit log for privileged actions.
- Rate limits on OTP requests, registrations and public reads (all `.env`
  tunable).
- Logos: PNG/JPG/WebP only (SVG is refused because it can carry script),
  size-capped, magic-byte sniffed, stored under a generated filename; serving
  is path-traversal safe and sends `X-Content-Type-Options: nosniff`.
- No payment flow exists — no fee has been announced and none is collected.
- Participants only ever read their own registration.

---

## 7. Repository layout

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
│   │   ├── routers/         # health, products/team/updates, waitlist, feedback, careers
│   │   └── tournament/      # MTT module: models, schemas, services, routers
│   └── tests/               # backend tests (+ tournament suites)
└── frontend/
    ├── .env.example
    ├── next.config.js       # /api/* → FastAPI rewrite + prod security headers
    ├── app/                 # all public routes from §6.1 (+ /tournament/*, robots/sitemap)
    ├── public/image.png     # brand mark (placeholder — replace with official)
    ├── components/          # Nav, Footer, home sections, forms, tournament/, arena/
    ├── lib/                 # API client w/ fallback seed, zod schemas, constants, tournament/
    └── __tests__/           # frontend tests (+ tournament suites)
```

## 8. API surface (implemented)

| Endpoint | Method | Notes |
|---|---|---|
| `/api/v1/health`, `/api/v1/health/deep` | GET | Liveness + effective limits |
| `/api/v1/products`, `/api/v1/products/{slug}` | GET | Public showcase |
| `/api/v1/team`, `/api/v1/updates` | GET | Public content |
| `/api/v1/careers`, `/api/v1/careers/{slug}` | GET | Open roles only |
| `/api/v1/careers/{slug}/apply` | POST (multipart) | PDF resume ≤ `MAX_RESUME_SIZE_MB`, dedupe per email |
| `/api/v1/waitlist` | POST | Rate-limited, idempotent, duplicate-free, consent-recorded |
| `/api/v1/feedback` | POST | Category allowlist, fingerprint dedupe, spam-screened |
| `/api/v1/tournament*` | GET | Public tournament config, colleges, sponsors, announcements, leaderboard (§6.8) |
| `/api/v1/tournament/auth/*` | POST/GET | Passwordless identity (one-time code), session |
| `/api/v1/tournament/register`, `/me/registration` | POST/GET/PATCH | Individual registration |
| `/api/v1/admin/tournament/*` | GET/POST/PATCH/DELETE | Admin-only; server-enforced role check (§6.8) |

All errors use the §13.1 envelope `{"error": {"code", "message", "request_id"}}`;
all rate limits return `429` + `Retry-After` + `X-RateLimit-*` headers.

## 9. What's intentionally not here yet (per the roadmap)

- **Corporate identity/auth (Phase 4):** the *tournament* has its own
  passwordless auth (§6.6); the corporate site still has no sign-in, and the
  `OTP_*` / `SIGNIN_*` env vars for it are defined but unused.
- **Corporate admin dashboard (Phase 4+):** the tournament admin console
  (`/admin/tournament`) is implemented; a company-wide `/admin/*` is not.
- **Object storage & scanning (Phase 5):** CVs are stored locally under
  `backend/uploads/` (git-ignored); production targets Cloudflare R2 + ClamAV.
- **Redis sharing:** optional via `REDIS_URL`; local default is per-process memory.
- **Legal texts:** `/privacy` and `/terms` are placeholder copy pending counsel
  review (§16.1), and `company.com` / `security@company.com` references are
  placeholders (§24, open question O1).

## 10. Troubleshooting (WSL)

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
