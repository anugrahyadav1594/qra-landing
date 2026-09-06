/** Public site constants. Placeholder company domain — replace with the
 * real domain per ARCHITECTURE.md §24 / open question O1. */

export const SITE_NAME = "QRA";
export const SITE_DESCRIPTION =
  "QRA builds privacy-first products for modern teams — one account, one identity, every product.";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const NAV_LINKS = [
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/team", label: "Team" },
  { href: "/careers", label: "Careers" },
  { href: "/updates", label: "Updates" },
  { href: "/contact", label: "Contact" },
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
