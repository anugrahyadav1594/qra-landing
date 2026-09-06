/** Public site constants. Placeholder company domain — replace with the
 * real domain per ARCHITECTURE.md §24 / open question O1. */

export const COMPANY_NAME = "Quantrelic Analytics Private Limited";
export const PRODUCT_FULL_NAME = "Quantrelic Research Agent";
export const SITE_NAME = "Quantrelic Analytics";
export const SITE_DESCRIPTION =
  "QRA — the Quantrelic Research Agent — turns a ticker into a thesis: investigating financial statements, filings, news and market signals so investors can decide with clarity.";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/** Single real product — the waitlist posts with this slug (§9). */
export const WAITLIST_PRODUCT_SLUG = "qra";

export const NAV_LINKS = [
  { href: "/product", label: "Product" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/research", label: "Research" },
  { href: "/about", label: "About" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

export const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/product", label: "Product" },
      { href: "/research", label: "Research" },
      { href: "/waitlist", label: "Join the waitlist" },
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
    title: "Legal & trust",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/security", label: "Security" },
    ],
  },
] as const;

export const FOOTER_TAGLINE =
  "AI-powered financial research. Built for better questions, deeper investigation, and clearer thinking.";

export const WAITLIST_INTERESTS = [
  "Prefer not to say",
  "Deep company research",
  "Faster due diligence",
  "Tracking filings & news",
  "Just exploring",
];

export const FEEDBACK_CATEGORIES = [
  { value: "website", label: "Website" },
  { value: "product", label: "Product" },
  { value: "sales", label: "Sales" },
  { value: "careers", label: "Careers" },
  { value: "security", label: "Security" },
  { value: "other", label: "Other" },
] as const;

export const CONTACT_TOPICS = [
  { value: "website", label: "Website issue", category: "website" },
  { value: "sales", label: "Sales / partnership", category: "sales" },
  { value: "careers", label: "Careers question", category: "careers" },
  { value: "other", label: "Something else", category: "other" },
] as const;

/** Honeypot field name — must match the backend's HONEYPOT_FIELD_NAME. */
export const HONEYPOT_FIELD_NAME =
  process.env.NEXT_PUBLIC_HONEYPOT_FIELD_NAME || "company_website";

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

export const MAX_RESUME_SIZE_MB = Number(
  process.env.NEXT_PUBLIC_MAX_RESUME_SIZE_MB || "10",
);
