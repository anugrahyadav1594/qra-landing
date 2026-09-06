/** Build-safe fallback content used when the backend is not reachable
 * (e.g. `next build` without the API running). The live data comes from
 * the FastAPI backend, which serves the same seed content. */

export const FALLBACK_PRODUCT = {
  id: "fallback-qra",
  slug: "qra",
  name: "QRA",
  tagline: "Quantrelic Research Agent — AI-powered financial research.",
  description_md:
    "QRA — the Quantrelic Research Agent — turns a ticker into a thesis. " +
    "It investigates financial statements, filings, news and market signals " +
    "so investors can research with greater depth and clarity.\n\n" +
    "### From ticker to thesis\n" +
    "Start with a company or ticker. QRA assembles the information that " +
    "matters — fundamentals, financial statements, filings and disclosures, " +
    "recent developments — and organizes it into a structured view: " +
    "evidence, context, risks, catalysts, and the shape of an investment " +
    "thesis.\n\n" +
    "### What QRA is not\n" +
    "- Not a chatbot — it runs a structured investigation, not a " +
    "conversation.\n" +
    "- Not a stock screener — it goes deep on a company instead of ranking " +
    "thousands.\n" +
    "- Not an advisor — QRA does not provide investment advice and does not " +
    "make investment decisions for you. QRA investigates. You decide.\n\n" +
    "### Status\n" +
    "**Early access — waitlist open.**",
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
      "The waitlist for QRA — the Quantrelic Research Agent — is open. " +
      "Early access opens in cohorts, in waitlist order.\n\n" +
      "Joining takes ten seconds: one email, and you're in line. Waitlist " +
      "updates only — no spam.",
    published_at: new Date().toISOString(),
  },
  {
    id: "u2",
    slug: "why-we-built-qra",
    title: "Why we're building QRA",
    body_md:
      "Financial research is scattered across filings, terminals, news feeds " +
      "and PDFs — and the connections between them are made by hand, in a " +
      "notebook, in a spreadsheet.\n\n" +
      "We're building QRA because the work of research should be about " +
      "connecting what already exists, not gathering it. QRA is designed to " +
      "be an evidence-first research companion: it investigates, it " +
      "organizes, it cites its sources — and the decision is always yours.",
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
      "and normalize financial information, the research engine that " +
      "connects it, and the interface where the investigation happens — " +
      "alongside the founding team.\n\n" +
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
      "Design the research workspace: how evidence, context, risks and " +
      "catalysts are presented so a researcher can reason, not skim. " +
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
