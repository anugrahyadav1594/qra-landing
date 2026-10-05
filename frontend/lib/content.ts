/**
 * Site content.
 *
 * Every string the visitor reads lives here so the story stays consistent and
 * short: one idea per section, each idea said once. Nothing in this file is a
 * factual claim about the company, its customers or its results — the product
 * is pre-launch, and all interface data is clearly marked as illustrative.
 */

/* ── Opening sequence ───────────────────────────────────────────────── */

export const LOADER = {
  wordmark: "Quantrelic Analytics",
  name: "QUANTRELIC",
  tagline: "Making investing simpler for the masses.",
  announcement: "Loading Quantrelic Analytics.",
  /** The three-word readout along the bottom edge of the opening sequence. */
  readout: ["Find it", "Explain it", "Understand it"],
};

export const ILLUSTRATIVE_LABEL = "Illustrative example";
export const CONCEPT_LABEL = "Concept interface";

/* ── Hero ──────────────────────────────────────────────────────────── */

export const HERO = {
  eyebrow: "Quantrelic Analytics",
  headline: ["Make sense of", "your investments."],
  support:
    "Financial information is everywhere. We’re building a simpler way to understand " +
    "what it all means — before you invest.",
  tagline: "Making investing simpler for the masses.",
  primaryCta: "Join the waitlist",
  secondaryCta: "See how it works",
  note: "QRA is in early development. The waitlist only means we’ll email you when early access opens.",
} as const;

export type Direction = "up" | "down" | "flat";

export const HERO_PANEL = {
  company: "RELIANCE INDUSTRIES",
  /* Round placeholders — see the disclaimer under the panel. They are the
     resting state of the animation, not a claim about any company. */
  metrics: [
    { label: "Revenue", figure: 40000, direction: "up" },
    { label: "Profit", figure: 6000, direction: "up" },
    { label: "Debt", figure: 12000, direction: "down" },
    { label: "Cash flow", figure: 5000, direction: "up" },
  ] as Metric[],
  meaningLabel: "What does this mean?",
  meaning: ["Revenue has grown steadily while margins have changed with costs."],
  /** The signature interaction, named: complexity becoming understanding. */
  phases: ["Scattered information", "Organized information", "Explained information", "Understood"],
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
      body: "Bring relevant information together.",
    },
    {
      n: "02",
      title: "Explain it",
      body: "Turn financial language into plain language.",
    },
    {
      n: "03",
      title: "Understand it",
      body: "Show what changed, why it matters and where it came from.",
    },
  ],
  closing: "Understanding first. Your decision second.",
} as const;

/* ── The product ───────────────────────────────────────────────────── */

/**
 * A figure in an illustrative interface.
 *
 * Every one of these is a round placeholder, never real company data — but it
 * is a *number* so the interface can move the way a real one would: the digits
 * step to their value instead of the value appearing from nowhere.
 */
export type Metric = {
  label: string;
  figure: number;
  direction: Direction;
  /** How the figure is read. Defaults to crore-scale rupees. */
  unit?: "crore" | "percent";
  /** Decimal places, for figures like a margin. */
  decimals?: number;
};

export type ProductTab = {
  id: string;
  label: string;
  question: string;
  summary: string[];
  metrics?: Metric[];
  source: {
    label: string;
    detail: string;
    /** Where in the document the explanation comes from. */
    page: string;
    section: string;
    /** The figures the explanation was built from. */
    used: string[];
  };
};

export const PRODUCT = {
  label: "The product",
  statement: ["See the numbers.", "Understand the story."],
  company: "RELIANCE INDUSTRIES",
  questionsLabel: "What should I understand?",
  meaningLabel: "What this means",
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
        page: "84",
        section: "Segment reporting",
        used: ["Revenue by segment", "Segment share"],
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
        { label: "Revenue", figure: 124300, direction: "up" },
        { label: "Profit", figure: 18700, direction: "up" },
        { label: "Margins", figure: 15.1, unit: "percent", decimals: 1, direction: "flat" },
        { label: "Cash flow", figure: 24600, direction: "up" },
      ],
      source: {
        label: "Financial statements",
        page: "112",
        section: "Consolidated Statement of Profit and Loss",
        used: ["Revenue", "Operating profit", "Cash flow"],
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
      metrics: [
        { label: "Volume growth", figure: 6.2, unit: "percent", decimals: 1, direction: "up" },
        { label: "Realisation", figure: 3.4, unit: "percent", decimals: 1, direction: "up" },
        { label: "Capacity used", figure: 88, unit: "percent", direction: "flat" },
      ],
      source: {
        label: "Results presentation",
        page: "18",
        section: "Management commentary",
        used: ["Volumes", "Realisation", "Capacity"],
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
        page: "220",
        section: "Principal risks and uncertainties",
        used: ["Input costs", "Project execution"],
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
        page: "—",
        section: "Recent disclosures to the exchange",
        used: ["Filing dates", "Announcements"],
        detail: "Disclosures filed with the stock exchange — the primary record of what a company has told the market.",
      },
    },
  ] as ProductTab[],
} as const;

/* ── Who it is for ─────────────────────────────────────────────────── */

export const AUDIENCE = {
  label: "For investors",
  statement: "Built for people who want to understand before they invest.",
  people: [
    {
      n: "01",
      title: "The beginner",
      quote: "I’ve started investing. Financial terms still feel confusing.",
    },
    {
      n: "02",
      title: "The curious investor",
      quote: "I want to understand a company before putting my money into it.",
    },
    {
      n: "03",
      title: "The busy investor",
      quote: "I know the basics. I don’t have hours to connect everything myself.",
    },
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
