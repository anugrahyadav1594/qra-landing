/** Build-safe fallback content used when the backend is not reachable
 * (e.g. `next build` without the API running). The live data comes from
 * the FastAPI backend, which serves the same seed content. */

export const FALLBACK_PRODUCT = {
  id: "fallback-qra",
  slug: "qra",
  name: "QRA",
  tagline: "Making financial information easier to understand.",
  description_md:
    "QRA is being built to make the financial information behind an " +
    "investment easier to understand. Financial statements, results, " +
    "filings and developments are explained in plain language, with the " +
    "source behind every explanation.\n\n" +
    "### What it is being built to do\n" +
    "Start with a company. The information that matters — the business, the " +
    "numbers, what changed, and what could change the picture — is brought " +
    "together and explained in language you don't need to be a financial " +
    "professional to follow.\n\n" +
    "### What QRA is not\n" +
    "- Not a tip service — it does not tell you what to buy or sell.\n" +
    "- Not a prediction engine — it does not forecast prices or promise " +
    "returns.\n" +
    "- Not an advisor — QRA does not provide investment advice and does not " +
    "make investment decisions for anyone. It explains; you decide.\n\n" +
    "### Status\n" +
    "**Early development — waitlist open.**",
  domain: null,
  status: "waitlist_only",
  accepts_waitlist: true,
};

export const FALLBACK_UPDATES = [
  {
    id: "u1",
    slug: "waitlist-open",
    title: "Early access to QRA is open",
    body_md:
      "The waitlist for QRA is open. Early access opens in cohorts, in " +
      "waitlist order.\n\n" +
      "Joining takes ten seconds: one email, and you're in line. Waitlist " +
      "updates only — no spam.",
    published_at: new Date().toISOString(),
  },
  {
    id: "u2",
    slug: "why-we-built-qra",
    title: "Why we're building QRA",
    body_md:
      "Investing has become easier to access. Understanding it is still " +
      "difficult.\n\n" +
      "Financial information is scattered across annual reports, results, " +
      "filings, news and financial websites — and for someone investing for " +
      "the first time, turning all of that into something understandable is " +
      "overwhelming. QRA is being built to close that gap: explain the " +
      "information behind an investment in plain language, show where each " +
      "explanation came from, and leave the decision with the investor.",
    published_at: new Date().toISOString(),
  },
  {
    id: "u3",
    slug: "hiring",
    title: "We're hiring",
    body_md:
      "Founding engineers, a product designer and a growth generalist — see " +
      "the [careers page](/careers) and apply in under five minutes. " +
      "We're a small, remote-first team building QRA.",
    published_at: new Date().toISOString(),
  },
];

export const FALLBACK_POSTINGS = [
  {
    id: "j1",
    slug: "founding-engineer",
    title: "Founding Engineer (AI & Data)",
    department: "Engineering",
    location_type: "remote",
    location: "India (remote)",
    employment_type: "full_time",
    description_md:
      "You'll build the systems that power QRA: the pipelines that collect " +
      "and normalize financial information, the layer that explains it, and " +
      "the interface where people read those explanations — alongside the " +
      "founding team.\n\n" +
      "### The stack\n" +
      "Next.js (App Router, TypeScript) frontend, FastAPI/PostgreSQL " +
      "backend, data pipelines for filings, statements and news, managed " +
      "hosting.",
    requirements_md:
      "- 3+ years building production web apps or data systems (TypeScript " +
      "or Python)\n" +
      "- Comfortable owning the full stack: pipelines, APIs, UI\n" +
      "- Bias for boring, well-tested architecture\n" +
      "- Based in India (remote-first team)",
    compensation_range: null,
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
      "Design how financial information is explained: how the business, the " +
      "numbers, the risks and what changed are presented so someone " +
      "investing for the first time can actually understand them. " +
      "Accessibility is a hard target, not a stretch goal.",
    requirements_md:
      "- Strong portfolio of shipped web product work\n" +
      "- Fluency with design systems and WCAG 2.2 AA\n" +
      "- Experience designing for mobile-first audiences",
    compensation_range: null,
    status: "open",
  },
  {
    id: "j3",
    slug: "growth-generalist",
    title: "Growth & Community",
    department: "Growth",
    location_type: "remote",
    location: "India (remote)",
    employment_type: "full_time",
    description_md:
      "Own the top of the funnel: waitlist conversion, launch " +
      "announcements, community. You'll work with consent-first analytics — " +
      "no dark patterns here.",
    requirements_md:
      "- Shipped and measured a launch before\n" +
      "- Comfortable with email, content and community channels\n" +
      "- Data-literate; respects privacy",
    compensation_range: null,
    status: "open",
  },
];
