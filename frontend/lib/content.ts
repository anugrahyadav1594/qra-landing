/**
 * Site content.
 *
 * Every string the visitor reads lives here so the story stays consistent and
 * short: one idea per section, each idea said once. Nothing in this file is a
 * factual claim about the company, its customers or its results — the product
 * is pre-launch, and all interface data is clearly marked as illustrative.
 */

export const ILLUSTRATIVE_LABEL = "Illustrative example";
export const CONCEPT_LABEL = "Concept interface";

/* ── Hero ──────────────────────────────────────────────────────────── */

export const HERO = {
  eyebrow: "Quantrelic Analytics",
  headline: ["Investing shouldn’t", "be this complicated."],
  support: "Understand the numbers. Understand the story. Decide for yourself.",
  tagline: "Making investing simpler for the masses.",
  primaryCta: "Join the waitlist",
  secondaryCta: "See how it works",
  note: "QRA is in early development. The waitlist only means we’ll email you when early access opens.",
} as const;

export type Direction = "up" | "down" | "flat";

export const HERO_PANEL = {
  company: "RELIANCE INDUSTRIES",
  metrics: [
    { label: "Revenue", value: "₹ X,XXX Cr", direction: "up" },
    { label: "Profit", value: "₹ X,XXX Cr", direction: "up" },
    { label: "Margins", value: "XX.X%", direction: "flat" },
    { label: "Debt", value: "₹ X,XXX Cr", direction: "down" },
    { label: "Cash flow", value: "₹ X,XXX Cr", direction: "up" },
  ] as { label: string; value: string; direction: Direction }[],
  meaningLabel: "What does this mean?",
  meaning: [
    "Revenue has grown steadily.",
    "Margins changed as costs moved.",
    "Cash generation supported investment.",
  ],
  source: { label: "Source", value: "Annual Report · FY25" },
  disclaimer:
    "Concept interface. Figures are placeholders — not real company data, and not live market information.",
} as const;

/* ── The problem ───────────────────────────────────────────────────── */

export const PROBLEM = {
  label: "The problem",
  statement: ["Investing is easy to start.", "Understanding what you’re buying is harder."],
  /** Deterministic scatter offsets so the stack can reorganise on scroll. */
  fragments: [
    { label: "Annual Reports", fx: "-26px", fy: "-18px", fr: "-2.4deg" },
    { label: "Quarterly Results", fx: "18px", fy: "-24px", fr: "1.8deg" },
    { label: "Filings", fx: "-14px", fy: "22px", fr: "2.2deg" },
    { label: "News", fx: "24px", fy: "16px", fr: "-1.6deg" },
    { label: "Charts", fx: "-30px", fy: "6px", fr: "1.2deg" },
    { label: "Ratios", fx: "28px", fy: "-6px", fr: "-2deg" },
    { label: "Presentations", fx: "-20px", fy: "-12px", fr: "1.4deg" },
    { label: "Financial Statements", fx: "16px", fy: "24px", fr: "-1.2deg" },
  ],
  overload: "Too much information.",
  clarity: "Not enough clarity.",
  note: "The information exists. Understanding how it connects is the difficult part.",
} as const;

/* ── The idea ──────────────────────────────────────────────────────── */

export const IDEA = {
  label: "The idea",
  statement: ["Less searching.", "More understanding."],
  steps: [
    {
      n: "01",
      title: "Find it",
      body: "The reports, results, filings and developments that matter — for one company, in one place.",
    },
    {
      n: "02",
      title: "Explain it",
      body: "Financial language and spreadsheets turned into sentences you can actually read.",
    },
    {
      n: "03",
      title: "Understand it",
      body: "What changed, why it matters, and where every explanation came from.",
    },
  ],
  closing: "Understanding first. Your decision second.",
} as const;

/* ── The product ───────────────────────────────────────────────────── */

export type ProductTab = {
  id: string;
  label: string;
  question: string;
  summary: string[];
  metrics?: { label: string; value: string; direction: Direction }[];
  source: { label: string; detail: string };
};

export const PRODUCT = {
  label: "The product",
  statement: ["See the numbers.", "Understand the story."],
  company: "RELIANCE INDUSTRIES",
  questionsLabel: "What should I understand?",
  meaningLabel: "What the numbers are saying",
  sourceCta: "See the source",
  sourceClose: "Hide source",
  support:
    "One company at a time — the business, the numbers, what changed, and what could change the picture.",
  tabs: [
    {
      id: "business",
      label: "Business",
      question: "How does this company make money?",
      summary: [
        "Revenue comes from more than one business, not a single product line.",
        "Each segment grows at a different pace.",
      ],
      source: {
        label: "Annual Report · FY25",
        detail: "Segment reporting section — how the company describes its own businesses.",
      },
    },
    {
      id: "financials",
      label: "Financials",
      question: "Are revenue and profits improving?",
      summary: [
        "Revenue has grown over the period shown.",
        "Margins have moved, so profit has not grown at the same pace.",
      ],
      metrics: [
        { label: "Revenue", value: "₹ X,XXX Cr", direction: "up" },
        { label: "Profit", value: "₹ X,XXX Cr", direction: "up" },
        { label: "Margins", value: "XX.X%", direction: "flat" },
      ],
      source: {
        label: "Financial statements",
        detail: "The statement of profit and loss — the document every listed company publishes each quarter.",
      },
    },
    {
      id: "growth",
      label: "Growth",
      question: "What’s driving the change?",
      summary: [
        "Part of the growth is volume, part of it is price.",
        "New capacity takes time before it shows up in the numbers.",
      ],
      source: {
        label: "Results presentation",
        detail: "Management commentary on plans, capacity and outlook — context, not a forecast.",
      },
    },
    {
      id: "risk",
      label: "Risk",
      question: "What could change the picture?",
      summary: [
        "Costs of raw materials can move faster than selling prices.",
        "Large projects carry execution and timeline risk.",
      ],
      source: {
        label: "Risk disclosures",
        detail: "The risks a listed company is required to set out in its report — read in the company’s own words.",
      },
    },
    {
      id: "recent",
      label: "Recent",
      question: "What changed recently?",
      summary: [
        "A filing, a management change or an announcement can change what the numbers mean.",
        "Recent developments are shown with dates, so you can see the sequence.",
      ],
      source: {
        label: "Exchange filings",
        detail: "Disclosures filed with the stock exchange — the primary record of what a company has told the market.",
      },
    },
  ] as ProductTab[],
} as const;

