/** Public site constants — brand identity, navigation and shared copy.
 *
 * Brand note (important): **QRA** is simply the short form of
 * **QuantRelic Analytics**. It is not an acronym and must never be expanded
 * into a longer product name (it is not a "Research Agent"). The company is
 * Quantrelic Analytics Private Limited; QRA is the product.
 */

export const COMPANY_NAME = "Quantrelic Analytics Private Limited";
export const SITE_NAME = "Quantrelic Analytics";

/** Product name only — never expanded. */
export const PRODUCT_NAME = "QRA";

export const SITE_TAGLINE = "Making investing simpler for the masses.";

export const SITE_DESCRIPTION =
  "Quantrelic Analytics is building technology that makes financial information " +
  "easier to understand, helping everyday investors make more informed decisions " +
  "for themselves.";

export const SITE_TITLE = `${SITE_NAME} — Making Investing Simpler`;

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/** Single real product — the waitlist posts with this slug (§9). */
export const WAITLIST_PRODUCT_SLUG = "qra";

/** Homepage sections, in document order. Drives scroll-spy in the navbar. */
export const HOME_SECTIONS = [
  "hero",
  "problem",
  "why",
  "solution",
  "how-it-works",
  "product",
  "evidence",
  "for-investors",
  "trust",
  "waitlist",
  "about",
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
  { href: "/#product", label: "Product", sectionId: "product" },
  { href: "/#for-investors", label: "For investors", sectionId: "for-investors" },
  { href: "/#trust", label: "Trust", sectionId: "trust" },
  { href: "/#about", label: "About", sectionId: "about" },
  { href: "/contact", label: "Contact" },
];

/** Secondary destinations — surfaced in the mobile menu and the footer. */
export const SECONDARY_LINKS: readonly NavLink[] = [
  { href: "/careers", label: "Careers" },
  { href: "/feedback", label: "Feedback" },
];

export const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/#how-it-works", label: "How it works" },
      { href: "/#product", label: "Product" },
      { href: "/waitlist", label: "Waitlist" },
    ],
  },
  {
    title: "Company",
    links: [
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

export const FOOTER_TAGLINE =
  "Making investing simpler by making financial information easier to understand.";

export const FOOTER_NOTE = "QRA explains. You decide.";

/** Copy reused across pages so the positioning stays consistent. */
export const NOT_ADVICE_NOTE =
  "Quantrelic Analytics does not provide investment advice or recommend what to buy or sell.";

export const WAITLIST_INTERESTS = [
  "I'm new to investing",
  "Understanding financial statements",
  "Researching a company before I invest",
  "Keeping up with company developments",
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
