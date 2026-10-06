/**
 * Site content.
 *
 * Every string the visitor reads lives here so the story stays consistent and
 * short: one idea per section, each idea said once. Nothing in this file is a
 * factual claim about the company, its customers or its results — the product
 * is pre-launch, and all interface data is clearly marked as illustrative.
 *
 * The product story, in one line: **learn markets by playing through them.**
 * Everything below serves that sentence. QRA is a market-learning and
 * decision-practice environment built on historical markets — it is not a
 * broker, not a tip service, and not a prediction engine, so no string here
 * may promise returns, profits, or knowledge of the future.
 */

/* ── Opening sequence ───────────────────────────────────────────────── */

export const LOADER = {
  wordmark: "Quantrelic Analytics",
  name: "QUANTRELIC",
  tagline: "Learn markets by playing through them.",
  announcement: "Loading Quantrelic Analytics.",
  /** The three-word readout along the bottom edge of the opening sequence. */
  readout: ["Learn it", "Practice it", "Decide it"],
};

export const ILLUSTRATIVE_LABEL = "Illustrative example";
export const CONCEPT_LABEL = "Concept interface";

/** Shown on every product preview: real-looking interface, invented numbers. */
export const PREVIEW_LABEL = "Concept interface";

/* ── Hero ──────────────────────────────────────────────────────────── */

export const HERO = {
  eyebrow: "Quantrelic Analytics",
  headline: ["Learn markets", "by playing through them."],
  support:
    "Practice real market decisions using historical data — learn how markets move, " +
    "make the call, and see what happens without risking real money.",
  tagline: "Learn. Practice. Decide. Improve.",
  primaryCta: "Get early access",
  secondaryCta: "See how it works",
  /** The product statement under the CTAs — the three facts in one line. */
  note: "Real markets. Historical data. No real-money risk.",
} as const;

/* ── The hero product preview: Market Arena ────────────────────────── */

/**
 * The hero shows the product, not a dashboard: a historical replay paused at a
 * decision point, with the future withheld.
 *
 * The candles are deterministic placeholders, never a real instrument's data —
 * but they are shaped like a real chart so the interaction reads instantly.
 */
export const ARENA_PREVIEW = {
  title: "Market Arena",
  asset: "RELIANCE INDUSTRIES",
  mode: "Historical Market Replay",
  price: "₹2,481.30",
  change: "+0.84%",
  indicators: ["EMA", "RSI", "Volume"],
  time: { start: "10:15", now: "10:52", end: "11:30" },
  /** How much of the session has played, 0..1 — the replay head position. */
  played: 0.62,
  prompt: "What would you do?",
  decisions: ["Buy", "Sell", "Wait"] as const,
  /** The decision the preview settles on, so the panel tells a whole story. */
  chosen: "Wait",
  riskLabel: "Risk you set",
  risk: 0.62,
  scenario: "Price has broken above resistance.",
  decisionNote: "Decision: WAIT — the break has no volume behind it yet.",
  xp: "+40 XP",
  disclaimer:
    "Concept interface. A historical scenario with the future hidden — figures are " +
    "placeholders, not real market data, and nothing here is investment advice.",
} as const;

/**
 * Candle geometry for the preview chart: [open, high, low, close] on a 0..100
 * scale, drawn bottom-up. Shaped as a quiet range that breaks upward on the
 * last few bars — the moment the decision is asked for.
 */
export const ARENA_CANDLES: ReadonlyArray<readonly [number, number, number, number]> = [
  [46, 52, 42, 49],
  [49, 53, 45, 46],
  [46, 50, 43, 48],
  [48, 51, 44, 45],
  [45, 49, 41, 47],
  [47, 50, 44, 44],
  [44, 48, 40, 46],
  [46, 52, 43, 50],
  [50, 54, 47, 48],
  [48, 53, 46, 52],
  [52, 56, 49, 51],
  [51, 55, 48, 54],
  [54, 58, 51, 53],
  [53, 57, 50, 56],
  [56, 62, 54, 55],
  [55, 59, 52, 58],
  [58, 63, 55, 57],
  [57, 61, 54, 60],
  [60, 66, 58, 62],
  [62, 68, 60, 61],
  [61, 67, 59, 66],
  [66, 72, 64, 68],
  [68, 74, 66, 70],
  [70, 78, 68, 76],
];

/** The EMA line drawn over the candles, same 0..100 scale. */
export const ARENA_EMA: readonly number[] = [
  47, 47, 47, 46, 46, 46, 46, 48, 48, 49, 50, 51, 51, 52, 53, 54, 55, 56, 58, 59, 61, 64, 66, 70,
];

