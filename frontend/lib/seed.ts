/** Build-safe fallback content used when the backend is not reachable
 * (e.g. `next build` without the API running). The live data comes from
 * the FastAPI backend, which serves the same seed content. */

export const FALLBACK_PRODUCTS = [
  {
    id: "fallback-aurora",
    slug: "aurora",
    name: "Aurora",
    tagline: "Your data, searchable in seconds — private by default.",
    description_md:
      "Aurora is our first product: a private, local-first knowledge base with instant full-text search.\n\n### Why it exists\nNotes, docs and links end up scattered across apps. Aurora gives them one home that stays on *your* devices until you decide otherwise.\n\n### Status\n**Waitlist open** — early access rolls out in small cohorts.",
    domain: "product-a.com",
    status: "waitlist_only",
    accepts_waitlist: true,
  },
  {
    id: "fallback-beacon",
    slug: "beacon",
    name: "Beacon",
    tagline: "Share a page, know exactly who engaged with it.",
    description_md:
      "Beacon is link sharing with signal: see who opened your links, on which device, and when.\n\n### Principles\n- No creepy pixels — engagement is explicit and consent-first.\n- Recipient privacy is the product, not an afterthought.\n\n### Status\n**Waitlist open** — first cohorts ship this quarter.",
    domain: "product-b.com",
    status: "waitlist_only",
    accepts_waitlist: true,
  },
  {
    id: "fallback-canvas",
    slug: "canvas",
    name: "Canvas",
    tagline: "A shared whiteboard for teams that hate meetings.",
    description_md:
      "Canvas is a fast, multiplayer-friendly whiteboard built for async teams.\n\n### Status\nIn research. Join the waitlist to shape the product and get first access.",
    domain: "product-c.com",
    status: "waitlist_only",
    accepts_waitlist: true,
  },
];

export const FALLBACK_TEAM = [
  {
    id: "t1",
    name: "Aarav Mehta",
    role: "Founder & CEO",
    bio: "Previously built payments infrastructure at scale. Believes boring architecture ships great products.",
  },
  {
    id: "t2",
    name: "Priya Nair",
    role: "Head of Engineering",
    bio: "Full-stack engineer with a security-first mindset. Owns the platform's architecture and reliability.",
  },
  {
    id: "t3",
    name: "Rohan Kapoor",
    role: "Head of Design",
    bio: "Designs calm, accessible interfaces. Says no to dark patterns before breakfast.",
  },
  {
    id: "t4",
    name: "Sana Iyer",
    role: "Head of Growth",
    bio: "Turns early users into communities. Runs experiments that respect consent and privacy.",
  },
];

export const FALLBACK_UPDATES = [
  {
    id: "u1",
    slug: "waitlist-open",
    title: "The waitlist is open",
    body_md:
      "We've opened the waitlist for our first three products: **Aurora**, **Beacon** and **Canvas**.\n\nJoining takes ten seconds and helps us sequence early access fairly — first come, first served, no spam.",
    published_at: new Date().toISOString(),
  },
  {
    id: "u2",
    slug: "why-one-identity",
    title: "Why every product will share one account",
    body_md:
      "Every product we build will sign you in with the same identity — one account, one profile, one privacy center. No duplicate accounts, no re-verifying your email five times.\n\nThe architecture for this is already decided: credentials live with a hardened auth provider, while the identity graph stays with us.",
    published_at: new Date().toISOString(),
  },
  {
    id: "u3",
    slug: "hiring",
    title: "We're hiring",
    body_md:
      "Founding engineers, a product designer and a growth generalist — see the careers page and apply in under five minutes.",
    published_at: new Date().toISOString(),
  },
];

export const FALLBACK_POSTINGS = [
  {
    id: "j1",
    slug: "founding-engineer",
    title: "Founding Engineer (Full-stack)",
    department: "Engineering",
    location_type: "remote",
    location: "India (remote)",
    employment_type: "full_time",
    description_md:
      "You'll build the platform that every QRA product runs on: the public website, the identity layer, and the engagement forms — alongside the founding team.\n\n### The stack\nNext.js (App Router, TypeScript) frontend, FastAPI/PostgreSQL backend, Cloudflare edge, managed auth.",
    requirements_md:
      "- 3+ years building production web apps (React + a typed backend)\n- Comfortable owning security: auth flows, rate limits, audit trails\n- Bias for boring, well-tested architecture\n- Based in India (remote-first team)",
    compensation_range: "₹35–60L + equity",
    status: "open",
  },
  {
    id: "j2",
    slug: "product-designer",
    title: "Product Designer",
    department: "Design",
    location_type: "remote",
    location: "India (remote)",
    employment_type: "full_time",
    description_md:
      "Design the public surface of QRA: landing pages, form flows, and the shared design system our products will build on. Accessibility is a hard target, not a stretch goal.",
    requirements_md:
      "- Strong portfolio of shipped web product work\n- Fluency with design systems and WCAG 2.2 AA\n- Experience designing for mobile-first audiences",
    compensation_range: null,
    status: "open",
  },
  {
    id: "j3",
    slug: "growth-generalist",
    title: "Growth Generalist",
    department: "Growth",
    location_type: "remote",
    location: "India (remote)",
    employment_type: "full_time",
    description_md:
      "Own the top of the funnel: waitlist conversion, launch announcements, community. You'll work with consent-first analytics — no dark patterns here.",
    requirements_md:
      "- Shipped and measured a launch before\n- Comfortable with email, content and community channels\n- Data-literate; respects privacy",
    compensation_range: null,
    status: "open",
  },
];
