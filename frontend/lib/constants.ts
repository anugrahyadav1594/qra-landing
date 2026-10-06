/** Public site constants — brand identity, navigation and shared configuration.
 *
 * Brand note (important): **QRA** is simply the short form of
 * **QuantRelic Analytics**. It is not an acronym and must never be expanded
 * into a longer product name. The company is Quantrelic Analytics Private
 * Limited; QRA is the product.
 */

export const COMPANY_NAME = "Quantrelic Analytics Private Limited";
export const SITE_NAME = "Quantrelic Analytics";
export const SITE_SHORT_NAME = "Quantrelic";

/** Product name only — never expanded. */
export const PRODUCT_NAME = "QRA";

export const SITE_TAGLINE = "Learn markets by playing through them.";

export const SITE_DESCRIPTION =
  "QRA is a market-learning environment from Quantrelic Analytics: practise real " +
  "market decisions on historical data, level by level, and see what happens — " +
  "without risking real money.";

export const SITE_TITLE = `${SITE_NAME} — Learn Markets by Playing Through Them`;

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/** Single real product — the waitlist posts with this slug (§9). */
export const WAITLIST_PRODUCT_SLUG = "qra";

/** Homepage sections, in document order. Drives scroll-spy in the navbar. */
export const HOME_SECTIONS = [
  "hero",
  "problem",
  "how-it-works",
  "level-mode",
  "arena",
  "score",
  "leaderboard",
  "research-lab",
  "for-learners",
  "why",
  "trust",
  "waitlist",
] as const;

export type HomeSectionId = (typeof HOME_SECTIONS)[number];

export type NavLink = {
  href: string;
  label: string;
  /** When set, the link is a homepage section and participates in scroll-spy. */
  sectionId?: HomeSectionId;
};

export const NAV_LINKS: readonly NavLink[] = [
  { href: "/#how-it-works", label: "How it works", sectionId: "how-it-works" },
  { href: "/#level-mode", label: "The Experience", sectionId: "level-mode" },
  { href: "/#for-learners", label: "For Learners", sectionId: "for-learners" },
  { href: "/#trust", label: "Trust", sectionId: "trust" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/** The one conversion action. Every CTA on the site uses this wording. */
export const PRIMARY_CTA_LABEL = "Get early access";
export const PRIMARY_CTA_HREF = "/waitlist";

/** Secondary destinations — the mobile menu and the footer. */
export const SECONDARY_LINKS: readonly NavLink[] = [
  { href: "/#arena", label: "Market Arena", sectionId: "arena" },
  { href: "/research", label: "How it works, in detail" },
  { href: "/careers", label: "Careers" },
  { href: "/feedback", label: "Feedback" },
];

export const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/#how-it-works", label: "How it works" },
      { href: "/#level-mode", label: "Level mode" },
      { href: "/#arena", label: "Market arena" },
      { href: "/#research-lab", label: "Research lab" },
      { href: "/waitlist", label: "Early access" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/#for-learners", label: "For learners" },
      { href: "/#trust", label: "Trust" },
      { href: "/about", label: "About" },
      { href: "/careers", label: "Careers" },
      { href: "/contact", label: "Contact" },
      { href: "/feedback", label: "Feedback" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/security", label: "Security" },
    ],
  },
] as const;

export const FOOTER_TAGLINE = SITE_TAGLINE;

export const FOOTER_NOTE = "QRA teaches. You decide.";

/** Copy reused across pages so the positioning stays consistent. */
export const NOT_ADVICE_NOTE =
  "Quantrelic Analytics does not provide investment advice or recommend what to buy or sell.";

export const WAITLIST_INTERESTS = [
  "I'm new to markets",
  "Learning to read charts",
  "Testing decisions before risking money",
  "I already trade and want to sharpen my process",
  "Just exploring",
];

export const FEEDBACK_CATEGORIES = [
  { value: "website", label: "This website" },
  { value: "product", label: "The product" },
  { value: "sales", label: "Working with Quantrelic" },
  { value: "careers", label: "Careers" },
  { value: "security", label: "Security" },
  { value: "other", label: "Something else" },
] as const;

/** Contact-page topics. `category` is the value the feedback API expects. */
export const CONTACT_TOPICS = [
  { value: "product", label: "A product question", category: "product" },
  { value: "partnership", label: "Working with Quantrelic", category: "sales" },
  { value: "careers", label: "Careers or joining the team", category: "careers" },
  { value: "website", label: "Something about this website", category: "website" },
  { value: "sales", label: "Sales enquiry", category: "sales" },
  { value: "other", label: "Something else", category: "other" },
] as const;

/**
 * Optional real contact details, loaded from configuration. Nothing is
 * invented here: when these are unset the UI simply says "use the form".
 */
export const CONTACT_GENERAL_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "";
export const SECURITY_CONTACT_EMAIL = process.env.NEXT_PUBLIC_SECURITY_EMAIL || "";

/** Honeypot field name — must match the backend's HONEYPOT_FIELD_NAME. */
export const HONEYPOT_FIELD_NAME =
  process.env.NEXT_PUBLIC_HONEYPOT_FIELD_NAME || "company_website";

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

export const MAX_RESUME_SIZE_MB = Number(
  process.env.NEXT_PUBLIC_MAX_RESUME_SIZE_MB || "10",
);