/* ── The problem ───────────────────────────────────────────────────── */

export const PROBLEM = {
  label: "The problem",
  statement: ["Reading about markets", "is not the same as practicing them."],
  /** Deterministic scatter offsets so the stack can reorganise on scroll. */
  fragments: [
    { label: "Tutorials", fx: "-26px", fy: "-18px", fr: "-2.4deg" },
    { label: "Articles", fx: "18px", fy: "-24px", fr: "1.8deg" },
    { label: "Definitions", fx: "-14px", fy: "22px", fr: "2.2deg" },
    { label: "Videos", fx: "24px", fy: "16px", fr: "-1.6deg" },
    { label: "Charts", fx: "-30px", fy: "6px", fr: "1.2deg" },
    { label: "Other people's trades", fx: "28px", fy: "-6px", fr: "-2deg" },
    { label: "Notes", fx: "16px", fy: "24px", fr: "-1.2deg" },
  ],
  overload: "You can explain the pattern.",
  clarity: "You have never had to act on one.",
  note: "Knowing what a moving average is, and knowing what to do when one crosses, are two different skills. Only one of them is practised.",
} as const;

/* ── The idea: the learning loop ───────────────────────────────────── */

export const CLASSROOM = {
  label: "The idea",
  statement: ["The market", "is the classroom."],
  support:
    "Instead of reading about market concepts, you practise them on real historical " +
    "markets — and the guidance is withdrawn as the skill arrives.",
  steps: [
    { n: "01", title: "Learn", body: "Understand one market concept." },
    { n: "02", title: "Practice", body: "Use it on historical situations, with guidance." },
    { n: "03", title: "Decide", body: "Make the call yourself. No hints." },
    { n: "04", title: "Reflect", body: "See what happened, and why." },
    { n: "05", title: "Level up", body: "The skill is scored. The next one unlocks." },
  ],
  closing: "The tutorial eventually disappears. The decision stays yours.",
  cta: "See the levels",
} as const;

/* ── Level mode ────────────────────────────────────────────────────── */

export type LevelStatus = "complete" | "available" | "locked";

export type Level = {
  n: string;
  title: string;
  status: LevelStatus;
  /** Challenges completed, for the progress pips. */
  done: number;
  total: number;
  xp: string;
  learn: string;
  practice: string;
  challenge: string;
};

export const LEVEL_MODE = {
  label: "Level mode",
  statement: ["Start with one concept.", "Master it. Move forward."],
  support:
    "Every level focuses on one market skill. Learn it, practise it, then prove you " +
    "can use it without the tutorial.",
  /** Five of the twelve launch levels — enough to read the progression. */
  levels: [
    {
      n: "01",
      title: "Read the Chart",
      status: "complete",
      done: 5,
      total: 5,
      xp: "+120 XP",
      learn: "What a candle actually tells you: open, high, low, close.",
      practice: "4 guided scenarios on real historical sessions.",
      challenge: "1 independent read, no hints.",
    },
    {
      n: "02",
      title: "Find the Trend",
      status: "available",
      done: 4,
      total: 5,
      xp: "+150 XP",
      learn: "How to tell a trend from noise, and when it is over.",
      practice: "4 guided scenarios across three market conditions.",
      challenge: "1 independent call on an unfinished session.",
    },
    {
      n: "03",
      title: "Support & Resistance",
      status: "available",
      done: 2,
      total: 5,
      xp: "+180 XP",
      learn: "Where price has been rejected before, and why it matters.",
      practice: "3 guided scenarios on levels that held and levels that broke.",
      challenge: "2 independent decisions at a live level.",
    },
    {
      n: "04",
      title: "Moving Averages",
      status: "locked",
      done: 0,
      total: 5,
      xp: "+250 XP",
      learn: "How moving averages describe trend direction and pace.",
      practice: "3 guided scenarios on rising, falling and flat regimes.",
      challenge: "1 independent decision on a crossover.",
    },
    {
      n: "05",
      title: "EMA Crossovers",
      status: "locked",
      done: 0,
      total: 5,
      xp: "+280 XP",
      learn: "What a crossover signals — and how often it does not.",
      practice: "3 guided scenarios, including two false signals.",
      challenge: "2 independent calls with risk limits.",
    },
  ] as Level[],
  more: "Twelve levels at launch — RSI, MACD, volume, breakouts, false breakouts, risk and reward.",
  flow: ["Learn", "Guided practice", "Independent challenge", "Score", "XP", "Unlock"],
} as const;