/* ── Who it is for ─────────────────────────────────────────────────── */

export const AUDIENCE = {
  label: "For investors",
  statement: "Does this sound like you?",
  quotes: [
    "I know the basics. But financial statements still feel confusing.",
    "I want to understand a company before I invest.",
    "I don’t have hours to connect everything myself.",
  ],
  closing: "QRA is being built for you.",
  cta: "Join the waitlist",
} as const;

/* ── Trust ─────────────────────────────────────────────────────────── */

export const TRUST = {
  label: "Trust",
  statement: ["Clarity over", "hype."],
  principles: [
    { n: "01", line: "No guaranteed returns." },
    { n: "02", line: "No stock tips." },
    { n: "03", line: "No pretending to know the future." },
  ],
  closing: ["Just clearer financial information.", "QRA explains. You decide."],
  note: "QRA is a product of Quantrelic Analytics Private Limited. It does not provide investment advice, recommend investments, or make decisions for anyone.",
} as const;

/* ── Early access ──────────────────────────────────────────────────── */

export const EARLY_ACCESS = {
  label: "Early access",
  statement: ["Want to understand", "investing better?"],
  support: "We’re building QRA now.",
  points: [
    "Waitlist updates only — no marketing unless you ask.",
    "One email per person. You can leave any time.",
  ],
} as const;

/* ── Evidence chain (used on the trust page and product source UI) ─── */

export const EVIDENCE = {
  label: "Evidence",
  statement: ["Every number", "has a reason."],
  chain: [
    { label: "Number", value: "Revenue increased", detail: "What you see first." },
    { label: "Meaning", value: "Revenue has grown steadily.", detail: "The explanation, in plain language." },
    {
      label: "Source",
      value: "Annual Report · FY25",
      detail: "The document it came from, so you can check it yourself.",
    },
  ],
} as const;

/* ── Pages ─────────────────────────────────────────────────────────── */

export const HOW_IT_WORKS = {
  eyebrow: "How it works",
  headline: ["Understand", "before you invest."],
  support: "Five steps, in the order a careful investor actually asks them.",
  steps: [
    {
      n: "01",
      title: "Understand the business",
      body: "How the company makes money, and what its growth depends on.",
    },
    {
      n: "02",
      title: "Understand the numbers",
      body: "Revenue, profit, margins, cash and debt — read across years, not one point.",
    },
    {
      n: "03",
      title: "Understand what changed",
      body: "What moved since last time, so a change is never a surprise.",
    },
    {
      n: "04",
      title: "Understand the risks",
      body: "What could change the picture, in the company’s own disclosure.",
    },
    {
      n: "05",
      title: "Make your own decision",
      body: "QRA explains. It never tells you what to buy or sell.",
    },
  ],
} as const;

export const ABOUT = {
  eyebrow: "About",
  headline: ["Building a simpler way", "to understand investing."],
  paragraphs: [
    "Quantrelic Analytics Private Limited is building technology that makes financial information easier to understand and investing simpler for everyday investors.",
    "We believe access to investing should come with access to understanding.",
  ],
  facts: [
    { label: "Company", value: "Quantrelic Analytics" },
    { label: "Entity", value: "Private Limited" },
    { label: "Product", value: "QRA — in early development" },
    { label: "Based in", value: "India" },
  ],
  principles: [
    { title: "Clarity first", body: "If it needs a finance degree to read, it isn’t finished." },
    { title: "Evidence, always", body: "Every explanation carries the source behind it." },
    { title: "You decide", body: "QRA explains financial information. It never recommends." },
  ],
} as const;

export const CONTACT_COPY = {
  eyebrow: "Contact",
  headline: "Let’s talk.",
  support:
    "Whether you’re curious about Quantrelic, interested in working with us, or simply want to ask a question — we’d like to hear from you.",
  points: [
    "Have a product question?",
    "Want to work with us?",
    "Interested in joining the team?",
  ],
  formNote:
    "Use the form and we’ll get back to you — a person at Quantrelic Analytics reads every message.",
} as const;

export const FEEDBACK_COPY = {
  eyebrow: "Feedback",
  headline: "Help us make it better.",
  support: "Bugs, ideas, anything that didn’t make sense — a human reads every message.",
} as const;

export const WAITLIST_PAGE = {
  eyebrow: "Early access",
  headline: "Want to understand investing better?",
  support: "We’re building QRA now. We’ll email you when early access opens.",
} as const;
