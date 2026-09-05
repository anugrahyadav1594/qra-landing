# Company Website & Shared Platform — Technical Architecture

| | |
|---|---|
| **Document version** | 1.0 |
| **Last updated** | 2026-08-31 |
| **Status** | Draft for review — accepted decisions are recorded as ADRs in §27 |
| **Scope** | Official company website, forms (waitlist/feedback/careers), central identity, admin dashboard, supporting infrastructure |
| **Audience** | Engineers and AI coding agents implementing this platform. This document is the **single source of technical truth**: if a decision here conflicts with code, the code and this document must both be fixed, and the change recorded as a new ADR. |
| **Legal status** | §16 contains engineering-level privacy guidance. It is **not legal advice**. Final DPDP Act / DPDP Rules compliance must be validated by qualified Indian legal counsel before launch. |

---

## Table of Contents

1. [How to use this document](#1-how-to-use-this-document)
2. [Executive summary](#2-executive-summary)
3. [Goals, non-goals and assumptions](#3-goals-non-goals-and-assumptions)
4. [System overview](#4-system-overview)
5. [Technology stack and service responsibilities](#5-technology-stack-and-service-responsibilities)
6. [Website architecture](#6-website-architecture)
7. [Central identity architecture](#7-central-identity-architecture)
8. [Database architecture](#8-database-architecture)
9. [Waitlist architecture](#9-waitlist-architecture)
10. [Feedback architecture](#10-feedback-architecture)
11. [Authentication architecture](#11-authentication-architecture)
12. [Shared profile architecture](#12-shared-profile-architecture)
13. [API architecture](#13-api-architecture)
14. [File storage](#14-file-storage)
15. [Security architecture](#15-security-architecture)
16. [Privacy and data protection](#16-privacy-and-data-protection)
17. [Admin architecture](#17-admin-architecture)
18. [Testing strategy](#18-testing-strategy)
19. [CI/CD](#19-cicd)
20. [Observability](#20-observability)
21. [Backup and disaster recovery](#21-backup-and-disaster-recovery)
22. [Scalability](#22-scalability)
23. [Environment architecture](#23-environment-architecture)
24. [Domain architecture](#24-domain-architecture)
25. [Third-party services](#25-third-party-services)
26. [Threat model](#26-threat-model)
27. [Architecture Decision Records (ADRs)](#27-architecture-decision-records-adrs)
28. [Implementation roadmap](#28-implementation-roadmap)
29. [Appendices](#29-appendices)

---

## 1. How to use this document

1. **Read §2 and §4 first.** They state intent and shape; everything else is detail.
2. **§27 (ADRs) is authoritative.** Each ADR states a decision, why it was made, and the trigger that would reopen it. Do not override an ADR silently.
3. **Word conventions**: MUST/SHOULD/MAY follow RFC 2119. "Assumption" items in §3 are conditions we believe true; if one turns out false, update the affected ADR and the roadmap.
4. **No implementation code is included by design.** Enum values, field names, table names and endpoint paths are the interface contract; the implementation must match them.
5. Numbers marked **initial budgets** (rate limits, file sizes) are starting values measured against staging traffic and MUST be tuned from data, not guesses, before production traffic is significant.

---

## 2. Executive summary

The Company website is simultaneously **(a)** a public marketing site, **(b)** a form/engagement layer (waitlist, feedback, careers), and **(c)** the **identity layer** for the Company's whole digital estate. Products will live on their own domains (`product-a.com`, ...) and MUST authenticate the same person to the same `user_id` without creating duplicate accounts.

The architecture below is deliberately **boring and consolidated**:

- **One Next.js (App Router, TypeScript) application** is both the website and the backend API (route handlers at `/api/v1/*`). "API-first" is a discipline (versioned, documented, tested, authenticated HTTP contract), not a second deployable.
- **One managed PostgreSQL database** (Neon) behind Drizzle ORM. All identity, form and analytics-supporting state lives there. No microservices.
- **Managed authentication (Clerk)** owns credential security — Google OAuth, email OTP, SMS OTP, sessions, admin MFA — while **we own the identity graph** (`users`, `identities`, `product_memberships`) via verified webhooks. This is the key design move: credentials in the provider, identity in our database.
- **Cloudflare in front of everything** (DNS, CDN, WAF, rate limiting, Turnstile bot protection) and **Vercel** for hosting; **Cloudflare R2** for object storage (S3-compatible, zero egress); **Upstash Redis + QStash** for rate limiting and background jobs.
- **PostHog** (privacy-conscious analytics), **Sentry** (errors), **Better Stack** (logs + uptime), **Resend** (transactional email), **Twilio Verify** (SMS OTP) — a small, purpose-fit vendor set with documented exit paths.
- **Central identity is the whole point.** A single immutable `user_id` (UUIDv7, never sequential) is created once and reused by every product. Products authenticate via the Company identity provider and receive a signed, verified profile; they never touch the database and never mint their own accounts for the same person.

**Decision snapshot** (details and rationale in §5 and §27):

| Topic | Decision |
|---|---|
| Frontend | Next.js (App Router) + TypeScript, strict mode, React Server Components; Tailwind CSS + accessible component primitives |
| Hosting / runtime | Vercel (global edge, previews) |
| Edge / DNS / WAF / CDN / bots | Cloudflare (proxy, WAF, rate limits, Turnstile, caching) |
| Backend | TypeScript route handlers in the same deployable, `/api/v1/*`, server-rendered account/admin UI |
| Database | PostgreSQL 16+ on Neon (managed, PITR, branching) via Drizzle ORM + Zod validation |
| Authentication | Clerk (hosted) — Google OAuth, email OTP, SMS OTP, sessions, admin 2FA. Fallback path: Better Auth (self-hosted) using the same schema (§27 ADR-004) |
| SMS OTP | Twilio Verify via Clerk for launch; adapter interface so an India-focused provider (e.g., MSG91) can replace it; TRAI DLT registration required either way |
| Object storage | Cloudflare R2 (private + public buckets, signed URLs); S3-compatible API keeps AWS S3 as an escape hatch |
| Email | Resend (transactional: verification codes, notifications); SPF/DKIM/DMARC on the sending domain |
| Rate limiting | Upstash Redis (sliding window), enforced at Cloudflare and in the app |
| Background jobs | Upstash QStash (cron + retries): file scanning, purges, exports, backups verification |
| Monitoring | Sentry (errors), Better Stack (structured logs, uptime, status page) |
| Analytics | PostHog (events, funnels, retention; privacy mode, consent-aware) |
| CI/CD | GitHub Actions → Vercel; lint → typecheck → unit → integration → E2E → security gates → preview → reviewed prod deploy |
| Secrets | Vercel environment variables (encrypted, scoped per environment) + Doppler as the optional human-accessible vault; gitleaks in CI; nothing secret in Git |

---

## 3. Goals, non-goals and assumptions

### 3.1 Goals

1. **Official digital presence**: fast, accessible, SEO-strong public website for the Company and its products.
2. **Engagement capture**: waitlist, custom feedback and career application flows with spam/bot resistance and duplicate-free data.
3. **Central identity**: one `user_id` per human across the Company website and all future product domains; Google, email and phone identities all link to it.
4. **AuthN/AuthZ separation**: authentication (who is this person) is delegated to a hardened managed provider; authorization (what may they do) is enforced by our code against our database.
5. **Admin operations**: search/audit/manage users, waitlist, feedback, applications, products; every sensitive action audited.
6. **Production readiness**: monitoring, backups with verified restores, security controls from day one, staging parity.
7. **Product-readiness for expansion**: future products integrate via documented, versioned, authenticated APIs — with no premature distributed systems.

### 3.2 Non-goals (explicitly out of scope for this architecture)

- Building Product A/B/C themselves. This platform only hosts identity, membership and engagement for them.
- Microservices, event-sourcing, Kubernetes, service mesh. (§27 ADR-010, ADR-011)
- Real-time chat, websocket-based collaboration, or live multi-user editing.
- Payments/billing (if a product later needs them, that is a product-level concern).
- Native mobile apps (responsive web only; identity APIs are device-agnostic).
- Marketing automation, CRM, or customer-support ticketing beyond the built-in feedback queue.
- Multi-tenant SaaS administration (admin panel serves Company staff only).
- A publicly documented developer platform/SDK for third-party integrators (internal product integration only, v0).

### 3.3 Assumptions

| # | Assumption | If false |
|---|---|---|
| A1 | The Company is an India-based business (registered/operating in India); most users initially are in India; Indian phone numbers are the primary phone market. | Revisit SMS provider and data-residency notes in §5.3, §16, §25. |
| A2 | Early scale envelope: ≤ 50k registered users, ≤ 2,000 concurrent sessions, ≤ 40 req/s sustained, peak bursts ≤ 300 req/s for ≤ 5 minutes in year one. | Triggers the scaling actions in §22, not a redesign. |
| A3 | Engineering team of 1–4 people; no dedicated SRE/DevOps; platform and provider automation is required, not optional. | If a platform team exists later, §22 still applies. |
| A4 | Budget is startup-scale: per-MAU and per-message vendor costs matter; consolidated providers preferred. | Revisit Clerk per-MAU economics (§27 ADR-004) and SMS provider choice (§5.4). |
| A5 | Products A/B/C do not exist yet or are pre-launch; their schemas are unknown. The platform's product-facing surface is generic and minimal by design. | Product-specific tables are additive and namespaced; no migration debt. |
| A6 | English-only website content at launch; the platform is built i18n-ready (locale-aware fields, `lang` attributes, translatable UI strings) but ships English only. | Add locale routing in Phase 2 (no schema change; content columns already locale-ready). |
| A7 | The Company owns `company.com`, `product-a.com`, `product-b.com` (or intends to). | Domain architecture in §24 changes; identity design does not. |
| A8 | Legal entity for data-protection purposes is settled before Phase 6 launch; DPDP compliance reviewed by counsel (§16). | Launch gate in Phase 6 is not met; launch blocked. |
| A9 | Marketing consent is optional opt-in; the platform never sends promotional email/SMS without recorded consent. | §16 consent model already requires this; no change. |
| A10 | No user data is ever sold, rented, or used for advertising profiling. | §16 policy; PostHog and providers are configured accordingly. |

---

## 4. System overview

### 4.1 Topology

```text
                              INTERNET
                                 │
                          DNS (Cloudflare, all zones)
                                 │
                   ┌─────────────┴──────────────┐
                   │   CLOUDFLARE (per domain)  │
                   │  CDN · WAF · DDoS · rate   │
                   │  limiting · Turnstile      │
                   └─────────────┬──────────────┘
                                 │
        ┌────────────────────────┼──────────────────────────┐
        ▼                        ▼                          ▼
 company.com / admin. / api.   product-a.com + future    assets.company.com
 (same Next.js deployment)      (satellite domains)      (R2 public bucket
        │                            │                   via CDN, cached)
        │                     ┌──────┴───────┐
        ▼                     ▼              ▼
  ┌──────────────────┐   auth.company.com  Clerk-hosted auth UI
  │  NEXT.JS APP     │   (Clerk primary   (Google OAuth, email
  │  (Vercel)        │    domain)          OTP, phone OTP, 2FA)
  │  ├ public pages  │        │
  │  │  (ISR/static) │        │  OAuth + OTP + verified webhooks
  │  ├ account+admin │        │
  │  │  (SSR + RSC)  │        │
  │  └ /api/v1/*     │        │
  │     route        │        │
  │     handlers     │        │
  └────────┬─────────┘        │
           │                  │
     ┌─────┴─────┐            │
     ▼           ▼            ▼
 POSTGRES     OBJECT      CLERK (auth provider)
 (Neon)       STORAGE     ─ Google OAuth (user)
 (users …     (R2)        ─ Email OTP (Resend)
  audit)      ├ private   ─ SMS OTP (Twilio Verify)
              │  bucket   ─ sessions / 2FA MFA
              └ public    ─ Admin API (user management)
                bucket
                  ▲
                  │  signed URLs, AV scan (worker)
   ┌──────────────┴───────────────┐
   ▼                              ▼
 WORKER (QStash cron/queue)   ANALYTICS · OBSERVABILITY
 ├ ClamAV / hash scan           ├ PostHog (events)
 ├ retention purges             ├ Sentry (errors)
 ├ export jobs                  ├ Better Stack (logs, uptime)
 ├ restore drills               └ status page
 └ waitlist notify (Phase 7+)

 FUTURE PRODUCTS (product-a.com …)
 ─────────────────────────────────────────────────────────
   product app ──OIDC-style token flow──▶ auth.company.com
        │                                        │
        │  signed claims: user_id, verified      │
        │  email/phone, profile                  │
        ▼                                        ▼
   product DB (their own) ── webhooks: user.updated / deleted
        │        (never reads Company DB)
        ▼
   product_memberships (Company DB) — one row per user×product
```

### 4.2 Changes from the proposed architecture (and why)

The task provided a conceptual diagram. Three refinements were made:

1. **The auth provider is an explicit layer between the app and Google/Email/Phone.** The original diagram showed Google/Email/Phone feeding "Auth System" directly. In this design, Clerk is the system that talks to those providers; our backend never holds OAuth tokens, never generates or stores OTP codes, and never hosts login/verification UI. **Rationale**: credential handling is the highest-risk code we could write; delegating it removes an entire class of vulnerabilities (§11) and gives session rotation, 2FA, and breach monitoring for free.
2. **Splitting "backend" into (a) the API in the same deployable, (b) remote services (DB, storage, auth), and (c) a small background-worker lane.** The original diagram had one "Backend API" box. We keep one HTTP surface (`/api/v1`) but add an explicit worker lane (QStash) because Vercel function time limits cannot cover AV scanning of large files, retention purges, or CSV exports. This is the **only** non-HTTP component, and it is deliberately introduced later (Phase 5+).
3. **Product integrations attach to `auth.company.com`, not to the website admin panel.** The original diagram routed "Product Memberships" under Users/website. In this design, future products authenticate against the Identity layer (Clerk + our identity API) and are recorded in `product_memberships` — the admin panel only *reads* that data. This is what makes "one account everywhere" actually work (§7, §12).

### 4.3 Request lifecycle (the mental model)

1. Browser → `company.com` → Cloudflare (TLS, WAF, cached assets) → Next.js on Vercel. Public pages are statically generated/incrementally revalidated; account and admin pages are server-rendered.
2. Public form POST (waitlist/feedback/application) → `/api/v1/...` → Cloudflare rate limit + Turnstile check → route handler → Zod validation → business rules → Upstash limits → transaction in PostgreSQL → 201 + idempotency-safe response.
3. Sign-in → user is redirected to `auth.company.com` (Clerk primary domain) → Google/email/phone verification happens entirely there → session cookie(s) land under `auth.company.com`'s domain context (primary domain) or the app domain per Clerk's domain configuration → our app validates the session server-side and reads claims → Clerk webhook (`user.created`, `user.updated`, `session.*`) posts verified events to `/api/v1/auth/webhooks/clerk` → our identity graph is updated idempotently.
4. Admin action → session validated → role check → audit-log row written in the same database transaction as the mutation.

### 4.4 Security boundaries (who is trusted for what)

| Boundary | Trusted with | Not trusted with |
|---|---|---|
| Browser / client code | Public data; its own session (read-only use) | Secrets, admin decisions, user-scoped queries it invents |
| Next.js server (company.com) | DB credentials, vendor API keys, authorization decisions | Credential material for auth flows (delegated to Clerk) |
| Clerk | Credential verification, OTP/email codes, session issuance, 2FA factors | The identity graph's business rules (e.g., what "verified" means for a product membership) |
| Worker (QStash consumers) | Storage keys, DB (read/write scoped), file scans, exports | User-facing request handling |
| Future product apps | Nothing from the Company DB; only signed claims from the identity API | Company credentials, admin functions, other products' data |

---

## 5. Technology stack and service responsibilities

### 5.1 Consolidated stack

Consolidation principle: **one vendor per capability, chosen for a stated reason, with a documented exit path.** No capability gets two vendors "just in case"; the only deliberate multi-vendor surfaces are Cloudflare (edge) + Vercel (compute), which perform different functions.

| Capability | Choice | Alternatives evaluated | Why this one |
|---|---|---|---|
| Frontend framework | Next.js (App Router) + React + TypeScript (strict) | Remix, SvelteKit, Astro + islands | Server components for SEO public pages; route handlers for the API in the same deployable; one language; largest ecosystem for the "small team" constraint |
| Styling/a11y primitives | Tailwind CSS + accessible primitives (Radix-based, e.g. shadcn/ui), `prefers-reduced-motion` aware | CSS Modules, MUI | Rapid consistent UI; primitives ship with keyboard/focus/screen-reader behavior (WCAG 2.2 AA is a hard target, §18.8) |
| Edge/DNS/WAF/CDN | Cloudflare (all zones, proxy on) | AWS CloudFront+Route53, Akamai | One panel for DNS, DDoS, WAF, caching, bot challenge, rate limiting, and Turnstile (same vendor, fewer panics); generous free/cheap tiers |
| Hosting/runtime | Vercel | Cloudflare Workers/Pages (fullstack), Fly.io, Railway | Next.js-first previews, ISR, zero ops; global edge; the team has no DevOps capacity (A3) |
| Backend API | Route handlers (`/api/v1/*`) in the same Next.js app | Separate NestJS/Fastify service | One deployable, shared types with UI, no inter-service auth; extractable later per ADR-011 |
| Validation | Zod (shared schemas client/server) | Valibot, class-validator | Single source of truth for validation, strict inference to TS types |
| DB access | Drizzle ORM (SQL-first, typed) | Prisma, Kysely, raw pg | No query-engine binary/magic; close-to-SQL; easy migration story; works fine with Neon |
| Database | PostgreSQL 16+ managed (Neon recommended) | Supabase, Aiven, AWS RDS, Railway | Real Postgres with PITR + instant branch-per-PR; managed; SQL is the hedge (ADR-001). **Risk note (2026 review sources): evaluate Neon's reliability record before Phase 6 and keep Supabase/Aiven as a documented fallback** |
| Auth | Clerk (see §5.2) | Better Auth (self-hosted), Auth0, Firebase Auth, AWS Cognito | §5.2 |
| SMS OTP | Twilio Verify via Clerk (§5.3) | MSG91/Exotel, Firebase Phone Auth, Plivo, Telesign | §5.3 |
| Transactional email | Resend | Postmark, AWS SES, Mailgun | Simple API, good deliverability defaults, per-org domains; Postmark is the drop-in alternate |
| Object storage | Cloudflare R2 | AWS S3, Supabase Storage, GCS | §5.5 |
| Rate limiting store | Upstash Redis (REST, serverless-friendly) | Redis Cloud, RateLimiter (Cloudflare), vendor-native | Latency-appropriate, no connection pool on serverless, cheap at our scale; Cloudflare is the first gate, Upstash is the second |
| Background jobs/cron | Upstash QStash (HTTP queue, retries, scheduled) | Inngest, BullMQ+Redis, Vercel Cron | Function-call-based (matches serverless), verified signatures, no long-lived broker to operate |
| Errors | Sentry (frontend + backend; PII scrubbing enabled; session replay off by default, opt-in) | GlitchTip (self-host), Better Stack Errors | Industry standard, free tier adequate, DPA available |
| Logs/uptime/status | Better Stack (drain Vercel/function logs; uptime monitors; status page) | Axiom, Datadog (overkill), Grafana stack (ops burden) | Structured JSON logs searched, 60s uptime checks, public status page in one product |
| Analytics | PostHog (events, funnels, retention, sessions opt-in) | Plausible, Umami, GA4 | Product analytics the team needs + privacy posture (no cross-site tracking, EU/US hosting options, deletion API, consent banner) |
| CI/CD | GitHub Actions + Vercel Git integration | GitLab CI, CircleCI | Repo is on GitHub; Vercel previews per PR; Actions for gates |
| Secrets | Vercel env vars (encrypted, per-environment) + Doppler (optional human-facing vault) | 1Password (humans), AWS Secrets Manager | §15.11 |
| File scanning | ClamAV (container) via worker; VirusTotal hash lookups (optional, hashes only) | Hosted scan APIs | §14.8 |

### 5.2 Authentication provider: the decision

**Requirements**: Google Sign-In; email verification (and email OTP/per-code login); SMS OTP with retry/expiry/rate-limit controls; sessions that work **across distinct domains** (company.com + product-a.com); admin 2FA; user profile metadata; webhooks; export/deletion API (data-protection rights).

| Criteria | **Clerk** | Better Auth (self-hosted) | Auth0 | Firebase Auth |
|---|---|---|---|---|
| Cross-domain (different registrable domains) session sharing | Native: **satellite domains** — one instance, one primary domain, satellites read its session state (documented product feature) | DIY: you own cookie/domain logic; cross-domain = custom federation work | Enterprise feature with added infrastructure | DIY; cross-domain requires custom token plumbing (Identity Platform adds cost/complexity) |
| Email OTP + verification | Built in | Built in (you host it) | Built in | Built in |
| Phone/SMS OTP | Built in (Twilio, Telesign, Unifonic, Vonage — verify current list) | Built in (you wire a provider) | Built in | Built in but **India pricing is high (~$0.07/SMS per 2026 comparisons)** |
| Admin 2FA (TOTP) | Built in, enforceable per instance/role | Built in (you maintain it) | Built in | Built in (Identity Platform) |
| Hosted auth UI | Yes (prebuilt, brandable, on your domain) | You build the UI | Yes (Universal Login) | You build the UI |
| Data export / deletion API | Yes (admin API + user deletion) | You build it | Yes | Yes |
| Ops burden | Near zero | You own: password hashing policy, OTP storage, session rotation, lockout logic, breach monitoring, security patches | Low | Low |
| Lock-in / exit | Real: proprietary hosted auth; migrate = re-verify users | None (DB + code you own) | Real (migration tooling exists but painful) | Real |
| Cost | Free tier ~10k MAU class, then usage-based (≈$0.02/MAU at 2026 published rates — re-verify) | Infrastructure only (small) | Per MAU + SMS add-ons | Per MAU + per-SMS |
| India SMS fit | Provider list is narrow; DLT registration is your job with Twilio (§5.3) | Any provider incl. cheap Indian ones | Any provider | Firebase numbers are a common India-first option but pricey; DLT also applies to any route |

**Decision**: **Clerk, hosted**, as the authentication provider (ADR-004).

**Reason**: (1) Cross-domain session sharing is the single hardest auth problem on the requirement list and Clerk solves it as a first-class, documented feature (one primary domain — we use `auth.company.com` — plus satellites for every product domain). (2) An engineer-count of 1–4 must not be responsible for OTP generation/storage, session rotation, or OAuth edge cases. (3) Built-in admin 2FA, webhooks, and user-export/deletion APIs map directly to DPDP obligations (§16). (4) The Company infrastructure supports it (23+ auth providers).

**Mitigation of lock-in — this matters and is designed in**: Clerk is a **pure sessions/credentials layer**. The identity graph (`users`, `identities`, `product_memberships`, `user_profiles`) lives in our PostgreSQL and is populated from verified webhooks. Clerk-held credential material (`clerk_user_id`, session tokens) is stored as opaque references, not as business keys; email/phone/photo live in our tables as well (mirrored from verified events). Therefore:
- A future migration to Better Auth or Auth0 means re-verifying users against their verified email/phone (standard account-portability flow) — the profile, memberships, waitlist position, consent records and audit trail survive untouched.
- All writes to identity data go through one module (`identity`), so swapping the provider touches one code path and one env group.
- Revisit trigger: sustained MAU cost > projected equivalent, or any blocker on India DLT/phone verification, or a product requirement Clerk cannot meet.

**What we deliberately do NOT do**: write our own OAuth/OTP code, store OTPs, or maintain a passwords database. Those are ADR-004 and §11 givens.

### 5.3 SMS OTP: the decision

**Requirement**: phone verification OTP for Indian (+ eventual global) numbers, with expiry, retry caps, rate limits and fraud controls. OTP values must never be stored in plaintext — under this design **they never touch our systems at all**: Clerk generates, delivers, and verifies codes; we only see verification *results*.

**Decision**: **Twilio Verify**, wired into Clerk, at launch (ADR-005).

**Why Twilio over alternatives**:
- It is on Clerk's supported SMS-provider list (with Telesign, Unifonic, Vonage — re-verify the current list at Phase 4), so it requires zero custom OTP code.
- Mature fraud tooling (Fraud Guard), global coverage, and per-verification pricing.
- Adapter behind an interface (`SmsOtpProvider`): swapping to an India-cost-optimized provider (MSG91, Exotel, Plivo — ₹0.18–0.25/OTP vs Twilio Verify's ≈$0.05/verification + fees, per 2026 public comparisons) is an integration change in one module, not an architecture change.

**India-specific reality check (documented, not solved here)**: TRAI requires DLT registration for commercial SMS to Indian numbers — entity registration (PE ID), 6-character sender ID headers, and pre-approved content templates with `{#var#}` placeholders. Summary of the published picture as of 2026: with Twilio, **the Company completes DLT registration itself** (a business-ops task, ~3–7 business days, and it must be done before any Indian OTP is sent; transactional/service-implicit category is the right one for OTPs); Indian aggregators (MSG91, Exotel, etc.) often handle DLT and template approval as part of the service. **This is a Phase 4 launch blocker to schedule, not a code task.** Also note OTP template OTPs do not require promotional-consent machinery (that is for marketing SMS, which we do not send).

**OTP policy (enforced by provider config + our rate limiting, §11.4)**:
- 6-digit numeric code, TTL **5 minutes**.
- Max **5 verification attempts** per code; code invalidated after max attempts.
- Request throttling (our layer, not provider): 3 requests / 15 min / phone, 5 / day / phone, 10 / hour / IP; per-identity cooldown 60 s between requests.
- Phone is a **verification factor, not a recovery factor**: a phone alone can never reset or re-verify an account; a verified email or Google identity is required for recovery (§11.5). This bounds SIM-swap and number-recycling risk.
- Phone-change flow re-verifies the new number on the same budget, and flags the change as a security event with re-authentication required.

### 5.4 Email: the decision

**Decision**: **Resend** for transactional mail (verification codes, waitlist notifications, application acknowledgements) (ADR — folded into §5.1). Dedicated subdomain `mail.company.com` with SPF, DKIM and DMARC (`p=quarantine` initially, moving to `p=reject` after monitoring). Codes delivered by Resend are generated and verified **by Clerk**; Resend is a transport, not an OTP authority. Postmark is the drop-in alternative if deliverability or volume economics change.

### 5.5 Object storage: the decision

| | **Cloudflare R2** | Amazon S3 | Supabase Storage |
|---|---|---|---|
| S3-compatible API | Yes (and AWS-SDK compatible) | Native | Yes |
| Egress fees | **None** | Yes (billed) | Yes (via CDN mostly) |
| Public CDN delivery | Native custom domains, Cloudflare cache | CloudFront (extra) | Yes (their CDN) |
| Signed URLs | Yes (presigned) | Yes | Yes, via their API |
| Interface portability | AWS SDK already works against R2 | — | Supabase SDK |
| Fit with stack | Same vendor as edge/WAF/Turnstile; one Cloudflare account | Extra vendor + egress cost | Pulls storage into the Supabase platform we otherwise don't use |

**Decision**: **Cloudflare R2** — two buckets (`company-private`, `company-public`), S3-compatible API so the storage layer is a thin adapter (ADR-008). Return path if R2 capabilities ever block us (e.g., need S3-specific features like object versioning or cross-region replication): swap the adapter to AWS S3 and redirect public reads to Cloudflare CDN (or keep public bucket in R2). Migration = copy objects + rewrite `files.storage_key` prefix — a script, not a redesign.

### 5.6 Service responsibility matrix

| Service | Owns | Does not own |
|---|---|---|
| Cloudflare (edge) | DNS, TLS, DDoS mitigation, WAF rules, challenge caps, cache of public assets, first-layer rate limiting, Turnstile | Business logic, authentication, authorization |
| Next.js app (Vercel) | Public pages, account UI, admin UI, `/api/v1/*` handlers, authorization rules, business validation, orchestration of all writes | Credential verification (Clerk), OTP generation/storage (Clerk/Twilio), durable storage (Neon/R2) |
| Clerk | Credential verification (Google OAuth, email code, phone code), session issuance/rotation/revocation, 2FA factors, hosting of sign-in UI at `auth.company.com`, user lifecycle webhooks, admin user ops (export/delete) | What a "Company user" means, product memberships, roles, admin authorization logic, consent records |
| PostgreSQL (Neon) | The Company's state of record: identity graph, waitlist, feedback, applications, files metadata, consent, audit | Sessions' secret material (opaque session references only), the files themselves |
| R2 | File bytes; immutable object keys; lifecycle rules; signed-URL semantics | Business rules about who may access a file (the app issues the signed URL) |
| Worker lane (QStash + functions) | AV scanning, retention purge/expiry jobs, CSV/JSON exports, restore drills, notification fan-out (Phase 7) | User-facing request handling (it is triggered by queue, not HTTP clients) |
| PostHog | Behavioral analytics events | PII beyond what we configure it to receive (no email in events by default; IP capture off) |
| Sentry | Error aggregation, release health | Raw request bodies/payloads (configured off) — stack traces only, with scrubbers |
| Better Stack | Log search, uptime checks, status page | Log content decisions — we define the JSON schema it receives |
| Future products | Their own data, their own DB; read-only consumption of signed identity claims | The Company identity graph, admin functions, other products' data |

---

## 6. Website architecture

### 6.1 Route inventory and access levels

Legend: **Public** = anyone; **Authed** = valid Clerk session (any verified user); **Admin** = session + `role='admin'` (+ MFA, §15.12); **System** = internal endpoint.

**Public routes** (`company.com`):

| Route | Purpose | Access | Rendering |
|---|---|---|---|
| `/` | Company home: value prop, product cards, waitlist CTA | Public | Static + ISR |
| `/about` | Company story, mission | Public | Static |
| `/products` | Product showcase grid | Public | ISR (data-driven) |
| `/products/[slug]` | Product detail, waitlist CTA per product | Public | ISR (data-driven) |
| `/team` | People | Public | Static |
| `/careers` | Open roles list | Public | ISR (data-driven) |
| `/careers/[slug]` | Job description + apply form | Public | ISR |
| `/updates` | Changelog / company news | Public | ISR (authored in DB) |
| `/contact` | Contact info + contact form | Public | Static + public form |
| `/feedback` | Feedback form | Public | Static + public form |
| `/waitlist` | Waitlist join (product selector) | Public | Static + public form |
| `/privacy`, `/terms`, `/security` | Legal + security disclosure (`security.txt`) | Public | Static |

**Account routes**:

| Route | Access | Notes |
|---|---|---|
| `/sign-in`, `/sign-up` | Public (redirects to `auth.company.com`) | We render shells; Clerk hosts the actual verification UI on the auth subdomain. On the primary domain, Clerk's domain strategy determines final cookie placement — implement per the Clerk "authentication across different domains" guide for the chosen primary domain. |
| `/verify-email`, `/verify-phone` | Public (session-aware) | Status + resend surfaces; actual verification happens at `auth.company.com` |
| `/profile` | Authed | View/edit global profile (§12) |
| `/account/settings` | Authed | Security: linked identities, verification status, MFA deep-link, marketing consent, download-my-data, delete-account (§16) |
| `/account/sessions` | Authed | Active sessions, revoke others (via Clerk) |

**Admin routes** (all **Admin**; see §17):

`/admin` (dashboard), `/admin/users`, `/admin/users/[id]`, `/admin/waitlist`, `/admin/feedback`, `/admin/applications`, `/admin/applications/[id]`, `/admin/products`, `/admin/security` (audit log, auth events), `/admin/jobs` (job postings editor).

**System routes**:

- `POST /api/v1/auth/webhooks/clerk` — Clerk signed webhooks (System; signature-verified).
- Health: `/api/v1/health` (liveness) and `/api/v1/health/deep` (DB + Redis + R2 reachability), for uptime monitors.

### 6.2 Rendering strategy

- **Marketing/public pages**: statically generated at build; **ISR** for data-driven lists (`/products`, `/careers`, `/updates`) with `revalidate` of 300 s and `on-demand` revalidation triggered on admin content edits (this keeps `lastmod` accurate for sitemap). No client-side fetching for first paint; suspense fallbacks only for personalized widgets (e.g., "you're on the waitlist" badge).
- **Account and admin pages**: server components with server-side session check; mutations via server actions or route handlers; no sensitive logic in client components. Client components carry no secrets and never render raw HTML user content (React escaping by default; a `sanitize`/allowlist check on any `dangerouslySetInnerHTML` — there should be none).
- **Auth-gated data**: the cookie/session is validated **server-side on every request** (Clerk `auth()`); client-side checks are UX only.
- **No client routing library** beyond Next.js App Router (`Link`); public pages get `<Link prefetch>` on the canonical domain only.

### 6.3 Access-control enforcement points (explicit)

1. **Middleware** (edge): cheap first gate — redirect unauthenticated users away from `/account/*` and `/admin/*`; host-based guard (§24.5 — `admin.company.com` only serves `/admin/*`, `api.company.com` only serves `/api/*`).
2. **Server components / route handlers** (the real gate): every protected page and every mutating handler re-checks the session and, for admin, the role. Middleware is never trusted as the only control.
3. **Data layer**: every query against user-owned tables is scoped by `user_id` from the session (parameterized join), never by an ID supplied by the client (§15.7 IDOR).
4. **Admin**: role check + MFA verification + audit-log write.

### 6.4 Public-site content model

Company content (about, team, updates, product blurbs) lives in PostgreSQL `products`, `job_postings`, `updates`-style tables (or a small `site_content` table for prose) so marketing edits don't require deploys. Team members are a `team_members` table (name, role, bio, photo file ref) managed via admin. Rich text is stored as **Markdown, rendered server-side with a strict allowlist renderer** (no raw HTML; if HTML is needed later, sanitize with an allowlist library such as DOMPurify on the server) — this is the XSS tripwire for authored content (§15.1 XSS row).

---

## 7. Central identity architecture

### 7.1 The model

```text
                    one human  =  one users.user_id  (UUIDv7, immutable)

   users (anchor: email, phone, status, role, timestamps)
     ├── user_profiles (global, product-agnostic profile: bio, avatar, prefs)
     ├── identities (proven external identities → same user_id)
     │     ├── provider=google  (provider_user_id = Google `sub`)
     │     ├── provider=email   (provider_user_id = normalized email)
     │     └── provider=phone   (provider_user_id = E.164 number)
     ├── sessions (observed session records → audit, not credentials)
     ├── consent_records (purpose-scoped, versioned, withdrawable)
     ├── audit_logs (immutable trail; admin + user events)
     └── product_memberships  (user × product)
            ├── product A (product_a_user_id, product-scoped prefs)
            ├── product B …
            └── product C …
```

**Rules**:
- `user_id` is generated by us (UUIDv7, sortable, unguessable — never a sequence; sequences leak user counts and enable enumeration, §15.15). It is the **only** key products should ever store for a person.
- Verified identities **map to, never replace, or duplicate** the anchor: an `identities` row is (provider, provider_user_id) → `user_id`. Uniqueness on (provider, provider_user_id) makes double-registration impossible at the storage layer.
- If a third identity arrives (user signs in with Google after email-signup, or links a phone), we look for an **existing verified identity of the same provider** (`identities`). If none, we look for a **verified email match** (Google `email_verified=true` email equals our canonical email, or equals an identity row of provider=email that is itself verified). Match by name or phone alone is **never** automatic (phone numbers recycle; names collide). Unresolvable conflict → "identity verification required" interstitial (re-verify via email code); this is deliberately rare, manual-reviewable, and audited.
- **One `user_id`, many identities** is what makes separate product domains work: every product authenticates the user against the same identity service, so `product-a.com` and `product-b.com` both resolve to the same `user_id` and each records its own membership row.
- Account **status** lives on `users.status` (`active | suspended | deactivated | pending_deletion`). Status is evaluated at every session-gated request server-side (a suspended user's session may still exist in Clerk; we enforce status in our middleware + handlers — defense in depth, §15.8).

### 7.2 Identity linking flows (concrete)

| Incoming event | Linkage rule | Result |
|---|---|---|
| Google sign-in, no existing user | Create user + `identities(google, sub)`; email copied to `users.email_canonical`, `email_verified_at` set (Google-verified); `user_profiles` created | New `user_id` |
| Google sign-in, `sub` already in `identities` | Match on (google, sub) | Same `user_id`; update profile photo/name from provider; bump `last_seen_at` |
| Google sign-in, unknown `sub`, but email matches a **verified** email identity | Link: add `identities(google, sub)`; keep canonical email; log `identity.link*` audit event | Same `user_id` |
| Google sign-in, email matches an **unverified** email | Do **not** link silently. Prompt email verification; on success, link. | Prevent mailbox-takeover carve-outs |
| Email code sign-in (new) | Create user + `identities(email, normalized)` with `verified_at` at first successful verification | New `user_id` (email-verified) |
| Email code sign-in (existing) | Match on (email, normalized) | Same `user_id` |
| Phone verification (new) | Create identity or attach to existing user **after the user is authenticated by at least one stronger factor** (email code or Google); phone alone never creates a brand-new privileged account — a phone-first signup flow is allowed only with an email verification step in the same session (§11.5) | Same `user_id` |
| Same phone on two users | Never auto-merge. Flag `identity.conflict` to admin security queue; retain both users; resolve manually with re-verification | Manual |

### 7.3 User ID generation and exposure

- IDs are **UUIDv7** (time-ordered, 128-bit, unguessable). URL-safe string form everywhere (no hyphens needed internally; keep canonical hyphenated form for consistency).
- Publicly exposed IDs: `user_id` (in the user's own data exports), `product_user_id` per membership, waitlist/entry IDs. Sequential integers appear **only** as internal row counters where non-exposed (e.g., no `id serial` in any user-facing table — all PKs are UUIDv7; the only sequential/`bigserial` allowed is in append-only internal tables such as log shreds, if ever used, and they are never serialized to clients).
- Enumeration protections: API responses never include counts, "is this email registered" hints, or sequential offsets; admin endpoints are admin-only (§15.15).

### 7.4 Sessions: provider-owned, us-observed

- Clerk owns session issuance, rotation, refresh and revocation (cookie/HTTPS-only, HttpOnly, Secure, SameSite — configured per our §15.9 policy).
- Our `sessions` table records **application-level facts** needed for observability and abuse analysis (session id hash/reference, user_id, started/last-seen/expiry, revoke metadata) — never tokens, never refresh material. Written from `session.created`/`session.revoked` webhooks.
- Revocation: account deletion, suspension, or "sign out everywhere" calls Clerk Admin API; our rows are marked accordingly.
- **Authorization is never stored in the session.** Roles come from `users.role` (DB) on every privileged request; a stale session can never carry stale admin rights.

### 7.5 Cross-domain story (future products)

Products authenticate via the keyless "share sessions across domains" model: `auth.company.com` is the Clerk **primary domain**; `product-a.com` is registered as a **satellite domain** so its app can read the same authenticated session state and redirect sign-in/sign-up to the primary domain. Per current Clerk guidance: one primary domain per instance; passkeys are not recommended across different domains (so passkeys are **not** a launch feature — revisit per-provider docs before enabling). Products also consume `POST /api/v1/identity/token` (client-credentials + session) or use Clerk's signed JWT template carrying `user_id`, verified-email and verified-phone claims (§12.4). Design constraint: a "logged in" product session must never imply anything about Company-account status beyond what the claims say; products re-check profile when needed via the identity API.

---

## 8. Database architecture

### 8.1 Design rules

1. **One database, one schema** (`app`), domain-bounded modules: `identity`, `engagement` (waitlist/feedback), `careers`, `cms` (products/site content), `ops` (files/audit/consent). Module boundaries are enforced by convention + import rules (an `engagement` module may not write `identity` tables except through `identity` service functions).
2. **All PKs are UUIDv7** (except where noted). No auto-increment ints in client-facing entities (§7.3).
3. **Timestamps**: `timestamptz`; `created_at` default `now()`; `updated_at` maintained by the app (not triggers, so behavior is visible in code).
4. **Soft-delete is not the default.** Data is hard-deleted per retention policy, with the deletion recorded in `audit_logs`. Soft-delete only where business meaning exists (e.g., `products.status='archived'`, `waitlist.status='removed'`).
5. **Foreign keys with `ON DELETE` behavior chosen per table** (documented below). No `RESTRICT` chains that make account deletion (a hard requirement, §16.6) impossible.
6. **Email/phone stored normalized** (lowercase/trimmed email, E.164 phone) with app-level normalization + unique indexes on the normalized form. `citext` avoided for portability; normalization is explicit in code.
7. **No JSONB as "a second database"**: JSONB only for (a) product-defined extension data (`product_memberships.metadata`, `products.config`), (b) audit `before/after` snapshots, (c) consent evidence. Core queryable fields are typed columns.
8. **Migrations**: Drizzle SQL migrations, committed, one-directional `up` (down-migrations forbidden as a release mechanism — §19.4). Applied via CI as **expand → deploy → contract**.
9. **Sensitive columns** (see table) are either (a) not stored (OTPs, tokens — never; ADR-004), (b) hashed (IP addresses → HMAC with a rotation-period pepper, for abuse analytics), or (c) restricted by role (`audit_logs`, `consent_records` are not readable by the app's `user-read` role paths).
10. **No cross-service DB sharing**: future products never connect to this database. They get the identity API (§12.4) and their own storage. (ADR-011 boundary.)

### 8.2 Table specifications

Conventions below: PK = primary key; FK = foreign key; "idx" = index; "uniq" = unique constraint; "part-uniq" = partial unique index (WHERE clause noted); "SENS" = sensitive-field handling.

#### `users` — the identity anchor

- **Purpose**: exactly one row per human. Immutable `id`; mutable, audited attributes.
- **PK**: `id uuid` (UUIDv7, app-generated).
- **Fields**: `role text` (`user` | `admin` — checked), `status text` (`active` | `suspended` | `deactivated` | `pending_deletion`), `email_canonical text` (nullable — a Google-only user may verify email later), `email_verified_at timestamptz`, `phone_e164 text` (nullable, `+91xxxxxxxxxx`), `phone_verified_at timestamptz`, `display_name text`, `avatar_file_id uuid FK→files`, `primary_identity text` (`google`|`email`|`phone`), `signup_source text` (route/UTM), `locale text` default `en`, `mfa_enabled boolean` (mirror of Clerk), `last_seen_at timestamptz`, `created_at`, `updated_at`, `deleted_at` (set only by the deletion job; rows are purged after the retention window, §16.6).
- **Relationships**: 1–1 `user_profiles`; 1–N `identities`, `sessions`, `product_memberships`, `waitlist_entries`, `feedback`, `job_applications`, `files`, `consent_records`, `audit_logs`, `auth_events`.
- **Indexes**: uniq `(email_canonical)` **partial WHERE `email_canonical IS NOT NULL AND deleted_at IS NULL`**; uniq `(phone_e164)` partial similarly; idx `(status)`, `(created_at desc)`, `(last_seen_at desc)`.
- **Constraints**: check `role in ('user','admin')`; check `status in (...)`; check email normalized (application-enforced); at least one verified identity required before any non-anonymous business record can be attached to a user.
- **SENS**: email/phone are personal data (encrypted at rest by provider; access restricted to authorized readers; never logged raw, §20.2).
- **Retention**: live while account exists; on deletion request → `pending_deletion` → purge cascade after 30-day cooling window (configurable, matches §16.6).

#### `user_profiles` — the global, product-agnostic profile

- **Purpose**: profile attributes that are **true across every product** (name, headline, bio, avatar, location, timezone, locale, preferences). Products read this; products never write it.
- **PK**: `user_id uuid` (1–1 with `users`; the PK *is* the FK).
- **Fields**: `headline text`, `bio text` (≤ 500 chars), `avatar_file_id uuid FK→files`, `location text`, `timezone text`, `locale text`, `website_url text`, `socials jsonb` (allowlist of keys: linkedin, github, x, instagram), `preferences jsonb` (marketing_opt_in, notify_email, notify_sms), `version int` (optimistic concurrency: profile saves send the version they read; mismatch → 409), `created_at`, `updated_at`, `updated_by_user_id`.
- **Indexes**: PK; idx `(updated_at)`.
- **Constraints**: lengths/length-limits checked; URL fields must parse as `https` and match an allowlist of hosts (SSRF-adjacent hygiene for link previews — we don't fetch them in v1, §15.4).
- **SENS**: bio is user-authored content — treated as untrusted (escaped on render); marketing_opt_in is a consent-derived field (see `consent_records`).
- **Retention**: with `users`; full deletion on account deletion.

#### `identities` — proven external identities

- **Purpose**: the mapping table that makes "one user, many sign-in methods, no duplicates" a database fact.
- **PK**: `id uuid`.
- **Fields**: `user_id uuid FK→users ON DELETE CASCADE`, `provider text` (`google`|`email`|`phone`), `provider_user_id text` (Google `sub`; normalized email; E.164 phone), `display_name`, `email_override` (Google's current email, if provider keeps it current), `photo_url` (transient: we cache to R2 and null this — see §14.3; never fetch remote URLs at render time), `verified_at timestamptz`, `last_verified_at`, `link_method` (`oauth`|`code`|`promotion`), `created_at`, `updated_at`.
- **Indexes**: uniq `(provider, provider_user_id)`; idx `(user_id)`; idx `(provider, verified_at)`.
- **Constraints**: `provider_user_id` non-empty; one row per (provider, provider_user_id) — the uniqueness constraint is the anti-duplicate backstop.
- **SENS**: `provider_user_id` for `email`/`phone` is the same personal data as above; Google `sub` is treated as pseudonymous secret-ish (never logged raw).
- **Retention**: deletes with the user. Historical linkage is preserved in `audit_logs` (link/unlink events), not in this table.

#### `sessions` — observed application-level session records

- **Purpose**: operational/security visibility into sessions (which device/IP signed in when, revocation audit) — **not** credential storage.
- **PK**: `id uuid`.
- **Fields**: `user_id uuid FK→users`, `provider_session_ref text` (short hash of Clerk session id), `kind text` (`browser`, `api`), `ip_hash text` (HMAC), `user_agent_summary text` (browser/OS family, not raw UA), `started_at`, `last_seen_at`, `expires_at`, `revoked_at`, `revoke_reason`.
- **Indexes**: idx `(user_id, started_at desc)`, idx `(expires_at)` (purge scan), idx `(ip_hash, started_at)`.
- **Constraints**: `expires_at > started_at`.
- **SENS**: none beyond hashed IP; **explicitly never store tokens/cookies here**.
- **Retention**: purge 90 days after `expires_at`/`revoked_at`.

#### `products` — the products the Company can showcase / onboard

- **Purpose**: registry of products (public showcase, waitlist targets, membership targets). One row per product; schema is deliberately generic because product internals are unknown (A5).
- **PK**: `id uuid`.
- **Fields**: `slug text` uniq, `name text`, `tagline`, `description_md`, `logo_file_id uuid FK→files`, `domain text` (nullable — product's own domain, e.g. `product-a.com`), `status text` (`draft`|`live`|`waitlist_only`|`archived`), `display_order int`, `accepts_waitlist boolean`, `accepts_membership boolean` (Phase 7), `config jsonb` (product-specific contract flags — e.g., `requires_phone`), `launched_at`, `created_at`, `updated_at`.
- **Indexes**: uniq `(slug)`, uniq `(domain)` partial WHERE domain IS NOT NULL, idx `(status, display_order)`.
- **SENS**: none.
- **Retention**: never hard-deleted while membership rows exist; `archived` for history.

#### `product_memberships` — user × product

- **Purpose**: the join that future products check before trusting a user, and the home of product-scoped state.
- **PK**: `id uuid`.
- **Fields**: `user_id uuid FK→users ON DELETE CASCADE`, `product_id uuid FK→products ON DELETE CASCADE`, `product_user_id uuid` (the user's ID **within that product** — generated by us so products need not invent one; immutable), `status text` (`invited`|`active`|`suspended`|`left`), `joined_at`, `invited_at`, `last_active_at`, `metadata jsonb` (product-defined, namespaced by product — the *only* cross-product-visible extension point), `created_at`, `updated_at`.
- **Indexes**: uniq `(user_id, product_id)`; idx `(product_id, status)`; idx `(product_user_id)` uniq.
- **Constraints**: metadata keys MUST be namespaced `{product_slug}:key` on write (enforced in service code — prevents one product overwriting another's data, §12.3).
- **SENS**: membership-derived personal data (what a user did in a product) — access-restricted.
- **Retention**: with user; product sees its own rows via API only.

#### `waitlist_entries` — see §9

- **PK** `id uuid`; fields per §9.3; indexes per §9.6.

#### `feedback` — see §10

- **PK** `id uuid`; fields per §10.2.

#### `job_postings` — career roles (added to the requested table set; required by the careers flow)

- **Purpose**: roles a visitor can view and apply to.
- **PK**: `id uuid`. **Fields**: `slug` uniq, `title`, `department`, `location_type` (`remote`|`hybrid`|`office`), `location`, `employment_type`, `description_md`, `requirements_md`, `compensation_range` (nullable), `status` (`draft`|`open`|`closed`), `opens_at`, `closes_at`, `created_by_user_id` FK→users, timestamps.
- **Indexes**: uniq `(slug)`, idx `(status, closes_at)`.
- **Retention**: retained for application-audit reasons (applications reference postings); anonymize sensitive free text with account deletion.

#### `job_applications` — career applications

- **Purpose**: one application per person per posting.
- **PK**: `id uuid`. **Fields**: `job_posting_id uuid FK→job_postings`, `applicant_user_id uuid FK→users` (nullable — anonymous applications allowed, but then email must verify? **Decision**: applications require an email address but not an account; if the user signs in later, the record is claimed by matching normalized email, §9.4's claim flow), `name text`, `email_normalized text`, `phone_e164 text` (nullable), `cover_note text` (≤ 4,000 chars), `resume_file_id uuid FK→files` (private), `portfolio_files jsonb` (array of file_ids, private; ≤ 3 files), `status text` (`received`|`under_review`|`interview`|`offer`|`rejected`|`withdrawn`), `interview_stage text`, `interview_at timestamptz`, `internal_notes text` (admin-only; not exposed via public API), `source text` (referral/linkedin/…), `consent_id uuid FK→consent_records`, `created_at`, `updated_at`.
- **Indexes**: uniq `(job_posting_id, email_normalized)`; idx `(status, created_at)`; idx `(applicant_user_id)`.
- **Constraints**: file size limits on resume (≤ 10 MB) and portfolio (≤ 25 MB total) enforced at upload (§14.5).
- **SENS**: CVs are high-value personal data — private storage, signed URLs only, access log entries; **never** exposed via public API; admin downloads audited (§14.9).
- **Retention**: 24 months after application decision, then purged unless the applicant is an active employee relationship — per policy, implemented by the retention job.

#### `files` — storage metadata (bytes live in R2)

- **Purpose**: metadata/security state for every object in object storage. Bytes never live in PostgreSQL (ADR-008).
- **PK**: `id uuid`. **Fields**: `owner_user_id uuid FK→users` (nullable for company assets), `purpose text` (`avatar`|`cv`|`portfolio`|`company_asset`|`product_asset`|`import`), `bucket text`, `storage_key text` uniq (immutable, server-generated `{purpose}/{yyyy}/{mm}/{uuidv7}.{ext}` — never derived from user input, §15.5), `original_name text` (sanitized, ≤ 255 chars, stored for display), `mime text`, `size_bytes int`, `sha256 text` (dedupe + scan lookup), `scan_status text` (`not_required`|`queued`|`clean`|`infected`|`failed`), `is_private boolean`, `expires_at` (preview/temp objects), `created_at`, `deleted_at` (+ actual purge by job).
- **Indexes**: uniq `(storage_key)`; idx `(owner_user_id, purpose)`; idx `(deleted_at)` partial; idx `(sha256)` partial WHERE scan_status != 'clean' (scan-backlog query).
- **SENS**: `storage_key` is capability-ish (a key alone is not sufficient with signed URLs, but keep it out of logs); original filenames may contain PII — used only for download naming.
- **Retention**: tied to owner; orphan sweep (files with no owner ref) daily; quarantined objects auto-purge after 30 days.

#### `consent_records` — evidence of consent, purpose-scoped

- **Purpose**: verifiable, versioned record of what a person consented to (DPDP-aligned §16.3).
- **PK**: `id uuid` (append-only; no updates — withdrawal is a new row).
- **Fields**: `user_id uuid FK→users` (nullable for pre-account inquiries), `subject_type text` (`user`|`visitor`), `purpose text` (`account_terms`|`privacy_policy`|`waitlist_contact`|`careers`|`feedback`|`marketing_email`|`marketing_sms`), `policy_version text` (hash/version of the notice shown), `granted boolean`, `recorded_at`, `withdraws_id uuid` (self-ref for withdrawals), `source jsonb` (page URL, ip_hash, user_agent_summary), `evidence jsonb` (banner interaction detail).
- **Indexes**: idx `(user_id, purpose, recorded_at desc)`; idx `(purpose, recorded_at)` (reporting); idx `(user_id, withdraws_id)`.
- **Constraints**: one current row per (user_id, purpose) determined by latest `recorded_at` — enforced by read-logic, history preserved append-only.
- **SENS**: purpose and version only; no message content.
- **Retention**: 7 years (aligns with consent-record expectations; confirm with counsel — see the KPMG/DPDP retention summaries cited in §16's notice).

#### `audit_logs` — immutable trail

- **Purpose**: every sensitive action (admin mutations, identity links, verification state changes, exports, deletions, security-relevant events) is recorded with before/after.
- **PK**: `id uuid`. **Fields**: `actor_type text` (`user`|`admin`|`system`|`service`), `actor_user_id uuid FK→users`, `actor_service text` (e.g., `admin`, `worker`, `product-a`), `action text` (`admin.user.suspend`, `identity.link`, `consent.withdraw`, … — controlled vocabulary in code), `entity_type text`, `entity_id uuid`, `before jsonb`, `after jsonb`, `metadata jsonb` (request_id, route), `ip_hash`, `user_agent_summary`, `created_at`.
- **Enforcement**: insert-only — app role has `INSERT`/`SELECT` but **no `UPDATE`/`DELETE`** on this table (DB-level grant, defense in depth). Monthly partition at scale (deferred trigger).
- **Indexes**: idx `(entity_type, entity_id)`, idx `(actor_user_id, created_at desc)`, idx `(created_at)`.
- **SENS**: `before/after` may contain PII for user-mutation events — access restricted to admin role + worker (no public API), never logged to log-shards (§20.2).
- **Retention**: 7 years, then archival to R2 (encrypted) before purge.

#### `auth_events` — authentication-related telemetry (added; supports §11 and §17 security UI)

- **Purpose**: the security dashboard's source: sign-in success/failure, OTP requests/verifications, verification completions, risk flags. Written from webhooks + our rate-limit decisions.
- **PK**: `id uuid` (or `bigserial` internal-only — never exposed).
- **Fields**: `event_type text` (controlled list), `provider text` (`google`|`email`|`phone`), `result text` (`success`|`failure`|`blocked`), `user_id uuid` (nullable), `phone_last4 text` / `email_domain text` (pseudonymized context; never full values in this high-cardinality table — see §20.2), `ip_hash text`, `user_agent_summary`, `rate_limit_bucket text`, `metadata jsonb`, `created_at`.
- **Indexes**: idx `(event_type, result, created_at)`, idx `(user_id, created_at)`, idx `(ip_hash, created_at)`.
- **Retention**: 12 months.

#### (Not stored by us, deliberately)

- **OTP codes**: generated, delivered and verified entirely by Clerk; **never** in our DB or logs (spec requirement: not even hashed — having no copy is strictly better than a hash, §11.5).
- **Passwords**: none at launch (email OTP + Google + phone). If password login is added later: Argon2id (memory-hard) via the auth provider's native password feature; never store or log passwords; breached-password check on set; same rate limits.
- **Tokens/refresh secrets**: only short HMAC references for correlation (e.g., `provider_session_ref`).

### 8.3 Connection strategy

- App → Neon via **pooled serverless connection** (pgbouncer-style; Neon proxy) with `max` connections tuned to function concurrency; a direct (non-pooled) URL exists for migrations only.
- **Never** open per-request raw connections without pooling; long-lived `pg` clients are forbidden in serverless functions.
- Read replicas: not at launch; trigger in §22 (query load or report queries on `waitlist_entries`/`feedback`/`audit_logs` slowing OLTP paths).
- Database access controls: app role (DML only, grants per table, no DDL); migrator role (DDL) used only by CI; direct `psql` from allowlisted IPs only; TLS required (managed by provider); secrets in env, never in connection strings committed to Git.

---

## 9. Waitlist architecture

### 9.1 Flow

```text
Frontend (/waitlist or product page)
   │  Turnstile token (site key scoped to company.com)
   ▼
POST /api/v1/waitlist        (JSON)
   │  Cloudflare rate limit (edge) ──▶ 429 + Retry-After
   ▼
Route handler
   ├─ 1. Turnstile verify (server-side, secret key)
   ├─ 2. Auth-aware: session? → user_id : anonymous
   ├─ 3. Zod validation: product_id/slug, email, consent flags
   ├─ 4. Business validation: product exists & accepts_waitlist;
   │     email normalized + disposable-domain block; referrer code
   ├─ 5. App rate limit (Upstash): 10/hour/IP, 3/min/IP, 30/day/email
   ├─ 6. Dedupe: partial-unique indexes + upsert (idempotent)
   ├─ 7. Insert/update waitlist_entries + consent_record (one txn)
   ├─ 8. Audit/event: waitlist.join (PostHog, pseudonymous)
   ▼
201 { entry_id, position?, already_present: bool, status }
   │  (no-queue-position numbers for anonymous entries? → see §9.6)
   ▼
Background (QStash, not in the request path): confirmation email
   (transactional, via Resend; only if consent_email=true)
```

### 9.2 Design decisions

- **Anonymous-first**: joining a waitlist is **not** gated behind an account (highest-conversion pattern). Account is optional at every step.
- **Claimable**: after sign-up, an anonymous entry whose normalized email matches the new user's verified email is **claimed** (user_id set) by the identity-claim job — this is how waitlist position survives the anon→user transition, and it makes the "already on the waitlist?" badge accurate.
- **Idempotent by design**: a second identical submit is a no-op returning the existing entry (`already_present: true`, 200) — see §9.5.
- **Consent**: joining requires an explicit, auditable consent row for `waitlist_contact` and a separate optional `marketing_email`. Only the former is required for the confirmation email.

### 9.3 Data model (fields of `waitlist_entries`)

| Group | Fields |
|---|---|
| Identity | `id uuid` PK, `user_id uuid` FK→users (nullable), `email_normalized text`, `phone_e164 text` (nullable, verified later) |
| Product | `product_id uuid` FK→products |
| Source/attribution | `referral_code text` (who referred; codes are per-user invite codes, generated on account creation — not user-supplied), `source jsonb` (`utm_source/medium/campaign`, page path, referrer domain — referrer stored as domain only, never full URL with query, §20.2), `country_hint` (derived from Cloudflare `CF-IPCountry` header — not GeoIP calls) |
| State | `status text` (`registered`|`invited`|`joined`|`removed`|`converted`; `converted` set by a product when the user becomes a product user), `email_verified boolean` (cheap flag for legitimacy analytics; note anonymous emails are not auto-verified), `consent_id uuid FK→consent_records` |
| Ops | `ip_hash`, `user_agent_summary`, `created_at`, `updated_at`, `opted_out_at` |

### 9.4 Duplicate handling & claim logic

1. **Storage backstop** (the authoritative dedupe):
   - `part-uniq (product_id, email_normalized) WHERE user_id IS NULL` — one anonymous entry per product per email.
   - `part-uniq (product_id, user_id) WHERE user_id IS NOT NULL` — one entry per product per user.
   - `uniq (product_id, email_normalized, user_id)` not used (the partials are stronger).
2. **Race window**: the two partial-unique indexes make concurrent duplicate inserts fail on the second commit; the handler catches the unique violation, re-reads the winner, and returns it with `already_present: true`. No lock table, no advisory lock, no custom dedupe service.
3. **Email normalization**: lowercase + trim + IDN→ASCII (punycode) + strip `+tag`? — **no**: keep plus tags (users use them deliberately); normalize only case/whitespace. Disposable-mail domains (maintained allowlist file, updated by CI weekly) → reject with a clear error (or accept with `status='removed'` + flag? — no: reject; honesty beats conversion here).
4. **Claim rules**: claim a user's entries when (a) email matches a verified email identity, or (b) phone matches a verified phone identity. Claim is idempotent and runs at sign-in, not at sign-up only. Never claims an entry whose email is unverified for that user.
5. **Change of email**: entries are keyed to the email at join time; a verified email change updates the user's entries (matching by old verified email) in the same transaction, and the audit trail records the migration.

### 9.5 Idempotency contract

- Client sends `Idempotency-Key` (a UUIDv7 generated per submission attempt). Server keeps a short-lived record (Redis, 24h TTL) mapping key → result. Replay with the same key returns the stored response without a second write.
- Even without the header, the natural-key upsert gives the same user-visible semantics (no duplicates), which is why the header is a performance nicety rather than a correctness dependency — document this explicitly so future agents don't add fragile dedupe layers.

### 9.6 Position, invites, exports

- Position: computed by `count(*)` of earlier entries in the same product **at read time**, never stored (avoids race-prone counters). Acceptable at waitlist scale; if a product needs stable ordering, a `position` column is an additive migration with backfill (defer; note trigger in §22).
- Invites (status `registered → invited`) are the product's job via the membership API; the waitlist module only records status transitions.
- Export: admin-only, async via worker (§17.4), CSV with column allowlist, signed URL, audit-logged.

### 9.7 Rate limiting (initial budgets — tune from staging)

| Scope | Limit | Notes |
|---|---|---|
| Per IP | 10/hour, 3 burst/min | Edge (Cloudflare) + app (Upstash) both enforce |
| Per email | 30/day, 5/hour | App layer — catches distributed spam across IPs |
| Per product | configurable 200/day | Admin-tunable; abuse spike alert (§20.5) |
| Global proxy abuse | Turnstile score/challenge escalation | Re-verify with challenge after 2 failures |

---

## 10. Feedback architecture

### 10.1 Flow

```text
Frontend (/feedback, or inline widget on any page)
   ▼
POST /api/v1/feedback
   ├─ Cloudflare rate limit + Turnstile (required)
   ├─ Zod validation (strict: category, message, rating, source)
   ├─ Honeypot field (hidden) → silently drop (200, no-op)
   ├─ Content checks: length, URL-allowlist, blocked-term soft flag
   ├─ App rate limit: 5/min/IP, 20/day/IP, 20/day/user
   ├─ Insert feedback (user_id from session if authed) + consent row
   ├─ Audit event feedback.created (+ PostHog event, no message body)
   ▼
201 { id, status: "new", duplicate?: bool }
   ▼
Admin queue (/admin/feedback): new → in_review → resolved | closed
   (admin notes, priority, assignment; every transition audited)
```

### 10.2 Fields (`feedback`)

| Group | Fields | Validation |
|---|---|---|
| Identity | `id uuid`, `user_id uuid` nullable FK, `ip_hash`, `user_agent_summary` | session-derived; client-supplied user ids ignored |
| Content | `category text` (`website`|`product`|`sales`|`careers`|`security`|`other`), `message text` (≤ 4,000 chars, ≥ 10), `rating smallint` 1–5 (optional), `page_slug text`, `url text` (≤ 500), `browser_lang` | allowlist category; message trimmed, control chars stripped |
| State | `status` (`new`|`in_review`|`resolved`|`closed`), `priority` (`low`|`normal`|`high`), `assigned_admin_id uuid FK→users`, `admin_notes text` (≤ 4,000; admin-only reads), `resolution text` (≤ 2,000, public-visible if the user is notified), `internal boolean` (team-internal feedback never visible in any export) | status transitions enforced in service code |
| Ops | `consent_id uuid`, `created_at`, `updated_at`, `resolved_at`, `source jsonb` | — |
| Dedupe | `fingerprint text` (hash of normalized message + category + email/user) | same fingerprint within 24h → return existing with `duplicate: true` |

### 10.3 Spam & abuse protection

1. **Turnstile** on the form (required for anonymous, recommended but not required for authed users — authed users are rate-limited harder instead: `authenticated` users get 100/day but no Turnstile, since the session is already a human-scale commitment. This keeps UX sane; adjust with data).
2. **Honeypot** hidden field + time-to-submit check (< 3 s → suspicious).
3. **Rate limits** above + per-category caps (e.g., at most 5 `security`-category items per IP per day — abuse target).
4. **Content moderation**: v1 = blocked-phrase soft flag + admin review queue; scalability path = third-party moderation API calling **only message text** (document the data flow + DPDP note in §25 before enabling; default off).
5. **Malicious-link hygiene**: URLs in messages are stored but never fetched server-side (SSRF guard); rendered as `rel="nofollow noopener ugc"`.
6. Feedback is **not** a support SLA: rate-limit budget is deliberately tight; abuse → temporary IP block at Cloudflare §15.10.

### 10.4 Retention & deletion

- Raw entries: 24 months, then purged by the retention job (aggregate statistics may persist without message bodies — check any such export against §16 policy).
- Account deletion: feedback rows anonymize (user_id nulled, message purged per policy; if the message is the only content, delete the row) — documented in §16.6. Admin notes are retained (they may reference the inquiry, not the person) — confirm with counsel.
---

## 11. Authentication architecture

### 11.1 Principles (read before implementing anything auth)

1. **Authentication ≠ authorization.** Authentication = "prove who you are" (Clerk's job: OAuth, OTP, session possession). Authorization = "may you do this" (our job: role checks, ownership checks, admin status — evaluated server-side against the DB on *every* privileged request, never cached from a client, never trusted from a signed-in-but-stale claim). §15.0 has the full model.
2. **The provider owns credentials; we own the identity graph.** Our systems never see OAuth access/refresh tokens (except transiently through the provider's server SDK, and we persist nothing), never generate, store, or log OTPs, and never hold password material. All verification *results* reach us through **signed webhooks** (HMAC-verified) and are written in idempotent service functions.
3. **Every auth event has a security trace.** Webhook → `auth_events` row; rate-limit blocks → `auth_events`; identity links, verification state changes, suspensions → `audit_logs`. The admin security screen (§17.6) reads these two tables only.
4. **Sessions are provider-owned, app-observed.** §7.4. Session validity is checked server-side per request; revocation (user action, admin action, security event) is executed on the provider via admin API.

### 11.2 Google Sign-In

```text
User (company.com or product-a.com)
   ▼ "Sign in with Google"
Clerk-hosted UI (auth.company.com) ──► Google OAuth consent
   ▼ authorization code (handled entirely by Clerk)
Backend receives NOTHING user-supplied about the identity
   ▼ webhook user.created / user.updated (signature-verified)
Identity service:
   1. normalize claims (sub, email, email_verified, name, picture)
   2. lookup identities(google, sub) ── hit → same user_id
   3. miss → match email_verified email against existing identity/user
         ── hit (verified) → link, add google identity
         ── hit (unverified) → require email verification before link
         ── miss → create user + identities(google, sub)
   4. upsert user_profiles (name, photo — fetched once, stored in R2)
   5. audit: identity.link / user.create (provider=google)
   ▼
Session issued by Clerk at primary domain → satellites read it
   ▼
product-membership record lazily created per product on first visit
   (membership is created by the product's first API call, not at sign-in)
```

**Rules**: `email_verified=false` Google accounts never auto-link to an existing account (§7.2). Google `sub` is the only stable Google key (emails change). Deleting a Google identity is a user action at `auth.company.com`; our mirror follows webhooks.

### 11.3 Email flow (registration, verification, login, reset, change)

**Design choice**: email **one-time codes (6-digit)** are the primary email path — no passwords at launch, no magic links (a code works when the email client is a mobile mail app and is less clickjacking-prone; provider-generates, we never see values).

| Flow | Steps (provider + our webhooks) |
|---|---|
| Registration | Sign-up at `auth.company.com` → code sent (via Resend provider transport) → user enters code → provider verifies → `user.created` webhook → we create `users` + `identities(email, normalized)` + `user_profiles`; email considered verified **only after** provider confirms; claim anonymous waitlist/application rows by normalized email (§9.4) |
| Verification (later, e.g., email added from Google-only account) | Same code flow; `user.updated` webhook with verified flag → we set `email_verified_at`, log audit |
| Login | Email + code (no password to brute-force). Code TTL 5 min, 5 attempts. If an existing **verified** email identity matches → same `user_id`. Rate limit per §11.6. |
| Password reset | **N/A at launch — there is no password.** If passwords are added later, reset must use a code to the **verified** email + re-verification of any factor used for recovery; never reset solely from a phone |
| Email change | Authenticated user requests change → code to **new** address → verified → update `users.email_canonical`, rotate `identities(email, old)` → `identities(email, new)`, audit `user.email.change`, **notify old address** (compromise-flag email) and re-run claim for waitlist entries; 24 h cooldown between changes |
| Recovery | Any verified identity (Google or email code). Email change and identity removal always require **re-authentication** (recent sign-in, ≤ 10 min) |

### 11.4 Phone flow (OTP)

```text
POST /api/v1/auth/phone/request   (authed session required — see below)
   ├─ session check (any verified user; phone can tag onto an account)
   ├─ per-user limits: 3/15 min/phone · 5/day/phone · 10/hour/IP
   ├─ cooldown 60 s per phone
   ├─ deliver via Clerk → Twilio Verify (DLT-compliant template)
   ▼
POST /api/v1/auth/phone/verify    { code }
   ├─ 5 attempts max; code invalidated after max attempts
   ├─ provider verifies → webhook → identities(phone, E.164)
   ├─ phone_verified_at set; audit phone.verify.success/failure
   ▼
User's account now has a verified phone identity; product_memberships
   may be resolved by phone for products that support phone-first UX
```

**Hard rules**:
- **OTP values are never stored by us** — not plaintext, not hashed; the provider holds and expires them. This is strictly stronger than the "never plaintext" requirement and is the reason for ADR-004.
- **Phone cannot create a standalone privileged account.** Phone-first sign-up is allowed only as *progressive* enrollment during a session already authenticated by Google or email OTP (or immediately followed by email verification in the same session). Rationale: phone numbers are recycled and SMS can be intercepted (SS7/SIM-swap). Phone is a convenience factor; email/Google is the recovery factor (§11.5).
- **Retry/expiry/rate-limit ownership is split deliberately**: provider enforces per-code attempt caps and TTL (5 min, 5 attempts); **we enforce** per-phone, per-IP and per-user velocity limits *before* delivery (cheap to block, no SMS spend), plus anomaly alerting (§20.5). Coordination is via `auth_events` counters, not by trusting the provider's numbers alone.
- **Fraud controls**: hour/day budgets above; blocking hashed-IP bursts; `CF-IPCountry` gate (outside supported regions → email-only path, configurable); digits-only validation; E.164 normalization by `libphonenumber`; recycled-number heuristic (a phone that verifies against a *different* user within N days → risk flag + re-email verification); phone change requires re-auth; phone-only account recovery is forbidden.
- **Refunds on failed delivery**: track `delivery_status` from provider callbacks into `auth_events` for cost monitoring (failed-delivery ratio is an alert, §20.5).

### 11.5 Account recovery & factor hierarchy

| Factor | Strength | Use for |
|---|---|---|
| Google OAuth (verified email) | High (mailbox control + Google MFA) | Login, recovery, identity linking |
| Email one-time code | High (mailbox control, codes are short-lived) | Login, email verification, recovery, email change |
| Phone SMS code | Medium (recyclable, interceptable) | Login convenience, MFA second factor, **never sole recovery** |
| Admin MFA (TOTP/authenticator on Clerk) | High | Admin login only (§15.12) |

Recovery algorithm: any **high** factor verifies the identity → session. If only phone remains, the account enters a 3-day recovery hold that re-notifies the old verified email/Google (if any remains) and allows re-verification; after hold, support/manual path with identity evidence. Simplification is intentional: we prefer slow recovery over insecure recovery.

### 11.6 Auth rate-limit budgets (initial — tune from data)

| Surface | Limit | Enforcement |
|---|---|---|
| Email code requests | 3/15 min/email, 10/day/email, 10/hour/IP | App (Upstash) |
| Phone code requests | 3/15 min/phone, 5/day/phone, 10/hour/IP, 60 s cooldown | App (Upstash) |
| Code verification attempts | 5/code (provider) + 15 min lockout on 5th failure | Provider + app |
| Sign-in attempts (any provider) | 10/15 min per IP+UA cluster; per-user 10/day | Cloudflare + app |
| Webhook receiver | Source-IP allowlist (Clerk IPs) + signature verify | System |
| Account enumeration | Uniform responses (§15.15); no "email exists" on login; code-based login has no pre-check | App |

### 11.7 Who owns what (provider vs backend — explicit)

| Concern | Owner |
|---|---|
| OAuth dance, token exchange, token storage | Clerk (we persist nothing) |
| OTP generation, hashing (internally), expiry, attempt caps | Clerk |
| OTP delivery channels (SMS via Twilio, email via Resend) | Clerk (transport keys live with Clerk account; **our env holds no SMS/email-OTP secrets**) |
| Session cookies, rotation, revocation, "sessions" management | Clerk |
| 2FA enrollment/verification for admins | Clerk (we enforce *policy*: admin role ⇒ MFA required) |
| `user_id`, identity graph, linking rules, membership records | **Us** (PostgreSQL, from verified webhooks) |
| Authorization (roles, ownership, scopes) | **Us**, server-side, per request |
| Audit of auth events, abuse analytics | **Us** (`auth_events`, `audit_logs`) |
| Account status gates (suspended/deleted) | **Us** (status column checked per request; enforcement also mirrored to Clerk's banned-users where supported) |

---

## 12. Shared profile architecture

### 12.1 The split (global vs product-specific)

```text
                Company User (users.id — the anchor)
                          │
            ┌─────────────┴─────────────┐
            ▼                           ▼
   GLOBAL (users + user_profiles)    PRODUCT-SCOPED (per product)
   ─────────────────────────────     ─────────────────────────────
   email, phone, verification        product display name *
   status, role                      product preferences *
   display name, avatar              product-specific settings
   bio, headline, timezone, locale   progress/state owned by product
   marketing consent, severity       (lives in the product's OWN db,
   (shared across ALL products)      surfaced via product tables),
                                     plus product_memberships.metadata
                                     (namespaced keys only)
```

- **Global data**: a person's fact base — verified email/phone (needed for *any* product's compliance flows), avatar, name, locale, consent. Canonical values are owned by `users`/`user_profiles` and **written only by the identity module** (or via admin).
- **Product-specific data**: *never* global. Each product owns its rows (its own DB or its own namespaced keys). The Company platform provides: (1) the membership row, (2) a `product_user_id` (stable ID the product may use internally), (3) the namespaced metadata container.

### 12.2 The overwrite-prevention rule (explicit)

- Products **cannot** modify `users` or `user_profiles` through any API we expose. The identity API (`GET /api/v1/identity/me`) is read-only. Profile edits happen only in the Company account UI (`/profile`, authenticated + audited).
- Products **can** write `product_memberships.metadata` but **only under keys prefixed with their own `product_slug`**: `"product-a:wizardStep": 3`. The service layer rejects unprefixed keys (`400 metadata_key_not_namespaced`). A product can read its own namespace only; cross-product reads are forbidden by the API scope.
- Concurrency: profile edits use optimistic `version`; membership metadata uses last-write-wins *within a namespace* (documented — products wanting richer semantics get their own tables, not metadata abuse).

### 12.3 What counts as global (decide once, remember forever)

| Field | Global? | Why |
|---|---|---|
| `email_canonical`, `phone_e164` + verified flags | Yes | Compliance (DPDP contact, notices), security (recovery), account identity — one truth |
| `display_name`, avatar | Yes | User-visible identity across products; confusing to differ per product |
| `headline`, `bio`, location | Yes (optional fields) | "Interested in" fields are product-level, not global (a user's Product A config ≠ Product B) |
| Product prefs, in-product state | No | Belongs to products |
| Marketing consent | Global by purpose (`marketing_email`, `marketing_sms`) | One consent center; per-purpose records in `consent_records` |

### 12.4 How future products authenticate & read the profile (the contract)

1. **Identity provider**: product domain is a Clerk **satellite** of `auth.company.com` → same session, sign-in/sign-up deep-links to the primary, `user_id` claim present from a signed token/Clerk session. (Passkeys not cross-domain-safe — off at launch, §7.5.)
2. **`GET /api/v1/identity/me`** (Bearer token minted by the product's OAuth client-credentials against the identity provider, or server-side Clerk session): returns the **verified claims envelope**:

```json
{
  "user_id": "0195a...",
  "email": "person@example.com",
  "email_verified": true,
  "phone": "+9198...",
  "phone_verified": false,
  "display_name": "Person",
  "avatar_url": "https://assets.company.com/avatars/...",
  "locale": "en",
  "membership": { "product_user_id": "...", "status": "active",
                  "product_slug": "product-a" }
}
```

Authorization: the token must be scoped to the calling product (`client_id`→`products.id`), and the `membership` object is present only if `product_memberships` has an active row for that product. **No endpoint returns another product's data.**
3. **Webhooks** (`user.updated`, `user.deleted`, `product.membership.changed`): products subscribe to deltas (email verified toggles, deletion notices — the latter is required by DPDP "erase" propagation, §16.6). Delivery = signed webhook to the product's registered `callback_url` (SSRF-guarded: allowlisted scheme/host, no redirects, DNS-rebound-safe, §15.4).
4. **Never**: shared database, shared Redis, shared session tokens, or trust in a product-supplied `user_id` (products can only reference, never mint).

### 12.5 Product onboarding checklist (Phase 7, for each new product)

Register `products` row → register domain as satellite → create OAuth client + scopes (`profile:read`, `membership:read`) → subscribe to webhooks → issue `product_user_id` on first contact → document retention/deletion mapping in the product's own DPDP review → load test identity API under product burst → run cross-domain E2E (product → auth.company.com → back, session persisted, one `user_id`).

---

## 13. API architecture

### 13.1 Contract rules

- **Base URL**: `https://api.company.com/api/v1/...` (canonical; also reachable on `company.com/api/v1/...` — WAF rule keeps the API domain API-only, §24.5).
- **Versioning**: major in the path (`/api/v1`); minor via `Accept: application/json; version=2` not used at v1 — additive changes (new fields, new endpoints) are non-breaking and don't bump versions; breaking changes require a new major path and a documented deprecation window (≥ 90 days) with `Sunset`/`Deprecation` headers. `/api/admin/*` is internal — no version promise, auth by role + MFA (§17.5).
- **Serialization**: JSON, `application/json; charset=utf-8`; `snake_case` fields on the wire (matches DB/TS discipline); no `__proto__`/key pollution risk (Zod schemas strip unknown keys by default).
- **Errors**: uniform envelope `{ "error": { "code": "waitlist_duplicate", "message": "…", "request_id": "…" } }`; HTTP semantics (400 validation, 401 unauthenticated, 403 forbidden, 404 no such resource, 409 conflict, 422 business-rule, 429 rate limit + `Retry-After`). Never leak internals in messages; `request_id` correlates logs.
- **Auth**: Bearer (Clerk session JWT for browser calls; client-credentials tokens for products) or HttpOnly cookie for same-site API calls; all mutating endpoints CSRF-protected (§15.9).
- **Pagination**: cursor-based (`?cursor=&limit=` max 100); no offsets on user-facing resources (enumeration + deep-pagination cost).
- **Idempotency**: POST endpoints accepting `Idempotency-Key` where client retry is plausible (waitlist, feedback, applications, uploads-complete).
- **Rate limits**: per-endpoint budgets in §13.4, enforced edge + app, `429` with `Retry-After`; envelope includes `X-RateLimit-Limit/Remaining/Reset`.

### 13.2 Namespace map

| Namespace | Public | Sessions | Role-gated | Notes |
|---|---|---|---|---|
| `/api/v1/auth/*` | Partial | Partial | — | Thin wrappers + webhook receiver; verification UI lives on `auth.company.com` |
| `/api/v1/identity/me`, `/api/v1/identity/token` | — | Yes (or client-credential) | Scoped product tokens | §12.4 |
| `/api/v1/users/me`, `/users/me/…` | — | Yes | Own record only | Self-service: profile, settings, consent, data export/delete |
| `/api/v1/waitlist` | POST (anon ok) | Optional | — | §9 |
| `/api/v1/feedback` | POST (anon ok) | Optional | — | §10 |
| `/api/v1/careers/…` | GET postings public; POST apply public | Optional | — | Apply = anonymous with email, claimable later |
| `/api/v1/products` | GET public | — | — | Showcase list/detail; membership endpoints are product-scoped tokens |
| `/api/v1/uploads/presign` | — | Yes | — | Signed-URL issuance (§14.6) |
| `/api/v1/admin/*` | — | Yes | `admin` + MFA | §17; never returns public-machine-readable schema without auth |
| `/api/v1/health*` | GET | — | — | Liveness/deep |

### 13.3 Important endpoints (contract level)

| Endpoint | Method | Auth | Input (validated) | Output | Failure cases |
|---|---|---|---|---|---|
| `/api/v1/waitlist` | POST | optional session | `product_id` or `slug`, `email`, `referral_code?`, `turnstile_token`, consents, optional `Idempotency-Key` | 201 `{entry_id, product_id, status, already_present}` | 400 validation, 403 Turnstile fail, 409 duplicate w/ `already_present` (200-shaped), 429 limits, 422 product not accepting |
| `/api/v1/feedback` | POST | optional session | `category`, `message`, `rating?`, `page_slug?`, `url?`, `turnstile_token`, `honeypot` | 201 `{id, status:"new"}` | 400, 403 bot, 429, 422 blocked-term flag (still accepted, flagged) |
| `/api/v1/careers/[slug]/apply` | POST | optional session | `name`, `email`, `phone?`, `cover_note?`, `resume_file_id` (from presign), `portfolio_file_ids[]`, consent | 201 `{application_id, status:"received"}` | 404 posting, 413 file too large (upload-time), 409 duplicate application, 422 posting closed |
| `/api/v1/identity/me` | GET | session or product token | — | claims envelope (§12.4) | 401, 403 missing scope |
| `/api/v1/users/me` | PATCH | session | profile fields w/ `version` | 200 updated profile | 409 stale version, 403 field not user-editable |
| `/api/v1/users/me/consent` | GET/PUT | session | purpose + granted | 200 current consents | 400 unknown purpose |
| `/api/v1/users/me/export` | POST | session (+re-auth) | format (`json`/`csv`) | 202 job id → signed URL when ready | 429 abuse |
| `/api/v1/users/me` | DELETE | session (+re-auth + typed confirmation) | — | 202 `{deletion_at}` | 429 |
| `/api/v1/uploads/presign` | POST | session | `purpose`, `mime`, `size_bytes` | `{key, signed_url, expires_at}` | 400 mime/size not allowed, 403 purpose not allowed |
| `/api/v1/auth/webhooks/clerk` | POST | **signature-verified, source-IP allowlisted** | raw event payload | 200 ack (idempotent) | 401 bad signature (and alert) |
| `/api/v1/admin/*` (see §17) | varied | admin | — | — | 401/403/429; every mutation audited |

### 13.4 Rate-limit table (initial budgets; tune from staging telemetry)

| Class | Default | Notes |
|---|---|---|
| Public read (products/careers) | 120/min/IP | CDN-cached where possible |
| Public form POST (waitlist/feedback/apply) | 10/hour/IP (waitlist), 5/min+20/day/IP (feedback) | Edge + app |
| Authed API (self-service) | 300/min/user | Redis per-user bucket |
| Identity API (products) | 100/min per client-id, 1,000/day | Per-product token quotas; spike alerts |
| Admin API | 60/min/admin | Logging enforced |
| Upload presign | 10/hour/user | Plus per-purpose caps |
| Export/delete | 1/day per user (export), 2 total deletes/day/IP | Anti-abuse on expensive jobs |

---

## 14. File storage

### 14.1 Layout

```text
PostgreSQL `files` = metadata, ownership, scan state, access policy
Cloudflare R2:
  company-private/   avatars(cache-out soon), cv/, portfolio/, imports/, quarantine/
  company-public/    company-assets/, product-assets/, og-images/, avatars/ (final)
Public reads → assets.company.com (Cloudflare cache, immutable hashed names)
Private reads → presigned GET URL, 15 min TTL, key-scoped, issued server-side
```

### 14.2 Buckets & access

| Bucket | Access | Used for | Delivery |
|---|---|---|---|
| `company-private` | Private; no public URL | CVs, portfolio, imports, temp uploads, quarantine | Presigned URLs only (≤ 15 min), issued after authz check (§14.6) |
| `company-public` | Public read via custom domain | Avatars, company/product assets, OG images | CDN cache 1 year + `immutable` (content-hashed names) |

### 14.3 Upload lifecycle

```text
client → POST /api/v1/uploads/presign {purpose, mime, size}
   ├─ session check; purpose allowlist (avatar|cv|portfolio|import)
   ├─ MIME allowlist + extension mapping; size caps; sha256 on client optional
   ├─ server-signed PUT URL (R2 presign, 5 min TTL) to temp key
client → PUT R2 (direct, does not pass through our servers)
client → POST /api/v1/uploads/complete {key, ...}
   ├─ verify size/mime from metadata; fail → 422
   ├─ route to final key {purpose}/{yyyy}/{mm}/{uuidv7}.{ext}
   ├─ register files row (scan_status=queued if required)
   └─ enqueue scan job (QStash)  [v1: for cv/portfolio/import only]
worker → scan → clean → promote (final key already in place; quarantine on fail)
   → infected → quarantine/delete + notify owner (email); log audit + alert
```

- **Client-supplied object keys are forbidden** — every key is server-generated (path traversal protection is a non-issue by construction, §15.5).
- **Avatars**: images are re-encoded server-side to ≤ 256×256 WebP (strips EXIF/GPS — a real privacy leak on phone photos — and kills embedded scripts in SVG; **SVG is not accepted for uploads at all**), then copied to the public bucket. The original is deleted. (ExifTool/sharp in worker.)
- **Impossible-to-execute content**: upload content is never served from our origin with attacker-chosen content-type; public buckets serve with the immutable stored MIME and `Content-Disposition: attachment` where appropriate; `X-Content-Type-Options: nosniff` at the CDN.

### 14.4 File validation matrix

| Purpose | MIME allowlist (checked: declared, by magic bytes, and after re-encode where applicable) | Max size | Public? | Scan | Notes |
|---|---|---|---|---|---|
| Avatar | `image/jpeg|png|webp` (magic-bytes verified; re-encoded to WebP) | 5 MB | Yes (public copy) | Not required (re-encode neutralizes) | EXIF stripped by re-encode |
| CV | `application/pdf` (magic bytes), + `text/plain`/`docx` optional later | 10 MB | No | **Required** (ClamAV + hash lookup) | PDF is the only accepted format in v1: simplest to scan & render |
| Portfolio | `application/pdf|zip` (zip listed, scanned; contents never extracted server-side in v1) | 25 MB total, 10 MB/file | No | Required | Zip is scanned then only ever re-downloaded by its owner |
| Company/product assets | `image/jpeg|png|webp|mp4|webm|pdf` | 50 MB | Yes (scoped by purpose) | Not required (op-editor uploads) | Uploader = admin role only |
| Import (backups/CSV) | `text/csv|json|gz` | 100 MB | No | Required | Admin-only, Phase 6+ |

### 14.5 Virus & malware scanning (concrete plan)

- v1 (launch): **hash screening** — file `sha256` checked against VirusTotal (hash lookup only; the API key never leaves the worker; if the API is unavailable, policy = "unscanned = quarantined" is too aggressive for launch, so: scan blocklisting happens in CI-tested worker, and the *status* column makes history inspectable; a hash-only lookup failure falls back to `scan_status='failed'` + alert, not silent pass).
- v2 (Phase 5 hardening): **ClamAV container** (in the worker lane, a small Fly.io/Railway job, not Vercel functions) scanning bytes before promote; quarantine prefix + 30-day auto-purge; infected → `files.scan_status='infected'` + owner notified + admin alert.
- Files stored only after (or while) scanning; **serving an unscanned private file is permitted only when the owner is the only possible reader and scanning completed within 24 h** — the signed-URL issue path refuses `scan_status IN ('queued','infected','failed')`.

### 14.6 Signed URLs & access control

- Only the server issues them (`/api/v1/uploads/presign` and a `GET /api/v1/files/[id]/download`-style issue endpoint that re-checks ownership/role).
- TTL 15 min for private reads; write presigns 5 min; `Content-Disposition` forced; no query-param secrets ever logged (redact signed URL query strings in logs).
- Ownership rule: `files.owner_user_id` must equal session user, **or** the file is admin-visible (role check), **or** purpose = company/public asset. Admin CV access is audited (§17.5).
- No public signed URLs for public bucket objects (cache-friendly, no signature overhead).

### 14.7 Retention & deletion

- `files.deleted_at` soft-mark on owner deletion → nightly job purges R2 objects + rows; quarantine 30-day auto-purge; temp-upload prefix 24-hour lifecycle rule (R2 lifecycle policy); orphan sweep (row without owner and older than 48 h).
- Account deletion cascades: avatars/CVs/portfolio deleted; exports of the user's own data remain subject to the deletion request themselves.

### 14.8 Scanning policy recap

Virus scanning requirements by purpose are specified in the validation matrix in §14.4 and the scan pipeline in §14.3 (hash screening at v1; ClamAV in the worker from Phase 5; quarantine lifecycle in §14.2/§14.7).

---

## 15. Security architecture

### 15.0 Authentication vs Authorization (stated once, enforced everywhere)

- **Authentication** — proving identity: delegated to Clerk (§11). The authenticated principal is *only* ever `users.user_id` + an expiry.
- **Authorization** — deciding what that principal may do: **our code, per request, server-side, against PostgreSQL**. There is **no** client-supplied role, no "admin" query param, no role in the session token that the client could influence, and no cached authorization across requests. Authorization checks are: (1) role check (admin endpoints), (2) ownership check (the object's `user_id` = session user; IDs never taken from request bodies for user-scoped reads — IDOR rule), (3) scope check (product tokens), (4) status check (blocked/suspended users rejected before any business logic, and re-checked on privileged ops).

### 15.1 Controls by threat (OWASP Top-10-aligned; names used, numbered lists intentionally avoided)

| Threat | Attack vector / example | Control (where implemented) |
|---|---|---|
| SQL injection | Interpolated user input in query | Parameterized queries only; Drizzle query builder (no raw string SQL without explicit parameter binding); DB role has no DDL; code-review + Semgrep rule in CI (§19.2); tests assert no raw-SQL paths |
| XSS | Stored (feedback/job notes/authors content) & reflected | React auto-escaping; no `dangerouslySetInnerHTML` (lint-blocked); Markdown rendered server-side via allowlist renderer (no raw HTML); CSP (§15.10); `trusted-types` where feasible; authored content (products/jobs/updates/admin notes) sanitized on write with allowlist |
| CSRF | State-changing request forged cross-site | SameSite=Lax sessions + `Origin`/`Sec-Fetch-Site` check on all mutating handlers + double-submit token for form-based flows; per-host origin allowlist (company.com, admin.company.com, api.company.com); **no CORS `*` anywhere** (§15.11) |
| SSRF | Server fetches attacker-supplied URL | No server-side URL fetching from user input in v1 (no link previews, no remote avatars — cached at first sign-in); the only outbound fetches: allowlisted vendor APIs, Turnstile, webhook callbacks (validator: https-only, allowlist hosts, no redirects, DNS-rebind-resistant resolve-then-connect, response-size caps) |
| IDOR/BOLA | Guess/swap an object id to read others' data | UUIDv7 ids + ownership joins (§15.7); all user-scoped reads derive `user_id` from the session; object-level checks via single parameterized queries; automated tests per endpoint assert cross-user 403 |
| Broken authentication | Stolen/weak sessions, no lockouts | Provider-managed credential verification; short-lived sessions; strict rotation; no passwords at launch; 2FA on admins; limit-based lockouts and alerts; session revocation on security events |
| Broken authorization | Privilege escalation (user → admin) | Role checks + MFA gate + audit; role changes are themselves audited and can only be performed by an admin with MFA (never via a self-service endpoint); defensive tests in CI |
| Session hijacking | XSS-stealed cookie / fixation | HttpOnly+Secure cookies; no client-readable session storage; session validation server-side on each request; re-verification on sensitive ops (export/delete/email change) |
| Brute-force / credential stuffing | Repeated login attempts, leaked-password reuse | No passwords at launch; code-based login is OTP-only; per-IP+per-user velocity limits (§11.6); Cloudflare edge blocking + challenge escalation; anomaly alert (§20.5) |
| OTP abuse | SMS bombing, OTP cracking, delivery fraud | Rate limits §11.4; provider-side attempt caps + TTL; cost alerts on delivery volume; phone-not-recovery rule; blocklist + risk flags |
| API abuse | Scraping, junk submissions, credential stuffing via API | Turnstile on public forms; edge + app rate limits; per-product token quotas (§13.4); response-weight caps; payload size caps at edge |
| Rate-limit bypass | Distributed IPs, IP rotation | Per-identity and per-phone limits *in addition to* per-IP (bypass-resistant); heuristics + challenge escalation; WAF rules on ASN/fingerprint anomalies; alerting on limit-hit rates |
| File-upload attacks | Malware, polyglot files, oversized uploads, extension spoofing | §14 matrix: size caps (edge + app), MIME allowlist + magic bytes, re-encode for images, no SVG, scan (hash + ClamAV), quarantine+purge, filename sanitization, no user-controlled keys, serve with nosniff/immutable MIME |
| Path traversal | `../../` in keys/filenames | Keys are server-generated UUIDs (§14.3); original names sanitized (`[A-Za-z0-9._ -]` only) and used for display/disposition only |
| Enumeration | User/email/id existence leaks via timing or messages | Uniform auth responses (no "email registered" on login surfaces; sign-up not gated on existence); waitlist/feedback never reveal other users' data; no sequential ids; no public counts; timing-consistent responses (constant-time compare paths, no early-return on user lookup that differs measurably) |
| Sensitive-data exposure | Secrets/PII in logs, responses, client bundles | Secret linting + no client env secrets (everything not `NEXT_PUBLIC_` is server-only); log redaction (§20.2); API never returns `internal_notes`, `admin_notes` to non-admins; PII in responses limited to the surface's contract |
| Security misconfiguration | Debug modes, verbosity, open ports, missing headers | Default-deny headers (§15.10); no debug/prisma-studio/other tools in production; dependency + config scans in CI; staging mirrors production config (not "prod-like but different" where it matters); quarterly config review checklist |

### 15.2 Transport & cryptography

- HTTPS everywhere; HTTP → 301 (Cloudflare, all zones); **HSTS** `max-age=31536000; includeSubDomains; preload` on apex (after a 2-week `no-preload` soak — the standard rollout nuance; **do not preload before confirming subdomain TLS is fully covered**, §24).
- TLS 1.2 minimum, 1.3 preferred (Cloudflare-managed, "Modern" setting); automated cert issuance/renewal (Cloudflare); certificate-expiry alerting.
- **At rest**: managed providers' encryption (Neon disk-level; R2 server-side encryption; Vercel env KMS). No application-level encryption of personal data in v1 — instead: **minimization** (no OTPs/tokens, hashed IPs) + access controls + deletion. If a column later needs field-level encryption (e.g., long-term sensitive archives), use `pgcrypto` with a KMS-held key in a separate account — defer until justified (record as an open question, §29).

### 15.3 Input validation & output encoding (the practical rules)

- **Single Zod schema per public contract**, shared client/server; `strict()` — unknown keys rejected/stripped; max lengths in characters (not bytes) with byte-cap for DB (e.g., 4,000 chars / 16 KB); Unicode NFC normalization; control-character stripping; email/phone normalization functions are the only writers of those columns.
- Output: React escapes by default; JSON responses use `res.json` (no string interpolation); headers set to UTF-8; no reflected input in HTML; CSP as the last-resort net (§15.10).

### 15.4 (SSRF specifics — see row above; no new subsection)

### 15.5–15.7 (referenced controls live in §15.1 rows; details for the three highest-attention flows)

- **File-upload path**: §14.3–§14.6.
- **IDOR discipline**: every controller that takes an `:id` in a path must be reviewed against the rule "is this the session user's own record?" — enforced in code review with a checklist and in automated tests (§18.5).
- **Sessions**: §7.4, §11.1.

### 15.8 Account status enforcement matrix

| Action | Suspended | Pending deletion | Deleted |
|---|---|---|---|
| Read public content | Yes | Yes | Yes |
| Sign in | No (provider banned-user mirror where supported) | No (grace path allowed: re-activate within 30-day window) | No |
| Own data (profile, waitlist, feedback owned) | Read-only except account recovery | Read-only | Gone (per retention) |
| New writes (forms, applications) | No | No | No |
| Admin actions | n/a | n/a | n/a |

### 15.9 Cookies, CSRF & CORS (concrete policy)

- Auth cookies: provider-managed, **HttpOnly + Secure + SameSite=Lax**; `__Host-` prefix where the provider supports it; no `Domain=` wildcard across product domains (cross-domain sharing is via satellite-domain session mechanics, not shared cookies — see §7.5; do **not** "fix" this by making cookies domain-wide).
- CSRF: SameSite=Lax handles the browser-default flows; mutating handlers additionally require the `Origin` header to be in the allowlist (or `Sec-Fetch-Site: same-origin`), because Lax still sends cookies on top-level POST navigation in some browsers — the origin check is the reliable backstop. State-changing admin endpoints also require a CSRF token when invoked from forms.
- **CORS**: explicit allowlist only. `api.company.com` allows origins: `https://company.com`, `https://admin.company.com`, and later `https://product-a.com` (per-product entries added deliberately, with credentials only where the satellite session model requires; bearer-token callers from products don't need credentialed CORS). No `Access-Control-Allow-Origin: *` anywhere. Preflight caching `max-age=600`.

### 15.10 Security headers (set at Cloudflare and/or origin — verify at both, CSP at origin)

```
Strict-Transport-Security: max-age=31536000; includeSubDomains        (preload after soak)
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-…';
  style-src 'self' 'unsafe-inline'; img-src 'self' data: assets.company.com;
  connect-src 'self' https://api.company.com https://analytics.*; frame-ancestors 'none';
  base-uri 'self'; form-action 'self' https://auth.company.com; object-src 'none';
  upgrade-insecure-requests                                            (nonce-based, per-render)
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
X-Frame-Options: DENY (legacy belt-and-braces alongside frame-ancestors)
Cross-Origin-Opener-Policy: same-origin
```

CSP rollout: report-only in staging first, then enforced with a Sentry-visible `securitypolicyviolation` event handler; `unsafe-inline` for styles is a conscious Tailwind/SSR tradeoff (no `unsafe-eval`, no inline scripts; nonces for scripts).

### 15.11 Secrets management (explicit)

- Secrets live in **Vercel environment variables** (env-scoped: development/preview/production; encrypted at rest, KMS-backed) — the app never has a `.env` file in the repo. `env.example` (no values) is committed with a comment per variable.
- Human-facing vault: **1Password** (or Doppler as the machine-centric option; choose one — 1Password, since the team already has it — the *audit trail* of who can see which secret is the point, not the tool).
- Rules: never commit secrets; never log env/config; no `NEXT_PUBLIC_*` for anything secret; quarterly rotation of vendor keys (Twilio, Resend, R2, Upstash, Turnstile secret, PostHog, Sentry) with a documented rotation checklist; `gitleaks` on every PR + pre-commit hook. If a secret leaks to Git: rotate immediately, purge history (rewrite + force-push with coordination), and run a postmortem — GitHub secret scanning alerting is a fallback, not a control.
- Least privilege on every vendor key: R2 credentials scoped to the two buckets' required prefixes; Twilio = Verify service only; Resend = send-only API key; Turnstile = secret keys domain-scoped per zone.

### 15.12 Admin MFA & privileged access

- Admin role ⇒ **TOTP/authenticator 2FA enforced** (provider-level; enforce in our middleware too — a session without a verified second factor cannot reach `/admin/*`).
- Admin accounts: separate from day-to-day user accounts is **optional** (small team; same account OK) but the account must have a unique, personal email (no shared mailbox) and MFA.
- Admin login: no "remember me" persistence beyond the session lifetime; idle timeout 30 min; all admin mutations require a *recent* authentication (≤ 10 min) for sensitive classes (exports, user suspension, data deletion, role changes).
- Break-glass: one documented, monitored emergency admin, key in 1Password vault, login triggers an alert.

### 15.13 Audit logging (engineering spec)

- Every admin mutation writes `audit_logs` in the **same database transaction** as the change (§17.5). Every identity/verification/consent/security event writes `audit_logs` or `auth_events` as specified.
- Immutability: DB grants prevent app-role UPDATE/DELETE on `audit_logs`; log shards never contain audit before/after snapshots (§20.2); retention 7 years.
- What is NOT audited (to avoid collecting junk PII): full request bodies, message content of feedback (reference only), the contents of CVs (file id + access event instead).

### 15.14 WAF & bot protection (Cloudflare config)

- WAF managed rulesets on (SQLi/XSS/known-CVEs) + custom rules: block `admin.company.com` paths not under `/admin`; block `api.company.com` paths not under `/api`; geo/country config per environment (staging = allowlisted IPs); challenge on repeated 429s; rate rules per §13.4 mirrored at the edge; Turnstile managed challenge on public forms.
- Bot blocking: `Managed Challenge` on admin login + sign-up pages by default; `Turnstile (Manually Triggered)` mode so pages stay HTML-first (SEO) and the challenge only appears on interaction or per risk signal.

### 15.15 Enumeration hardening (recap — cross-cutting)

Uniform errors, no existence leaks in auth flows (§11.6), no sequential ids (§7.3), no public counts (waitlist positions are returned only to the entry's own email/user), feedback/application ids only ever returned to their submitter, admin-only search surfaces, response times normalized (no has-user short-circuits that are measurably faster; if they are, equalize with a dummy work item).

---

## 16. Privacy and data protection

### 16.1 Status & scope (read this first)

The Company processes personal data of real users and is a **Data Fiduciary** under India's Digital Personal Data Protection Act, 2023 ("DPDP Act") and the DPDP Rules, 2025 (notified 13 Nov 2025; published guidance points to a full-compliance deadline around **13 May 2027** with staged items such as Consent Manager registration around Nov 2026). Acknowledged compliance-relevant items the engineering supports: clear/plain-language notices, purpose-limited consent with records, data-principal rights (access, correction, erasure, nomination, grievance) with ≤ 90-day response targets, breach intimation (first intimation without delay; detailed intimation within 72 hours to the Data Protection Board; affected individuals within 72 hours of Board intimation per published guidance), and child-related rules (< 18: verifiable parental consent; no targeted advertising/tracking to children — the platform will require 18+ affirmation at sign-up and will not run behavioural ads anyway).

**This section is engineering guidance only. It is not legal advice.** The launch gate in §28 (Phase 6) requires review by qualified Indian counsel, including: final privacy policy and consent notices (in English and a language understandable to users — e.g., Hindi), the definition of claimed exemptions/legitimate uses, consumer-facing grievance contact details, data-fiduciary and cross-border-transfer determinations, and designation as a Significant Data Fiduciary (which would add DPO, data-auditor and DPIA obligations). No technical control in this document is claimed to constitute legal compliance.

### 16.2 Data minimization (the table that drives every field)

| Data | Purpose | Stored | Retention |
|---|---|---|---|
| Name | Identity, communications | `users.display_name` | Account life |
| Email | Identification, verification, notices | `users`, `identities` | Account life; 30-day deletion purge |
| Phone | Verification (optional factor) | `users`, `identities` | Account life |
| Avatar/photo | Profile display | R2 public (WebP) | Account life |
| IP address | Abuse prevention, security analytics | **HMAC-hashed** (peppered, rotated) → `ip_hash`; Cloudflare edge retention is provider-ruled (§25) | Hashed: 12 months |
| User-agent | Fraud clustering (device hints) | Summarized (browser/OS family only) | 12 months |
| Feedback message | Product improvement, support | `feedback.message` | 24 months, then purge |
| Waitlist email | Contact re: product availability | `waitlist_entries` | Until status resolves + 24 months |
| Application + CV | Hiring | `job_applications` + private R2 | 24 months post-decision |
| Referral/UTM source | Conversion analysis | `source` JSON | 12 months for campaign join |
| Consent records | Legal evidence | `consent_records` | 7 years (counsel-verify) |
| Audit logs | Security/anti-abuse | `audit_logs` | 7 years, then archived |
| Auth events | Fraud analytics | `auth_events` | 12 months |
| Behavioral analytics (PostHog) | Product insight | PostHog (privacy mode: no email in events, no cross-site tracking, EU/US residency choice per §25) | Provider policy + our deletion calls |

Every field added later **must** justify itself against this table (a proposed new field without a purpose + retention is a rejected PR).

### 16.3 Consent (engineered, versioned, verifiable)

- Purposes (controlled vocabulary): `account_terms`, `privacy_policy`, `waitlist_contact`, `careers`, `feedback`, `marketing_email`, `marketing_sms`.
- Mechanics: banner + purpose-specific toggles; consent is **explicit and granular** — join waitlist ≠ marketing; apply ≠ newsletter. Every grant/withdrawal is `consent_records`-logged with `policy_version` (a hash of the notice text at the time), timestamp, source page, and withdraw-chain. Withdrawal is effective immediately for future processing; existing-purpose processing stops, and the user sees the effect (e.g., no more notification emails).
- Notices: privacy policy and terms are versioned and linked from every form; sign-up records explicit acceptance (`account_terms`, `privacy_policy`).
- Children: sign-up affirms 18+; no marketing to confirmed minors; if a child account is discovered, deletion flow per policy (counsel-reviewed).

### 16.4 Data-protection rights (the engineering API surface)

| Right | Flow | SLA |
|---|---|---|
| Access | Settings → "Download my data" → async export (JSON full + CSV of tables browsed in admin) | ≤ 30 days (policy target; DPDP max 90) |
| Correction | Profile edit + email/phone change with re-verification | Immediate for profile; ≤ 7 days for contacted identity changes |
| Erasure | Settings → "Delete account" → typed confirmation + session re-auth → 30-day cooling window (reversible) → purge job (cascade): R2 objects, rows, provider deletion (Clerk delete user → cascade webhooks to products), PostHog person deletion, Redis keys | Operational purge ≤ 48 h after window; provider propagation ≤ 90 days |
| Portability | Export of user-owned data in machine-readable JSON/CSV | ≤ 30 days |
| Consent withdrawal | Consent center; immediate effect | Instant |
| Nomination (DPDP-specific) | Legal document + support flow (Phase 6+; counsel-drafted content) | Documented |
| Grievance | `grievance@` contact published + 90-day max resolution tracked in admin | ≤ 90 days |
| Objection/restrict (where applicable) | Handled case-by-case via support; engineering supports status flags | Documented |

### 16.5 Account deletion (detailed sequence)

1. User confirms (typed phrase + re-auth) → `users.status='pending_deletion'`, `deletion_requested_at` set, session invalidated via provider (except a single "cancel" session within the window — keep one grace session, documented).
2. 30-day window: admin can re-activate; user can cancel; **all new writes blocked**; internal systems treat the user as non-existent for business lists but retain the row for the window.
3. Purge job (worker, daily): in one transaction — null/anonymize `job_applications` (keep stats), delete rows per FK policy, write `audit_logs` record of the deletion (without the PII), call provider deletion API (triggers product webhook cascade), enqueue PostHog person-deletion, delete R2 objects, sign the row for physical purge after 90 days (mailbox/backup windows).
4. Backup relics: provider PITR keeps deleted rows until the backup ages out (documented — explain to users: "copies in backups are removed automatically within N days"); logs keep only non-identifying audit records.

### 16.6 Third-party processors & cross-border

Every processor in §25 is contracted (DPA), purpose-limited, and documented in the privacy policy's processor list. Data residency: recipients include providers in the US/EU plus Indian SMS routers; the DPDP-approved-import list for cross-border transfers has not been finalized per 2026 published guidance — engineering note: **prefer EU/US-processed providers with DPAs, keep the processor map current, and re-review when the transfer list is notified** (Section 16.1's counsel review covers the legal position; this is the data-flow input to it).

### 16.7 Data-access controls recap

Table-level: `audit_logs`/`consent_records` not reachable from any public or user-scoped endpoint; admin endpoints are role + MFA gated; worker lanes use scoped credentials; future products see identity claims only, never raw rows (§12.4); database access allowlisted (§8.3).
---

## 17. Admin architecture

### 17.1 Access model

| Surface | Requirement |
|---|---|
| Route access | `/admin/*` — session + `users.role='admin'` **and** provider 2FA verified. Enforced in middleware (fast fail) **and** in every server component/route handler (authoritative) |
| Network | Cloudflare: Managed Challenge on `/admin/*` by default; optional IP allowlist toggle (default off — team runs on the road; challenge + MFA is the baseline) |
| Sessions | Shorter idle timeout (30 min); sensitive actions require re-auth ≤ 10 min (§15.12); no long-lived "admin desktop" tokens |
| Audit | **Every** mutating action (and every read of personal data: user profile peek, CV download, export) writes `audit_logs` in the same transaction |

### 17.2 Pages and their data

| Page | Reads (DB) | Actions (audited) |
|---|---|---|
| `/admin` dashboard | Counts: users (total, verified, new 7d, suspended), waitlist (per product, status), feedback (open/avg age), applications (per stage), products (status) — all count queries from thin materialized-ish aggregate queries (see below) | — (read-only) |
| `/admin/users` | Search (email/phone/name/`user_id`), filters (status, role, verification, signup week), page | Suspend/reactivate, role change, delete (with typed confirm), view audit trail |
| `/admin/users/[id]` | Profile, identities, memberships, waitlist entries, feedback authored, applications, consent history, recent auth events | Same as above + "impersonate-lite"? — **no impersonation in v1** (privacy + audit risk; if needed later, it gets its own ADR with consent/notice design) |
| `/admin/waitlist` | Filter by product/status/date, search email; per-expiry invites | Export CSV (async job → signed URL), remove entry, convert status |
| `/admin/feedback` | Queues by status, category, priority; assign, note, resolve | Transition, assign, annotate; resolution e-mail optional (consent-aware) |
| `/admin/applications` | Filter posting/stage/date; download CV (audited, signed URL); set stage; internal notes | Stage changes, notes, contact applicant (email WYSIWYG not in v1 — copy an address, keep tooling small) |
| `/admin/products` | CRUD products (showcase fields, waitlist flags, domain, status) | Create/update/archive; CMS revalidation trigger |
| `/admin/jobs` | CRUD job postings | Create/update/close |
| `/admin/security` | `audit_logs` (filter actor/action/entity/date), `auth_events` (failures, OTP volume, risk flags), rate-limit hit rates | View-only; export audit CSV |

### 17.3 Dashboard aggregates (avoid tiny-table traps)

At launch, dashboard counts are direct `COUNT(*)` queries over indexed columns (fine ≤ ~50k rows). When `waitlist_entries`/`feedback`/`auth_events` exceed a few hundred thousand rows, move to: (a) a nightly job writing `admin_daily_stats` rollups, and (b) dashboard reads the rollups — **not** a live analytics DB. Simpler is the policy; add the rollup only when a query exceeds the §18.7 latency budget.

### 17.4 Exports

- Scope: waitlist filters, audit-log filters, feedback (admin columns only — no message bodies in bulk export unless needed and counsel-reviewed), applications list (metadata; CVs individually).
- Mechanics: request → `admin_export` job row → QStash → worker streams CSV/JSON to private R2 → signed URL (15 min) returned in the admin UI. All exports audited (who, what filter, size). Export purged after 7 days.

### 17.5 Audit semantics (concrete)

`action` vocabulary (enforced by a code-level constant list): `admin.user.suspend · admin.user.reactivate · admin.user.role_change · admin.user.delete · admin.data.export · admin.cv.download · admin.feedback.resolve · admin.waitlist.remove · admin.product.update · admin.job.update · identity.link · identity.unlink · user.profile.update · user.email.change · user.phone.change · user.consent.grant · user.consent.withdraw · user.account.delete_request · auth.otp.blocked · auth.signin.failure · file.scan.infected · security.rate_limit.blocked`. `before`/`after` JSONB hold only the changed fields, not whole-row dumps.

### 17.6 Security screen details

- Sign-in failures table (provider, IP hash cluster, UA family, time) + "same IP, multiple users" detector (credential stuffing signature).
- OTP anomaly panel: requests per phone/hour, delivery-failure ratio, verification-failure ratio, block events — fed by `auth_events`.
- Suspicious events feed: risk flags (identity conflicts, phone recycled, verification in unusual country, admin action in unusual pattern).
- Alert thresholds echo §20.5; the screen is for *investigation*, alerts are the *detection*.

---

## 18. Testing strategy

### 18.1 Principles

- **Speed matters**: the suite must run in < 10 min in CI or it will be skipped. Unit tests are the bulk (fast, no I/O); integration/E2E are targeted.
- **Tests mirror the contract**: shared Zod schemas mean unit tests of validation are shared between client and server implementations (one source of truth).
- **Test everything in the threat table that is automatable**; the rest (WAF behaviour, provider edge cases) is staging verification checklist, §18.7.
- Data in tests: **never** production data or real personal data in any environment's test DBs (anonymized fixtures only); test smoke users in staging use `+test@` addresses.

### 18.2 Layers & tooling

| Layer | Tool | Scope |
|---|---|---|
| Unit (60–70% of effort) | Vitest | Pure logic: validators (Zod schemas), normalizers (email/phone), rate-limit decision functions, dedupe/claim logic, audit vocabulary, storage-key builder, permission functions |
| Integration (20%) | Vitest + real Postgres (Neon branch or Testcontainers) | Repository/service functions against the schema: identity linking rules, waitlist upsert + partial-unique races, claim job, consent versioning, retention purge, files pipeline (no real vendor calls — R2/queue/SMS mocked at the adapter boundary) |
| API/contract | Vitest + `fetch` against route handlers (or a running app) | Every endpoint in §13.3: happy path + every 4xx/5xx case; auth-z matrix per endpoint (anonymous/authed/other-user/admin/blocked-user); rate-limit responses with mocked Redis; idempotency-key replays |
| E2E (10–15%) | Playwright (Chromium + WebKit + Firefox at least smoke; Chrome+Firefox full) | Critical journeys below; codegen IDs via role/aria labels (no brittle selectors); parallel shards |
| Accessibility | Playwright `@axe-core/playwright` in E2E; manual screen-reader (NVDA/VoiceOver) spot checks per release | §18.8 |
| Performance | k6 (scripted flows against staging) | §18.7 |

### 18.3 Test matrix (feature → layer)

| Feature | Unit | Integration | API | E2E |
|---|---|---|---|---|
| Registration (email code) | validation | identity create | request/verify flow | full journey incl. verification email (mailbox fake) |
| Sign-in (Google) | claim mapping | link rules | token→claims | mocked Google (Clerk dev instance staging) — real Google only in staging smoke |
| Email verification / change | formats | re-verify + notify-old | endpoints | verify → profile badge |
| Phone OTP | normalization, budgets | identity attach | request/verify, attempts, cooldowns, blocked states | OTP entry UI (test codes via staging provider) |
| Profile create/edit | version conflict | upsert | PATCH | edit → persists → other sessions see it |
| Waitlist | dedupe logic | partial-unique race, claim | POST anon/authed/duplicate/bad-product | join anon → sign up → entry claimed |
| Feedback | validation/scoring | fingerprint dedupe | POST + queue | submit → admin sees it |
| Career application | file rules | application + consent | apply, dup, closed-posting | apply with CV → admin stage change |
| File upload | name/key sanitization | presign → complete → scan states | presign, complete, refuse-unscanned, size/mime rejections | avatar upload → re-encoded WebP |
| Admin | role checks | audit transactionality | every admin endpoint × role matrix | admin journey (users/waitlist/feedback/applications/security) |
| Delete/export | retention math | cascade + R2 purge | export job, delete flow (incl. grace cancel) | delete → sign-in blocked → grace restore → final purge (staging) |

### 18.4 Security testing (static + dynamic + process)

- **Static**: CodeQL/Semgrep rules for SQL injection, XSS sinks (`dangerouslySetInnerHTML` banned), path-traversal in storage keys, unserialized env use, missing auth checks on route handlers (custom rule: every `/api/v1/` handler must declare an auth mode — lint-level enforcement), secret scanning (gitleaks), dependency audit (`npm audit` + Dependabot; `npm ci` with lockfile).
- **Dynamic (staging)**: OWASP Top-10 checklist run per major release (the 2021 set remains the operational baseline; map the 2025 refresh items name-wise as of writing — Broken Access Control, Security Misconfiguration, Injection, Insecure Design, Cryptographic Failures, Vulnerable & Outdated Components, Identification & Authentication Failures, Software & Data Integrity Failures, Logging & Monitoring Failures, SSRF); OWASP **API Security Top 10** review per endpoint: BOLA, broken object property-level authz (extra PII in responses — test by requesting fields not in contract), resource consumption (oversized payloads, deep pagination), unsafe consumption (webhook/SSRF), improper inventory (unversioned/hidden endpoints — CI checks for stray routes), rate-limit bypass (multi-IP sim), enumeration (timing + message diffs).
- **Auth testing**: cross-user data access attempts per endpoint (automated), role escalation (user→admin), session revocation effect, MFA enforcement on admin, cookie flags, CSRF origin forgery, replay of webhook signatures, OTP brute-force (attempts), OTP never in logs (assert log store has no 6-digit patterns from the code field).
- **Rate-limit testing**: flood scripts against staging asserting 429 + `Retry-After`, that limits are per-bucket not per-server (Upstash shared), and that bypass patterns (header spoofing X-Forwarded-For) are neutralized (we derive IP from Cloudflare `CF-Connecting-IP` only).
- **File-upload testing**: polyglot files, magic-byte mismatch, oversized, double extensions, `.svg`, zip bombs (size cap + entry-count cap), virus EICAR test file → quarantine path.
- **Verification cadence**: automated CI security gate (static) per PR; dynamic/staging checklist per release (Phase 5+); annual third-party penetration test once revenue/scale justifies it — record in open questions (§29).

### 18.5 Authorization matrix tests (the anti-IDOR suite)

For every user-scoped endpoint: caller A requests caller B's resource → expect 404/403, and assert **no data leakage in the response body and no difference in timing that reveals existence** where enumeration-sensitive. Admin endpoints: user role → 403 in all variants; admin without MFA → 403; suspended user → 401/403 and no writes.

### 18.6 Performance targets (measurable, realistic, enforced in CI where possible)

| Metric | Target | Measured how |
|---|---|---|
| Public page load (LCP) | ≤ 2.5 s p75 on 4G mobile (target **1.8 s** with cache) | Lighthouse CI + RUM (PostHog web vitals) |
| CLP / INP | CLS ≤ 0.1; INP ≤ 200 ms p75 | RUM |
| Static asset TTFB | ≤ 100 ms p95 (CDN cache hit) | RUM + monitors |
| API read latency | ≤ 300 ms p95 (no email/SMS in path) | k6 (staging) + RUM |
| API write latency (form posts) | ≤ 800 ms p95 (excludes async email) | k6 |
| DB simple query | ≤ 50 ms p95 | Neon metrics + slow-query log |
| Concurrent users | 2,000 active sessions sustained; 300 req/s burst 5 min with < 0.5% error budget | k6 load test in staging (Phase 6 gate) |
| Error rate | < 0.5% 5xx rolling 24 h; < 0.1% targeted | Sentry + logs |
| Webhook processing lag | 99% of Clerk events processed ≤ 60 s | internal gauge |

### 18.7 Browser matrix

| Browser | Level |
|---|---|
| Chrome (desktop, current) | Full suite |
| Firefox (desktop, current) | Full suite |
| Edge (desktop, current) | Smoke (Chromium parity) |
| Safari (desktop, current) | Full suite (WebKit in Playwright) |
| iOS Safari (iPhone 12+, current OS) | Critical journeys (E2E on device farm or manual) |
| Android Chrome (current) | Critical journeys (same) |

### 18.8 Accessibility (WCAG 2.2 AA — the hard target)

- Automated: axe-core in E2E (assert zero serious/critical violations per page), color-contrast checks.
- Manual (per release): keyboard-only pass of all interactive flows; focus visible and **not obscured** (2.4.11/2.4.13); target size ≥ 24×24 CSS px (2.5.8); no dragging-only interactions (2.5.7); consistent help placement (3.2.6); reduced motion respected (`prefers-reduced-motion`); landmarks + heading order; form labels, error association (`aria-describedby`), error identification + suggestion (3.3.x), **redundant entry**: autofill and remembered values (3.3.7); accessible authentication (3.3.8) — our OTP code input must not rely on copying/pasting or memory alone (e.g., single autofocusable grouped input with paste support, label + instructions); screen-reader spot checks (NVDA on Chrome, VoiceOver on Safari).
- Component policy: prefer primitives with built-in behavior (Radix/shadcn) over hand-rolled widgets; any custom widget requires a design-ticket with ARIA spec.

### 18.9 SEO testing

- Metadata per route (title/description/OG/Twitter) — CI check that each public route exports them; canonical URLs (apex host, no query-string duplicates, no trailing-slash variants); `sitemap.xml` (ISR-driven, `lastmod` from content updates) + `robots.txt` (allow public, disallow `/account`, `/admin`, `/api`); structured data where truthful: `Organization`, `WebSite`, `Product` (few, real), `JobPosting` (only while open — CI asserts closed postings are removed), `BreadcrumbList`; OG images per product/route (R2 public assets); broken-link check (lychee in CI: internal + external head-set check); Lighthouse SEO audit ≥ 90; hreflang when i18n arrives (§A6); no JS-only content for crawlers (SSR/ISR everywhere public).

---

## 19. CI/CD

### 19.1 Pipeline

```text
Developer ──push──▶ Git (GitHub)
                        │
                        ▼
                Pull Request
                        │
   ┌────────────┬───────┴────────┬───────────────┐
   ▼            ▼                ▼               ▼
 Lint        Typecheck        Unit           Security gates
(eslint,    (tsc --noEmit)   (Vitest)      (gitleaks, semgrep/
 stylelint)                                   codeql, audit)
   │            │                │               │
   └────────────┴───────┬────────┴───────────────┘
                        ▼  all green
                 Integration tests (Neon PR branch / Testcontainers)
                        ▼
                      Build  (Vercel preview deployment)
                        ▼
                 E2E + axe (Playwright, against preview)
                        ▼
                 ┌──────┴───────┐
                 ▼              ▼
        Deploy Preview     (migrations dry-run on branch DB)
              │
              ▼
           Review (code + preview URL + Lighthouse output)
              ▼
        Merge → main → Production pipeline:
        migrate (expand) → deploy (Vercel prod) → smoke tests
        → contract release → post-deploy monitoring window
```

### 19.2 Gates (what must be green)

| Gate | Failure action |
|---|---|
| Lint + typecheck + format | Block |
| Unit + integration | Block |
| Security static (gitleaks, semgrep/codeql, `npm audit`; dependency-review on lockfile changes) | Block; **secrets = manual incident path** (§15.11) |
| E2E + a11y (critical journeys) | Block on prod; block on previews too (cheap enough) |
| Lighthouse budgets (perf/SEO/a11y ≥ 90 on the 5 key pages) | Warn at preview; block at prod |
| Migration dry-run on branch DB | Block |
| DB migration check (`drizzle-kit check`-style: no destructive statements without an `!!` marker + approval) | Block |

### 19.3 Environments

| Env | Purpose | Data | Providers | Notes |
|---|---|---|---|---|
| **Development** | Local iteration | Neon dev branch (seeded fixtures, no real PII) | Clerk dev instance, Resend test keys, Twilio test (or disabled — email path defaults), PostHog dev project, Sentry dev project | `docker-compose` optional for local Postgres; real managed stack for parity-sensitive work |
| **Preview (per PR)** | Reviewed demos | Neon **branch per PR** (instant copy-on-write) | Clerk dev instance (same as dev), all sandbox keys | Vercel preview URL is the artifact; PR comment links it |
| **Staging** | Pre-prod full parity | Neon staging branch (anonymized seed; never production data — DPDP hygiene) | Clerk **test instance** (owns test users; real Google OAuth allowed for smoke), Twilio sandbox + real SMS to allowlisted test numbers (nightly cap), Resend test domain, PostHog staging project, Sentry staging | Deployed on merge to `main`; smoke suite runs here; **cheapest place to break things** |
| **Production** | Real users | Neon production (PITR on; IP-allowlisted) | Clerk production instance (primary domain `auth.company.com`), real Twilio + DLT templates, Resend prod domain (SPF/DKIM/DMARC), PostHog prod (privacy mode), Sentry prod | Manual deploy approvals per §19.5 |

Isolation rules: no shared secrets across environments (separate keys/keysets; prod keys never visible to preview builds — Vercel env scoping); staging providers are separate projects/orgs where the provider supports it; production DB connections from staging = forbidden (enforced by allowlist, tested by a CI assertion); anonymized staging seeds generated from **schemas + synthetic data**, not from prod exports.

### 19.4 Database migrations

- Committed SQL migrations (`drizzle-kit`), applied by a CI job that runs **before** the deploy step with `expand` semantics; **backward-compatible by rule**: a release must work against the previous schema and the new schema (two-version window). Destructive changes (drop column, change type, tighten constraint) are split: migrate data first (expand), deploy code that no longer writes the old shape, drop/contract in a later release ≥ 1 week later, with a `!!` marker that blocks auto-apply.
- Never write `down` migrations and never roll back a schema by re-applying old migrations. If a release breaks: **forward-fix** or Vercel rollback of code only (rollback works only when the schema stays compatible — which the two-version rule guarantees).
- Prod migrations: auto-apply on merge to `main` for pure-additive; destructive ones require manual approval in the environment UI. Migration failures page-deploy (broken app is worse than stale schema).

### 19.5 Approvals & rollbacks

- Prod deploys: merge to `main` requires ≥ 1 reviewer; deploys from protected branch only; optional manual approval for releases containing migrations or dependency major bumps (default: require it).
- Rollback: Vercel instant rollback to previous deployment; data-layer rollback is **not** automatic (schema stays; forward-fix is the mechanism). Feature flags for risky launches (waitlist and feedback surface flags initially via DB or env — keep minimal; a flags vendor is a later decision).
- Observability gates: after each prod deploy, a 15-minute watch window (error rate, API p95, webhook lag) with auto-alert; on-breach → rollback + postmortem.

---

## 20. Observability

### 20.1 Logs (structured JSON, one schema, three classes)

**Request logs** (every API + page render): `ts, level, service, request_id, method, path, route, status, duration_ms, user_id_hash, ip_hash (edge-derived), cache (hit/miss), cf_ray`. **Business/security logs**: `event, actor, entity, result, metadata`. **Error logs**: Sentry-issued events with `request_id` correlation.

| Class | Where written | Retention |
|---|---|---|
| Request logs (pseudonymous — hashed identifiers only) | Better Stack (drain) | 30 d hot / 90 d archive |
| Auth events (`auth_events`) | DB (queryable) | 12 mo |
| Admin actions (`audit_logs`) | DB (immutable) | 7 yr |
| Error events (stack traces, redacted) | Sentry | 90 d |

**Never logged** (enforced by log-redaction tests in CI — a test that replays an auth flow and asserts no 6-digit sequences near "code", no `authorization` headers, no raw emails/phones in request logs, no signed-URL query strings in full): passwords (don't exist), OTP codes, OTP-request bodies, access/refresh tokens, cookie values, CV/file contents, full IPs (hashed only), payment-like data (doesn't exist).

### 20.2 Metrics (RED + domain)

| Group | Metrics |
|---|---|
| Traffic | Requests/s by route class, cache-hit ratio, bandwidth, webhook ingress |
| Latency | p50/p95 of API reads/writes, page TTFB/LCP (RUM), DB query p95, vendor call p95 (email/SMS/webhook) |
| Errors | 5xx rate, 4xx-by-code (validation vs rate-limit), Sentry error rate, provider failure rates |
| Database | Connections, slow queries (> 200 ms), replication lag, storage growth |
| Auth | Sign-in success/failure by provider, OTP requested/delivered/verified, delivery failure %, blocks by bucket |
| Business | Waitlist joins (anon vs authed), referral conversions, feedback submissions, applications, profile completion, consent grant rates |
| Ops | Queue depth (QStash), job failures, backup success, restore-drill duration, deploy frequency |

Panels: Vercel metrics (built-in), Better Stack dashboards, PostHog for business funnels, Neon metrics for DB, Sentry releases for error trends.

### 20.3 Alerts (thresholds are initial; tune within 2 weeks of launch)

| Alert | Condition | Channel |
|---|---|---|
| High error rate | 5xx > 1% over 5 min (or > 0.5% over 1 h) | #alerts (Slack/Telegram via Better Stack) |
| API p95 breach | p95 > 1 s over 10 min | same |
| DB failure | connection failure / slow-query spike > 10× baseline 5 min / disk > 80% | same + page |
| Auth anomaly | sign-in failures > 3× baseline 15 min; OTP requests > 100/h or > 5× baseline; verification failures > 30% 15 min | same |
| OTP/SMS cost spike | delivery volume > 2× daily baseline (fraud or runaway) | same |
| Suspicious traffic | rate-limit blocks > 200/min; Turnstile failure > 20% 15 min; bot-score anomalies | same |
| Storage failures | upload success < 90% 15 min; scan job failure > 5; signed-URL errors | same |
| Webhook lag | > 60 s for 99th percentile over 10 min | same |
| Backup alerts | nightly backup failed/missing; restore drill failed | same + ticket |
| Cert/domain | TLS cert < 14 d (Cloudflare auto-renews; monitor anyway); SMS DLT template rejected | same |
| Budget | Monthly cost > 80% forecast (Vercel, Twilio, Resend, Neon, PostHog) | monthly digest |

### 20.4 Status page

Public status page (Better Stack) with components: Web app, API, Auth (external status of Clerk separately), Email delivery, SMS delivery, Database. Incident runbook template: detect → #alerts + status page → mitigate (rollback/feature-flag/providers) → communicate → postmortem (5 whys → action items with owners).

---

## 21. Backup and disaster recovery

| Aspect | Policy |
|---|---|
| Database backups | Provider-managed continuous (WAL) **point-in-time recovery** (Neon: retention window — configure ≥ 7 days at launch, ≥ 30 days after Phase 6) **plus** nightly logical dump (`pg_dump -Fc`, encrypted) to R2 (30-day retention, 3 monthly copies) |
| Backup frequency | Continuous WAL (PITR) + nightly full + monthly keep-forever archive |
| Restore testing | **Nightly dump is restored to a scratch Neon branch every Monday** (automated, asserts row-count and a sentinel row); **quarterly full DR drill** PITR-restore to a fresh branch + app smoke test (§28 Phase 6 gate). A backup that has never been restored is not a backup — this is a standing rule, not a slogan |
| RPO | ≤ 5 min (WAL/PITR) for live tier; ≤ 24 h for the nightly tier (documented — tier is for catastrophe recovery, not ops) |
| RTO | ≤ 4 h (worst case: restore + DNS/API re-point + cache clear); **target ≤ 1 h for DB-only incident** |
| Storage redundancy | R2 objects are provider-redundant within its network; **critical objects** (DB dumps, config, exported user-data bundles) additionally replicated to a second provider bucket (schedule via worker; cheap, and covers provider-level loss; R2's lack of S3-style object versioning is a documented reason for this belt-and-braces copy — re-check R2 capabilities at build time) |
| App redundancy | Vercel multi-region edge; zero state in app instances (stateless functions; Redis is the only ephemeral state and is not critical — rate-limit reset is acceptable degradation; queue is durable (QStash) with retries) |
| Disaster scenarios covered | (1) Single-row/user corruption → PITR to a point + selective restore walk (restore whole to branch, extract, patch forward — documented procedure). (2) Bad migration → forward-fix (never blind rollback, §19.4). (3) Provider outage (DB or Vercel) → status page + vendor status + DNS-level failover only if native failover exists (documented: no cross-provider live failover in v1; the RTO above assumes provider restoration. *If* the Company later needs multi-provider DB failover, that's a Phase 7+ decision with its own ADR). (4) Ransomware/credential compromise → rotate secrets, restore DB from last clean PITR point after quarantine, restore critical objects from replicated bucket, run security incident process (§16.1 breach-notification obligations trigger first) |
| Backup integrity | Checksum-verified dumps; alert on any restore test failure; restore times recorded and reviewed quarterly |

---

## 22. Scalability

### 22.1 The stance: modular monolith (ADR-011)

One deployable (Next.js app), one database, explicit **module boundaries** (`identity`, `engagement`, `careers`, `cms`, `ops` — §8.1) with a service-function-per-module convention and a lint rule that prevents cross-module table writes. **Why not microservices at launch** (§27 ADR-010/011): 1–4 engineers cannot operate a distributed system and a website simultaneously; every product needs the same identity data in one transaction (consistency wins over isolation at our scale); serverless functions already scale horizontally for traffic; the worker lane (QStash) is the *only* process we genuinely separate, because it genuinely needs different runtime characteristics. Extraction triggers (when a module earns a service) are written below — they are the point of the discipline.

### 22.2 Component scaling paths (each with its trigger)

| Component | Now | Trigger | Then |
|---|---|---|---|
| Database | Neon single writer, pooled connections | > ~2k concurrent sessions or p95 DB > 50 ms sustained, or report queries stealing OLTP | Read replica for report/admin queries (Drizzle read-client); only *then* consider sharding (waitlist partition by month; users stay unshattered — identity is the join root) |
| API (route handlers) | Stateless; Vercel auto-scales; heavy endpoints (exports, scans) offloaded to worker | Cold-start or p95 latency breaches at burst | Per-route ISR/edge caching; only if HTTP-only extraction ever needed, extract `identity` service first (it's the module with the strongest independent reasons: compliance boundary + cross-product consumers) |
| Auth | Clerk-managed | Pricing/feature blocker → ADR-004 revisit (Better Auth path) | Provider swap with schema intact (§5.2) |
| Storage/CDN | R2 + Cloudflare cache; egress-free | > 100 GB served/mo or hot-object churn | Cache rules tuning; asset pipeline (image resizing at edge via Cloudflare Images) — stay R2 for originals |
| Background jobs | QStash → worker functions | Job volume > function time limits | Dedicated container worker (Fly.io/Railway) running the same job code; queues stay QStash or move to a Redis-backed broker (same code, swapped adapter) |
| Email | Resend | Volume > provider limits or deliverability issues | Add a second provider behind the SMTP/HTTP adapter (Postmark/SES) with automatic fallback; DLT-like country routing only if needed |
| SMS | Twilio Verify | Cost/coverage blocker (§5.3) | Swap adapter to MSG91/Exotel with the same interface; keep verify semantics identical |
| Analytics | PostHog | Event volume > 1M/mo or cost | Sampling in the client SDK; self-hosted PostHog option (documented; means operating it — defer) |
| Rate limiting | Upstash | Infra shift | Managed Redis primary/secondary; limits remain logical (per-user/phone), which is what actually defeats bypass |
| Webhooks to products | QStash fan-out | Product count > 5 or per-product backpressure | Queue per product + dead-letter + delivery metrics; still no microservice needed |

### 22.3 Capacity model (assumption A2 — the "if" math)

Year-1 envelope: 50k registered users, 2k concurrent sessions, 40 req/s sustained (≈ 3.5M req/day), 300 req/s burst. At this envelope: Neon (1 CU-class + autoscale) and Vercel's standard tier handle it; the expensive parts are SMS volume (budget per-OTP) and email volume. Year-2 trigger to re-model: any of (a) MAU > 150k, (b) sustained > 150 req/s, (c) multi-product launches beyond 3, (d) any latency/SLO breach — at which point §22.2 triggers apply **in order** (cache → replica → extraction), never all at once.

### 22.4 SLOs (the contract with "production is working")

99.9% monthly availability for web + API (excluding announced maintenance and provider outages — tracked separately); error budget ≈ 43 min/month; measured via Better Stack monitors + Sentry + Vercel metrics, reported monthly.

---

## 23. Environment architecture

(Already specified in §19.3 — deployment table is authoritative. Environment-specific decisions:)

| Aspect | Development | Staging | Production |
|---|---|---|---|
| DNS zone | `localhost` + dev domains | `staging.company.com` (proxied, robots disallowed, noindex header) | `company.com` + subdomains |
| Auth | Clerk dev instance | Clerk **test/production-flagged** instance (per Clerk's environment model: test instance for staging, development for previews) | Clerk production instance |
| SMS | Disabled (email fallback) or sandbox | Sandbox + allowlisted test numbers (nightly cap, alert on breach) | Real; DLT templates; cost alerting |
| Email | Sandbox | Sandbox domain | Real domain (SPF/DKIM/DMARC) |
| Analytics | PostHog dev | PostHog staging (anonymized) | PostHog prod (privacy mode, EU/US residency decision documented in §25) |
| Errors | Sentry dev | Sentry staging | Sentry prod (release tracking) |
| Secrets | Local env + preview vars | Staging keys | Prod keys (never shared; CI asserts no cross-env leakage) |
| Data | Synthetic fixtures | **Anonymized synthetic seed** — production data is never copied to staging (DPDP-minimization first; if a prod-dataset staging test is ever truly needed it requires an explicit, logged, counsel-aware approval) | Real; PITR + allowlisted access |
| Access | Any dev | Deploy team + test accounts | Audit-gated admin only |

---

## 24. Domain architecture

### 24.1 Final recommended structure (vs the proposed `auth./api./admin.` pattern — kept, refined)

| Domain | Role | Why (vs alternative) |
|---|---|---|
| `company.com` | Canonical public site (apex canonical; `www` → 301; HSTS; Cloudflare proxied) | Brand + one canonical host for SEO |
| `auth.company.com` | **Clerk primary domain** — hosted sign-in/sign-up, verification UI, session home | Single session origin; satellite domains read from it (§7.5). This is a hard requirement of the chosen auth approach, not a preference |
| `api.company.com` | API base URL, proxied; WAF rule: only `/api/*` paths | Clean CORS + rate-limit scope; keeps the API surface out of the marketing origin |
| `admin.company.com` | Admin app origin | Session/security isolation: separate cookie scope (where the provider setup allows), dedicated WAF rules, challenge-on-entry, noindex; keeps admin off the public origin's attack surface |
| `assets.company.com` (or `cdn.`) | Public object storage custom domain (R2) | Cache + immutable names; origin-agnostic |
| `mail.company.com` | SMTP/API domain for Resend (SPF/DKIM/DMARC; `_dmarc` aggregate reports) | Deliverability; keep transactional on a subdomain so product domains (and any future marketing) are separately governable |
| `product-a.com`, `product-b.com` | Product domains; **satellite** domains of the same auth instance | Products keep brand independence (and, in time, legal independence); identities stay unified via `auth.company.com`. Alternative considered — nest products under `product.company.com` subdomains (simpler cookies/DNS, but weaker brand separation and hurts the "own domains" requirement) — rejected for the requirement |
| `security.txt` | `https://company.com/.well-known/security.txt` + `security.company.com` canonical (RFC 9116) | Vulnerability disclosure process |

### 24.2 DNS table (operational)

| Record | Type | Value | Notes |
|---|---|---|---|
| `company.com`, `www` | A/AAAA (Cloudflare proxied) | Edge IPs | Proxy on = WAF/CDN |
| `auth.company.com` | CNAME → Clerk-provided target | — | Clerk dashboard shows exact target + `__clerk` verification records; add **before** enabling the instance (dev instance CNAMEs are also needed for localhost dev) |
| `api.company.com`, `admin.company.com` | CNAME/proxied → Vercel target | — | Same project; host-based routing in app (§24.5) |
| `assets.company.com` | CNAME → R2 bucket custom domain | — | Cloudflare-managed cert; cache rules |
| `mail.company.com` | MX? No — API-based email | TXT SPF `v=spf1 include:… ~all`; DKIM CNAME/TXT from Resend | DMARC `p=quarantine` → `p=reject` (30-day soak); aggregate `rua` |
| `product-a.com` | A (proxied) + satellite records per auth docs | — | Each product zone is its own Cloudflare zone (separate WAF config, separate Turnstile keys) |
| `_dmarc`, `_mta`/DKIM | TXT | per provider | Monitor reports in a mailbox (or a reporting service later) |

### 24.3 Why not `*.company.com` wildcard cookies or shared `domain=company.com`

Because product domains are **different registrable domains** (not subdomains), cookies cannot span them without insecure wildcard tricks; the supported mechanism is the primary/satellite session model (§7.5). Subdomain-based products would get free shared cookies — but the requirement says products are on separate domains, so the satellite model is the only correct one. Documented so nobody "fixes" it later with a shared cookie domain.

### 24.4 Multi-domain session caveats (documented, tested)

- Passkeys across different domains: not recommended per provider guidance — off at launch (§7.5).
- Allowed-redirect-origins per satellite must be maintained deliberately (each product domain adds an entry — replacing a redirect-allowlist entry is how cross-domain attacks get in; review quarterly).
- Sign-out must clear state on the primary domain; satellites should treat "no session" as signed-out without local state.

### 24.5 Origin/host guards at the app layer (concrete rule)

`middleware.ts` host switch: `admin.company.com` → only `/admin*` and `/api/v1/admin*` served (else 404); `api.company.com` → only `/api/*` (else 404; public pages are not reachable from the API host); other hosts (company.com, staging, previews) → `/admin*` and `/api/v1/admin*` are still reachable but are auth-gated (defense in depth; do not rely on the host guard as the authorization control). Cloudflare WAF mirrors the same rules at the edge.

---

## 25. Third-party services

| Service | Purpose | Data shared with them | Criticality | Notes / data-protection controls | Alternative |
|---|---|---|---|---|---|
| **Clerk** (auth) | Credential verification, OTP, sessions, 2FA, user admin | Identity claims (email, name, photos, phone), OAuth tokens, IP/UA (for their fraud signals), user lifecycle; **it hosts the sign-in UI on `auth.company.com`** | **Critical** | DPA required; we disable non-essential product analytics; keep our DB as the identity graph (provider swap possible, ADR-004) | Better Auth (self-hosted), Auth0 |
| **Google** | OAuth identity | Email (verified claim), name, photo, Google `sub`; we store only the required subset | Critical | Google's own security; we persist `sub` + email + name + photo URL; callback validation is the provider's job; we never see tokens | — (mandatory per requirements) |
| **Twilio Verify** | SMS OTP delivery | Phone number, OTP message content, delivery status, IP (their fraud signals) | High | DPA; DLT registration owned by Company (§5.3); per-verification cost alerting; adapter interface for MSG91/Exotel | MSG91, Exotel, Plivo, Telesign |
| **Resend** | Transactional email (verification codes — via Clerk transport — notifications, confirmations) | Email address, name, message content (template-driven, minimal) | High | DPA; DKIM/SPF configured; no marketing; suppression list sync (bounces handled at provider, we honor their webhook → consent/contact state) | Postmark, AWS SES |
| **Cloudflare** | DNS, CDN, WAF, DDoS, Turnstile, R2 (storage), edge cache | IP addresses, headers (UA, country), TLS metadata, WAF/rate-limit events, challenge analytics; Turnstile collects device signal (their privacy policy governs; Turnstile is designed to be privacy-friendly); R2 file bytes | Critical | One contract zone per domain; data flows documented in privacy policy; R2 objects encrypted at rest | — |
| **Vercel** | Hosting, serverless runtime, previews, env/secrets KMS, deploy logs | Code, env secret material (encrypted), request metadata, build logs | Critical | DPA; env scoping per environment; access by least privilege (deploy-only tokens); their CDN interplays with ours (Cloudflare proxy in front — request flows documented, no double-caching conflicts on assets: only R2/cache rules on `assets.company.com`) | Fly.io/Railway (loses previews/ISR simplicity) |
| **Neon** | PostgreSQL hosting | **All app data** (personal data of users) | Critical | DPA; IP-allowlisted access; PITR enabled; deletion propagation on account deletion (§16.5 is our job, not theirs — their backups age out) | Supabase, Aiven, RDS |
| **Cloudflare R2** | Object storage (CVs, avatars, assets) | File bytes + metadata (keys, sizes, hashes) | Critical | Private/default-private serving; lifecycle rules; deleted objects purged per §14.7; egress-free (cost control) | AWS S3 |
| **Upstash (Redis + QStash)** | Rate limiting, queue, cron | Hashed identifiers (IP hashes, user_id hashes), queue payloads (file keys, job defs — **no message bodies, no OTPs**) | High | DPA; short TTLs; queue retention bounded | Inngest, Cloudflare Queues |
| **Sentry** | Error tracking, release health | Stack traces (code-level: variables scrubbed), user_id (opt-in, hashed by default per our config), browser/OS | Medium | PII scrubbing on; `sendDefaultPii: false`; no request bodies; session replay OFF at launch (opt-in later with its own consent note) | GlitchTip (self-host) |
| **Better Stack** | Log search, uptime, status page | Log payload (pseudonymous per §20.1), no PII by construction; uptime probes hit public endpoints only | Medium | DPA; 30-day log window; logs include only hashed identifiers | Axiom |
| **PostHog** | Product analytics, funnels, web vitals | Event properties (page, category, product ids, pseudonymous `distinct_id`); **config privacy mode: no raw email/phone in event properties, IP capture off, no cross-site consent-less tracking**; session recordings OFF at launch | Medium | DPA; deletion API called on account deletion; consent banner gates analytics cookies (18+ only); picking EU or US hosting = one documented config decision (choose EU region at launch for the Indian user base — revisit per §16.1 advice) | Plausible, Umami |
| **GitHub** | Code, Actions, secret scanning, Dependabot | Code, CI logs, (secrets erroneously pushed → scanned) | High | Org-level 2FA; branch protection; no prod secrets in repo (gitleaks gate) | GitLab |
| **ClamAV / VirusTotal (optional)** | File scanning | File hash (VirusTotal, hash-only), file bytes (ClamAV, in our worker — neither is a data controller of the bytes beyond scanning) | Medium | Only `cv`/`portfolio`/`import` files scanned; VirusTotal API key scoped; if privacy review objects to hash sharing, operate ClamAV-only | Hosted scan APIs |

**Processor map maintenance**: this table is part of the privacy policy's processor list; any change requires (a) an ADR note, (b) DPA check, (c) privacy-policy update, (d) §16.1-counsel review on new datatypes.

---

## 26. Threat model

### 26.1 Attacker profiles

| Profile | Motivation | Capability |
|---|---|---|
| Script kiddie / botnets | Spam forms, OTP bombing, credential stuffing | High volume, low sophistication |
| Opportunistic hacker | Sell accounts/CVs, scrape emails | Medium; exploits known patterns (IDOR, misconfig, exposed APIs) |
| Fraudster | Abuse waitlist/OTP (rewards farming, fake sign-ups), recycling numbers | Medium; uses device farms, SIM farms |
| Insider (employee/contractor) | Curiosity, data sale, sabotage | High trust, low skill; mitigated by least privilege + audit |
| Targeted attacker | Company reputation, user PII harvest (CVs are high-value) | High; persistent, will target admin, SSRF, file pipelines |

### 26.2 Attack surfaces

Public website + forms (anonymous!), sign-up/verification UI, API (`/api/v1`), upload pipeline, webhook receivers (Clerk → us, us → products), admin UI, DB + storage credentials, third-party API keys, future product integrations, human ops (support, DLT, provider consoles).

### 26.3 Threat table

| # | Surface | Threat | Impact | Likelihood | Mitigation (section) | Priority |
|---|---|---|---|---|---|---|
| T1 | Auth | Credential stuffing / account takeover (stolen email reuse — but no passwords; OTP interception, session theft) | Account compromise → PII exfiltration, spam | Medium | No passwords; provider OTP + attempts/TTL; rate limits; MFA on admins; phone-not-recovery; session revocation; alerts (§11, §15.1) | **1** |
| T2 | Auth | OTP abuse: SMS bombing, cost fraud, brute-force codes | Cost, degraded service, fraud | High | Budgets §11.4; provider attempt caps; delivery-failure alerting; per-phone/day caps; phone not standalone (§11.4) | **5** (with T1) |
| T3 | Profiles | Mass enumeration (emails/IDs), scraping | Privacy breach | Medium | UUIDv7, no public counts, uniform errors, owned-data-only endpoints (§15.15) | 2 |
| T4 | Admin | Admin takeover (targeted phishing, no MFA, weak role checks) | Full-data compromise | Low (mitigated) | MFA enforced, re-auth windows, role checks per request, audit, challenge on entry, break-glass alert (§15.12, §17) | 3 |
| T5 | Personal data | Insider or misconfig exposure (CVs, exports) | DPDP breach + trust | Medium | Least privilege, private buckets + signed URLs, audited admin download, deletion propagation (§14, §16, §17.5) | 4 |
| T6 | Uploads | Malware delivery via CV/portfolio, polyglot uploads | Malware to staff, storage abuse | Medium | §14 matrix: allowlists, magic bytes, re-encode, scan, quarantine, size caps, sanitized names, no execution context | 6 |
| T7 | API | BOLA/IDOR, property-level authz, resource exhaustion, unscoped tokens | Cross-user data access, DoS | High | §15.7, §13.3/13.4, schemas strip unknown fields, per-product scopes, cursor pagination caps | 7 |
| T8 | Database | SQLi, exposed DB, credential theft | Total data compromise | Low (mitigated) | Parameterized queries only; allowlisted access app-only role; no DDL from app; secrets hygiene; PITR (§8, §15) | 8 |
| T9 | Integrations | Webhook forgery, product-to-product boundary crossing, SSRF via callbacks | Data integrity, lateral movement | Medium | HMAC verification + IP allowlists; host/scheme allowlists + no redirects; scoped tokens; namespaced metadata (§12, §15.4) | 9 |
| T10 | Web | XSS, CSRF, open redirect, SEO/legal spam via forms | Trust, session theft | Medium | §15.1 rows (CSP nonce, no raw HTML, origin checks, redirect allowlists) | 10 |
| T11 | Availability | DDoS, form abuse, expensive-job abuse (export/delete spam) | Outage, cost | Medium | Cloudflare DDoS/WAF/bots; rate limits; cost caps; queue concurrency limits (§5, §13.4, §20.3) | 11 |
| T12 | Supply chain | Compromised dependency, leaked vendor key, CI poisoning | Varies | Low-medium | Lockfiles + audit + Dependabot; gitleaks; least-privileged tokens; 2FA on GitHub; staged deploys (§19) | 12 |

### 26.4 Verification responsibility

Each mitigation row has an owner role and a verification artifact: code review + Semgrep rule (static), automated security tests (§18.4), staging checklist per release, quarterly config review checklist, and the annual pen-test recommendation (§29 open question). Threat-model updates occur on any change to auth, storage, or third-party boundaries.

---

## 27. Architecture Decision Records (ADRs)

Format: **Status** · **Context** · **Decision** · **Options considered** · **Chosen** · **Reason** · **Tradeoffs** · **Revisit if**.

### ADR-001 — PostgreSQL (managed, single database)
- **Context**: identity graph + transactional forms + admin reporting; relational integrity is core (uniqueness of identities, dedupe, FKs, audit).
- **Options**: PostgreSQL managed (Neon/Supabase/Aiven/RDS) · MySQL · MongoDB · SQLite (no — concurrency/multi-instance) · Supabase-only-stack.
- **Chosen**: PostgreSQL 16+ on **Neon** (branch-per-PR, PITR, scale-to-zero; alternatives documented as fallbacks).
- **Reason**: relational constraints *are* the anti-duplicate and integrity mechanism (§9.4's partial unique indexes cannot be expressed in NoSQL); SQL is the most portable, best-known DB language — extraction to another provider is a credentials + connection change thanks to Drizzle; Neon gives preview-branch workflows at the exact scale of this team. 2026 provider-reliability reviews flag Neon's track record — hence the documented Supabase/Aiven fallback and the Phase 6 staging load test as a first-class gate.
- **Tradeoffs**: one DB = one writer = future scaling work (§22.2); managed cost grows with storage; branch tooling is provider-specific.
- **Revisit if**: sustained writes exceed single-writer comfort ($22.2 triggers), or Neon reliability/cost becomes unacceptable → Supabase/Aiven/RDS (schema unchanged).

### ADR-002 — UUIDv7 identifiers, never sequential
- **Context**: enumeration resistance (§15.15), sortability for indexes, distributed generation, no central counter.
- **Options**: auto-increment (rejected: enumerable), UUIDv4 (fine but unordered → index bloat; acceptable but worse), UUIDv7 (time-ordered), ULID (equivalent, less native).
- **Chosen**: UUIDv7, app-generated, in all externally facing tables; `bigserial` only for internal non-exposed log rows if ever needed.
- **Reason**: unguessable + time-ordered + collision-safe; SQL-compatible; no central sequence = no leaks of user counts via ID gaps.
- **Tradeoffs**: opaque IDs (debugging needs joins), 16-byte keys (negligible at our scale), no "last user id" shortcuts in admin (use `created_at`).
- **Revisit if**: a product integrator demands numeric IDs — grant `product_user_id` per product instead (never change `users.id`).

### ADR-003 — Centralized identity (single `user_id` across products)
- **Context**: requirement — one account across separate product domains; no duplicate accounts; products must authenticate the same human.
- **Options**: (a) per-product accounts with SSO glue (rejected: duplicates, drift, DPDP rights become multi-party); (b) federated identity per product via OIDC from the start (accepted as the *future* mechanism — Clerk + `identity/me` API is that); (c) shared database across products (rejected, §12.4); (d) **one identity service + one identity graph** (chosen).
- **Chosen**: identity graph in our PostgreSQL, anchored by `users.user_id`; credentials at Clerk; products integrate via satellite domains + scoped identity API + webhooks.
- **Reason**: a human = one row; link/unlink rules are testable code; DPDP rights (access/erase) are one call chain; products never own identity.
- **Tradeoffs**: the identity API is an integration contract to version and monitor; Clerk is a single point of failure for login across all products (mitigated: status page + documented fallback of email-code login paths).
- **Revisit if**: products become legally distinct entities needing separate consent/notices — then keep one graph but partition consent by product (schema ready via `consent_records.subject_type`/purpose namespacing).

### ADR-004 — Managed authentication (Clerk), with an explicit exit path
- **Context**: requirements (Google/email/phone OTP + verification, cross-domain sessions, admin 2FA) versus a 1–4 engineer team owning credential security.
- **Options**: Firebase Auth · Auth0 · AWS Cognito · Clerk · Better Auth / Auth.js (self-hosted) · roll-our-own.
- **Chosen**: **Clerk** (hosted; satellite-domain session sharing across `company.com`/`product-a.com`; email + SMS OTP; TOTP for admins; webhooks + admin API).
- **Reason**: cross-domain sessions is the hard requirement and is native to it; the team's auth-security surface shrinks to "webhook ingestion + authorization"; fastest path to a production-grade sign-in; pricing (≈$0.02/MAU beyond a free tier — re-verify) is acceptable within A4 and has a documented mitigation.
- **Tradeoffs**: vendor lock-in (mitigated: identity graph is ours; only credentials are theirs); auth UI less customizable than bespoke; some provider-level knobs (e.g., SMS provider list, per-user OTP config) are instance-global — means one policy for all users; passkeys across different domains are not supported (off at launch).
- **Revisit if**: MAU cost becomes material; provider blocks India DLT/phone path; or a product needs per-product auth policies — then migrate to Better Auth (self-hosted) using the same `users/identities` schema (re-verification flow documented in §5.2).

### ADR-005 — SMS OTP via Twilio Verify (adapter-ready for Indian providers)
- **Context**: India-first phone verification; TRAI DLT compliance; cost per OTP at Indian volumes; OTP security requirements.
- **Options**: Twilio Verify (Clerk-native) · MSG91/Exotel direct (cheap, DLT-handled, but custom code + separate verification logic) · Firebase Phone Auth (pricey in India) · Telesign (enterprise, costlier).
- **Chosen**: Twilio Verify via Clerk; `SmsOtpProvider` adapter; DLT registration is a scheduled business task (§5.3).
- **Reason**: zero custom OTP code + provider-grade attempt/expiry controls; the adapter keeps India-cost optimization a 1–2 day change, not an architecture change.
- **Tradeoffs**: higher per-OTP cost vs Indian aggregators; DLT admin burden (entity, headers, templates); SMS delivery is inherently refund-prone → analytics + alerts.
- **Revisit if**: OTP volume × cost exceeds the Indian-provider delta (trigger: monthly SMS cost > threshold or delivery-failure ratio > 5%).

### ADR-006 — Email OTP instead of passwords (and no magic links at launch)
- **Context**: auth via email without a password store; DPDP-adjacent concern about credential hygiene; mobile-friendly verification.
- **Options**: email + password (bcrypt/argon2 via provider) · magic links · email one-time codes · passkeys (blocked cross-domain, ADR-004) · "no email at all" (Google-only: excludes non-Google users).
- **Chosen**: email one-time codes (provider-generated/delivered/verified), for registration/verification/reset; passwords disabled at launch.
- **Reason**: no password database to leak or brute force; codes are self-expiring and single-use; reset = email code (no reset-token tables); same UX as OTP-first products users already know.
- **Tradeoffs**: email delivery dependency (adds latency/failure modes — mitigated by resend + logs + alerting); users who want "a normal password" are a support question (documented answer: it's coming later, or Google sign-in); code fatigue (mitigated by auto-fill-friendly OTP input, §18.8).
- **Revisit if**: password authentication is demanded (then: provider-native password feature with Argon2id-grade hashing, breached-password checks, and the same rate limits — an additive ADR, not a rewrite).

### ADR-007 — API-first backend inside the same deployable (route handlers, versioned `/api/v1`)
- **Context**: third-party contract (future products) + forms + admin; desire for clear frontend/backend separation without a second service.
- **Options**: Server Actions for everything (rejected: weak versioning/observability for a public contract) · separate NestJS service (rejected now: more infra than value; ADR-011) · Next.js route handlers with the URL contract.
- **Chosen**: route handlers at `/api/v1/*` (same deployable, strict path discipline), Zod-validated, versioned, rate-limited, documented in §13.
- **Reason**: one build, shared types, cheap reviews; the contract is HTTP-shaped so extraction later is a URL rewrite, not a redesign; server actions remain usable internally for account UI mutations where an external contract isn't needed (documented exception, not the default).
- **Tradeoffs**: both surfaces share the same scaling fate (mitigated by caching + worker offload); route handlers must obey the same auth discipline as pages (enforced by lint rule, §18.4).
- **Revisit if**: identity consumers need 99.99% and heavy website traffic causes noisy-neighbor effects → extract `identity` service first (§22.2).

### ADR-008 — Object storage: Cloudflare R2 (with S3 adapter)
- **Context**: profile photos, CVs, portfolio, company/product assets; bytes must not live in Postgres; egress and cost discipline.
- **Options**: AWS S3 · Supabase Storage · GCS · R2 · filesystem on a VPS (rejected).
- **Chosen**: R2 (private + public buckets, presigned URLs, custom-domain CDN delivery) behind a thin storage adapter.
- **Reason**: S3-compatible (AWS SDK works, so the adapter is trivial), no egress fees, same provider as edge/WAF (one dashboard), custom-domain public delivery with immutable cache semantics.
- **Tradeoffs**: fewer S3-extras (e.g., no S3-style object versioning — documented replication of critical objects (§21) instead); provider lock-in deeper than pure Postgres (mitigated by adapter + S3 as the named fallback).
- **Revisit if**: R2 lacks a needed feature (versioning/replication/GLB) that materially affects DR or compliance → migrate via adapter to S3.

### ADR-009 — Cloudflare at the edge (DNS/WAF/CDN/Turnstile) in front of Vercel
- **Context**: needs — CDN for public content, DDoS/WAF filtering, bot protection on forms, DNS, per-domain config (later product zones), rate limiting before it reaches our functions.
- **Options**: Cloudflare (full) · AWS CloudFront + Route53 · Vercel-only (no WAF) · Workers-only stack (rejected: would mean leaving the Next.js ecosystem).
- **Chosen**: Cloudflare as the front door — proxy on, WAF managed rules + custom host rules, Turnstile on public forms, cache rules for `assets.company.com` and public pages, edge rate-limit rules mirroring §13.4.
- **Reason**: one tool for the job family; provider-level DDoS/bot filtering; Turnstile keeps form spam off our functions (both cost and abuse); the domain architecture (§24) needs per-zone control anyway.
- **Tradeoffs**: two CDN-ish layers (Cloudflare + Vercel) to reason about — mitigated by documented caching ownership: Cloudflare caches `assets.company.com` + static/public responses; Vercel/Next cache-control headers remain the authority (`s-maxage`, `stale-while-revalidate`); no double-caching of personalized responses; misconfiguration risk (e.g., caching authed pages) is covered by header tests in CI.
- **Revisit if**: edge needs (e.g., edge functions for geo-personalization) outgrow the current setup — additive, not a redesign.

### ADR-010 — No microservices initially; a modular monolith with an explicit extraction plan
- **Context**: multi-product future; small team; the "don't prematurely distribute" instruction.
- **Options**: event-driven microservices · serverless-per-function monolith (modular monolith) · monolith with a separate worker process (chosen hybrid).
- **Chosen**: modular monolith (module-enforced boundaries, single DB, single deploy) **plus one worker lane** (QStash → functions) for genuinely async, long-running work (scanning, exports, purges, backups verification).
- **Reason**: transactional integrity for identity/consent/audit writes (cross-service transactions are the top source of subtle bugs at this scale); deployment and debugging stay trivial; the worker lane isolates the one workload that serverless HTTP functions can't do; extraction triggers are explicit (§22.2) — when they fire, the module boundaries make extraction mechanical.
- **Tradeoffs**: single DB is the capacity ceiling (managed per §22.2); a bad deploy affects web + API together (mitigated by previews/staged rollout/smoke tests); module discipline requires lint enforcement (cross-module import rule).
- **Revisit if**: two of the §22.2 triggers fire, or a module needs independent scaling/compliance (most likely: `identity`).

### ADR-011 — API-first identity for future products (read-only claims, never shared DB)
- **Context**: products must authenticate against one identity without access to Company data.
- **Options**: shared DB (rejected), service-to-service tokens + read API (chosen), full OIDC provider role for the Company (deferred — Clerk's token model covers v0; revisit when products need third-party-facing federation).
- **Chosen**: signed claims endpoint + webhooks + scoped client credentials; `product_memberships` as the only product-visible join.
- **Reason**: minimal surface, testable authorization, DPDP-clean (products get claims, not raw rows; deletion propagates via webhook).
- **Tradeoffs**: products depend on Company API availability (documented SLO ownership; on-degrade, products cache claims with a documented TTL — their problem to design, but we publish the contract and the status page).
- **Revisit if**: a product needs real OIDC federation for its own third parties → adopt a proper OIDC provider layer (Phase 7 decision).

### ADR-012 — Versioned consent as data, never as a checkbox in a table
- **Context**: DPDP purposes/notice versions; rights flows; audit.
- **Options**: boolean flags on users (rejected: no history, no version, no withdrawal chain) · separate consent service (rejected: overkill) · append-only `consent_records` with `policy_version` + withdrawal links (chosen).
- **Chosen**: §8.2 `consent_records` (append-only, purpose-scoped, versioned, evidence bundled, 7-year retention aligning with published records guidance; counsel-verified).
- **Reason**: the record must prove *what was shown* and *when* — a boolean can't; withdrawal must be traceable; reporting "who consented to what" is a query.
- **Tradeoffs**: a bit more code per consent touchpoint (one service function); retention is long → include in data-map; deletion propagates per §16.6.
- **Revisit if**: consent manager registration becomes relevant (published timeline ~Nov 2026) — evaluate a registered Consent Manager integration in Phase 6 review.

### ADR-013 — Custom forms (waitlist/feedback/applications) built in-house, not Typeform/Formspree
- **Context**: requirement (custom feedback system), data ownership (CVs! consent records!), integration with identity + admin queue, DPDP (third-party form tools would be processors with access to sensitive submissions).
- **Options**: Typeform/Formspree/Tally (fast, but: data flows through another processor, weak consent/audit, no identity linking, harder deletion propagation), in-house forms on the existing stack (chosen).
- **Chosen**: custom React forms → route handlers → PostgreSQL + R2, reusing the validation/consent/rate-limit stack.
- **Reason**: the forms are *identity and data-protection surfaces*, not just UI; in-house keeps the processor map small (§25), keeps consent records attached, and gives spam controls tuned to each form.
- **Tradeoffs**: more engineering (forms, queues) than a SaaS form tool; small risk of "form bugs" that a vendor would have fixed — covered by the test matrix (§18.3).
- **Revisit if**: a product needs a wizard-style form that's clearly not core — build it as a product feature, not as part of this platform.

### ADR-014 — No background "cron in the web app"; QStash worker for all async work
- **Context**: Vercel function time limits (minutes); needs: scans, exports, purges, backup verification, notification fan-out.
- **Options**: Vercel Cron hitting the app (rejected for long jobs; fine for short ones), BullMQ on a VPS (rejected: ops), Inngest (viable alternative), Upstash QStash (chosen — same vendor as Redis, HTTP-based, retries + sig verification, no broker to run).
- **Chosen**: QStash → worker route handlers (deployable on Vercel with longer max duration, or a small container later — same job code).
- **Reason**: fits serverless; durable retries; cron doesn't overlap jobs (concurrency controls exist); cheap at our scale.
- **Tradeoffs**: another vendor; per-invocation costs at high volume (revisit at §22.2 trigger); worker code runs in the same repo (kept deliberately — no second repo in v1).

### ADR-015 — API-first frontend/backend separation (final check)
- (Covered by ADR-007; recorded as a distinct acceptance that "separation" means **contract + module discipline**, not **separate processes** — see §5.6 responsibility matrix.)

---

## 28. Implementation roadmap

Phases are sequential; each has a definition-of-done (DoD) that gates the next. Estimated sizes assume 1–4 engineers working in parallel where possible.

### Phase 0 — Decisions frozen (0.5 week)
Lock ADRs 001–015; set up the GitHub org/repo skeleton decisions; confirm §3 assumptions A1–A10 with the business owner (esp. A7 domains, A9 marketing policy); confirm the legal entity + start counsel review (long-lead item).

### Phase 1 — Foundation (2–3 weeks)
Monorepo (pnpm workspaces: `apps/web`, `packages/shared` (schemas), `packages/ui`); Next.js + TS strict + ESLint/Prettier; Drizzle + Neon (dev/ staging/prod databases, branch-per-PR); Cloudflare zone + Vercel project + env scaffolding (all secrets per-env); auth SDK shell (Clerk dev/test instances, webhooks receiver with signature verification + idempotent handler); CI: lint → typecheck → unit → integration; basic error/uptime/analytics wiring (dev buckets); `env.example` + secrets policy.
**DoD**: green pipeline on PRs; webhook events land in `auth_events`/`users` for a test user; staging deploy from `main` works; no secret in repo (gitleaks clean).

### Phase 2 — Company website (3–4 weeks)
Design system + a11y primitives; public routes §6.1 (all static/ISR); CMS-lite (products, team, updates) via admin-lite; SEO: metadata, sitemap, robots, OG, structured data, canonical; domain wiring (company.com, www, assets, staging) + WAF + security headers.
**DoD**: Lighthouse ≥ 90 (perf/a11y/SEO) on the 5 key pages; axe zero-serious; ISR revalidation verified; sitemap/OG verified via crawler check; privacy/terms/security pages live (placeholder legal text with counsel-review TODOs — launch requires final text).

### Phase 3 — Forms (3–4 weeks)
Waitlist (§9): anonymous + authed flow, dedupe/claim, consent, referral codes, admin waitlist UI + export; Feedback (§10): form, queue, admin triage; Careers: postings CRUD + application flow (email-only, CV upload path with validation + queues; AV scan hash-only in this phase); Turnstile + honeypots + rate limits (edge + app) for all public forms; validation/unit/integration/E2E for all of §18.3 rows in this phase.
**DoD**: duplicate-free waitlist under concurrency test; claim flow E2E; every form rate-limited with observable 429s; admin export works; all tests green.

### Phase 4 — Identity (4–5 weeks)
Google OAuth + email OTP + phone OTP end-to-end with identity linking rules (§7.2) and the full `users`/`identities`/`sessions`/`user_profiles` schema; phone flow with budgets/cooldowns/expiry; auth-UI shells on company.com + auth.company.com primary-domain config + satellite config for one product domain; profile page + settings (linked identities, verification status, consent center); DLT registration + Twilio/Resend production config; admin users view + security events wiring; account recovery rules; migration of any existing users (none expected — document as bulk-import path, admins only).
**DoD**: one test human across company.com + product-a.com = one `user_id` (E2E); 5-attempt OTP lockout verified; webhook ingestion idempotent under replay; identity linking matrix tests green.

### Phase 5 — Security hardening (2–3 weeks)
Strict CSP (nonce) + all §15.10 headers at origin + edge; WAF custom rules (host guards §24.5) + Managed Challenge + Turnstile managed mode; admin MFA enforced + break-glass; full audit-log coverage of §17.5 actions; rate-limit coverage audit (§13.4) + bypass tests; upload scanning upgrade (ClamAV worker + quarantine lifecycle + VirusTotal hashes); secrets rotation runbook + gitleaks pre-commit; security test suite (§18.4) complete; open redirect/CORS/CSRF sweeps; dependency hardening (CSP report-only soak in staging first).
**DoD**: security test suite green incl. OWASP-API-Spot-10 style checks; quarantine + infected-file path E2E; no `unsafe-eval`, no inline scripts in prod CSP; headers verified by external scanner.

### Phase 6 — Production (3–4 weeks)
Monitoring/alerting (§20) all thresholds live + status page; backups: nightly dumps + weekly automated restore-to-branch + quarterly drill documented (first drill executed before launch); load test (k6) against staging at 2× assumed peak → §18.6 targets met; E2E browser matrix green; WCAG 2.2 manual pass; SEO final pass; DPDP operational items (privacy policy final text + counsel sign-off, consent notices, grievance contact, deletion/export flows final QA, processor list published); runbooks (incident, backup/restore, secret rotation, DLT template changes); go-live checklist + rollback plan exercised.
**DoD**: launch gate review (engineering + counsel) sign-off; first restore drill within RTO/RPO; alert tests actually fire; load test report filed.

### Phase 7 — Product integration (2–3 weeks per product)
Identity API v1 (`/api/v1/identity/me`, token flow, scopes), product webhooks (user.updated/deleted, membership.changed) with signature verification + SSRF guards; `product_memberships` activation (join on first product contact); satellite config per product domain; per-product consent/reporting review; product-side integration guide (one doc); contract tests (ours: end-to-end with a fake product client; theirs: Playwright smoke on product domain).
**DoD**: product A login → same `user_id` (no duplicate) → membership row correct → deletion cascade works → contract change process documented.

**Running after Phase 6** (not phases, but standing work): quarterly security review + config checklist, monthly cost review, weekly restore test, yearly pen-test decision, DPDP compliance monitoring (rule changes, SDF designation evaluation, consent-manager evaluation).

---

## 29. Appendices

### A. Open questions (own them before Phase 6)

| # | Question | Owner | Needed by |
|---|---|---|---|
| O1 | Legal entity (data fiduciary) name + grievance/DPO contact details for the privacy policy | Business | Phase 6 |
| O2 | Hindi (or additional regional) language availability at launch | Product | Phase 2 (affects i18n scope) |
| O3 | DLT registration progress (entity, sender ID, template approvals) | Ops | Phase 4 |
| O4 | Annual penetration test budget/decision | Security owner | Phase 6 review |
| O5 | PostHog data residency (EU vs US) + consent-banner copy final | Legal+Product | Phase 6 |
| O6 | Whether "significant data fiduciary" designation is plausibly applicable (volume/sensitivity thresholds) — counsel assessment | Counsel | Phase 6 |
| O7 | Field-level encryption of long-term sensitive archives (see §15.2 — deferred until a real requirement) | Security | Phase 7+ |
| O8 | Admin impersonation/dev-support access model (currently excluded (§17.2)) — only with its own ADR + consent design | Security | Phase 7 |
| O9 | Product-specific file storage (e.g., will products need to store user files via Company storage? currently no) | Product leads | Phase 7 |

### B. Document governance

- Changes to this document require a PR; architecture-significant changes require a new ADR (or an amendment to an existing one with a version bump); ADRs are never silently edited.
- Every ADR stating "revisit if" should be machinery-checked: the roadmap and §22.2 triggers reference them.
- This document is the reference for implementation and review: a PR that contradicts it needs either a fix to the PR or a fix to the document (usually both).

### C. Requirement traceability (task spec → section)

| Spec section | Where addressed |
|---|---|
| Recommended architecture + refinements (§2) | §4 (topology + changes + boundaries) |
| Technology stack evaluation (§3) | §5 (per-capability evaluation, choices, exit paths) |
| Website architecture + routes (§4) | §6 |
| Central identity (§5) | §7 (+ §12.4, ADR-003) |
| Database architecture (§6) | §8 (15 tables + design rules + retention) |
| Waitlist (§7) | §9 |
| Feedback (§8) | §10 |
| Authentication flows (§9) | §11 (Google/email/phone/OTP/recovery/ownership) |
| Shared profile (§10) | §12 (global vs product split, overwrite prevention, product contract) |
| API architecture (§11) | §13 (namespaces, endpoint contracts, versioning, limits) |
| File storage (§12) | §14 |
| Security (§13) | §15 (threat table, headers, cookies/CORS, secrets, MFA, audit) |
| Privacy/DPDP (§14) | §16 (minimization, consent, rights, deletion, India-specific notes with the legal caution) |
| Admin (§15) | §17 |
| Testing (§16) | §18 (layers, matrix, security, perf, browsers, a11y, SEO) |
| CI/CD (§17) | §19 |
| Observability (§18) | §20 |
| Backup/DR (§19) | §21 |
| Scalability (§20) | §22 (incl. the explicit modular-monolith rationale) |
| Environments (§21) | §19.3 + §23 |
| Domains (§22) | §24 |
| Third parties (§23) | §25 |
| Threat model (§24) | §26 |
| ADRs (§25) | §27 (15 ADRs in the required format) |
| Roadmap (§26) | §28 (7 phases + standing work) |

### D. Glossary (short)

- **Identity graph**: our PostgreSQL rows (`users`, `identities`, ...) representing a human and their verified links.
- **Claim**: a verified statement about a user (e.g., `email_verified`) delivered to a product.
- **Satellite domain**: a product domain sharing the Company auth instance's session state (§7.5).
- **Worker lane**: QStash-driven async jobs (scanning, exports, purges, restore drills).
- **Expand/contract**: migration discipline — additively evolve schema, deploy code, then remove the old shape (§19.4).
- **Module**: a bounded domain with its own service functions and table set (§8.1).