/* ── Market arena (free play) ──────────────────────────────────────── */

export const MARKET_ARENA = {
  label: "Market arena",
  statement: ["Then play", "the market."],
  support:
    "When you are ready to test yourself, enter a historical market scenario and make " +
    "the decisions yourself.",
  chooseLabel: "Choose your assets",
  assets: ["Reliance", "TCS", "Nifty", "Infosys"],
  capitalLabel: "Practice capital",
  capital: "₹10,00,000",
  /** The differentiator, stated plainly in the interface. */
  hiddenLabel: "Future information",
  hiddenValue: "Hidden",
  decisions: ["Buy", "Sell", "Wait"] as const,
  note: "Every decision is made without seeing what happens next.",
  disclaimer:
    "Concept interface. Practice capital only — no real money is used, held or at risk.",
} as const;

/* ── Score & progress ──────────────────────────────────────────────── */

export const SCORE = {
  label: "Score & progress",
  statement: ["Your decisions become", "measurable skills."],
  support:
    "Every scenario is scored on how you decided — not on whether the market happened " +
    "to move your way.",
  categories: [
    { label: "Decision quality", value: 82, detail: "Was the reasoning sound at the time?" },
    { label: "Risk management", value: 74, detail: "Did the position match the risk you set?" },
    { label: "Timing", value: 68, detail: "Did you act when your own setup said to?" },
    { label: "Consistency", value: 77, detail: "Did you follow one process, or improvise?" },
  ],
  level: 7,
  xp: 6840,
  xpNext: 8000,
  note: "Good decisions are scored above lucky outcomes — always.",
} as const;

/* ── Leaderboard ───────────────────────────────────────────────────── */

export const LEADERBOARD = {
  label: "Leaderboard",
  statement: ["Know where", "you stand."],
  support: "Ranked across a week of scenarios on decision quality — not on profit.",
  week: "Market Arena — Week 01",
  rows: [
    { rank: "01", name: "A. Menon", xp: "9,840" },
    { rank: "02", name: "R. Iyer", xp: "9,420" },
    { rank: "03", name: "S. Kaur", xp: "9,110" },
    { rank: "04", name: "D. Rao", xp: "8,760" },
    { rank: "05", name: "P. Nair", xp: "8,405" },
  ],
  you: { rank: "27", name: "You", xp: "6,840" },
  percentile: "Better than 73% of players this week.",
  closing: ["Winning is not about making the most.", "It is about deciding the best."],
} as const;

/* ── Research lab (the analysis layer underneath) ──────────────────── */

export const RESEARCH_LAB = {
  label: "Research lab",
  statement: ["Because charts are not", "the whole story."],
  support:
    "When you want more context, step outside the game and explore the company behind " +
    "the market. One company at a time — the business, the numbers, what changed, and " +
    "what could change the picture.",
} as const;

/* ── The product (research lab data) ───────────────────────────────── */

/**
 * A figure in an illustrative interface.
 *
 * Every one of these is a round placeholder, never real company data — but it
 * is a *number* so the interface can move the way a real one would: the digits
 * step to their value instead of the value appearing from nowhere.
 */
export type Direction = "up" | "down" | "flat";

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
  label: "Research lab",
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
      question: "What's driving the change?",
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
        detail: "The risks a listed company is required to set out in its report — read in the company's own words.",
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

export const LEARNERS = {
  label: "For learners",
  statement: "Three very different starting points. The same loop.",
  people: [
    {
      n: "01",
      title: "The beginner",
      quote: "I know almost nothing about charts. I want to learn without risking money.",
    },
    {
      n: "02",
      title: "The curious investor",
      quote: "I understand the basics. I want to get better at reading markets.",
    },
    {
      n: "03",
      title: "The practising trader",
      quote: "I already trade. I want a place to test my decisions and sharpen my process.",
    },
  ],
  /** The progression shown beside the three people. */
  progression: ["Learn", "Practice", "Decide", "Improve"],
  closing: "Wherever you start, the way through is the same.",
  cta: "Get early access",
} as const;

/* ── Why this is different ─────────────────────────────────────────── */

export const WHY = {
  label: "Why QRA",
  statement: ["Most platforms show you", "the market. We let you", "practise it."],
  traditional: {
    title: "Traditional learning",
    steps: ["Watch", "Read", "Remember"],
    note: "The decision is never yours, so the skill never forms.",
  },
  qra: {
    title: "QRA",
    steps: ["Learn", "Practice", "Decide", "See the outcome", "Improve"],
    note: "The decision is yours, and the outcome is real history.",
  },
  closing: "Skill is built by deciding — not by reading.",
  /** The system, so no feature reads as an afterthought. */
  system: {
    title: "One system",
    nodes: [
      { label: "Level mode", detail: "One skill at a time" },
      { label: "Market arena", detail: "Decide on history" },
      { label: "Score", detail: "Measure the decision" },
      { label: "Leaderboard", detail: "Find your weakness" },
      { label: "Research lab", detail: "Understand the company" },
    ],
    caption: "Practise, measure, then go deeper. Each part exists to serve the next.",
  },
} as const;

/* ── Trust ─────────────────────────────────────────────────────────── */

export const TRUST = {
  label: "Trust",
  statement: ["Clarity over", "hype."],
  principles: [
    { n: "01", line: "No guaranteed returns." },
    { n: "02", line: "No stock tips." },
    { n: "03", line: "No pretending to know the future." },
    { n: "04", line: "No real-money trading required." },
  ],
  closing: [
    "Historical scenarios. Transparent scoring. Your decisions.",
    "QRA teaches. You decide.",
  ],
  note: "QRA is a product of Quantrelic Analytics Private Limited. It is a market-learning environment. It does not provide investment advice, recommend investments, execute trades, or make decisions for anyone.",
} as const;

/* ── Early access ──────────────────────────────────────────────────── */

export const EARLY_ACCESS = {
  label: "Early access",
  statement: ["Your first market", "challenge is coming."],
  support:
    "QRA is being built for people who want to understand markets by actually " +
    "practising them.",
  cta: "Join the waitlist",
  secondary: "Be among the first to enter the beta.",
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
  headline: ["Learn by doing,", "not by reading."],
  support: "Five steps, and they loop — the last one feeds the first.",
  steps: [
    {
      n: "01",
      title: "Learn the concept",
      body: "One market idea at a time, explained plainly before you are asked to use it.",
    },
    {
      n: "02",
      title: "Practise with guidance",
      body: "The same idea on real historical sessions, with the reasoning shown as you go.",
    },
    {
      n: "03",
      title: "Decide alone",
      body: "The guidance is withdrawn. The scenario is unfinished. The call is yours.",
    },
    {
      n: "04",
      title: "See the outcome",
      body: "History plays forward, and your decision is scored on its reasoning — not its luck.",
    },
    {
      n: "05",
      title: "Level up",
      body: "The skill is measured, the next level unlocks, and the research lab explains the company behind the chart.",
    },
  ],
} as const;

export const ABOUT = {
  eyebrow: "About",
  headline: ["Building a better way", "to learn markets."],
  paragraphs: [
    "Quantrelic Analytics Private Limited is building QRA — a market-learning environment where people practise real market decisions on historical data, without putting real money at risk.",
    "We believe understanding markets should be something you build by doing, not something you absorb by reading.",
  ],
  facts: [
    { label: "Company", value: "Quantrelic Analytics" },
    { label: "Entity", value: "Private Limited" },
    { label: "Product", value: "QRA — in early development" },
    { label: "Based in", value: "India" },
  ],
  principles: [
    { title: "Clarity first", body: "If it needs a finance degree to read, it isn't finished." },
    { title: "Decisions over tips", body: "QRA never tells you what to buy. It teaches you how to decide." },
    { title: "You decide", body: "Historical scenarios and transparent scoring. The call is always yours." },
  ],
} as const;

export const CONTACT_COPY = {
  eyebrow: "Contact",
  headline: "Let's talk.",
  support:
    "Whether you're curious about Quantrelic, interested in working with us, or simply want to ask a question — we'd like to hear from you.",
  points: [
    "Have a product question?",
    "Want to work with us?",
    "Interested in joining the team?",
  ],
  formNote:
    "Use the form and we'll get back to you — a person at Quantrelic Analytics reads every message.",
} as const;

export const FEEDBACK_COPY = {
  eyebrow: "Feedback",
  headline: "Help us make it better.",
  support: "Bugs, ideas, anything that didn't make sense — a human reads every message.",
} as const;

export const WAITLIST_PAGE = {
  eyebrow: "Early access",
  headline: "Your first market challenge is coming.",
  support:
    "QRA is being built now. Join the waitlist and we'll email you when early access opens.",
} as const;
