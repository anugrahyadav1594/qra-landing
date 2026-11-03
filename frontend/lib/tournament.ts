/**
 * Mumbai Trading Tournament — shared types, brand constants and the
 * fallback configuration used when the backend is unreachable (build time,
 * offline preview). Every value here is mirrored by the backend's
 * TournamentConfig record, which is the source of truth at runtime.
 *
 * Nothing about dates, venues, eligibility or qualification criteria is
 * invented: those fields stay null until an administrator fills them in.
 */

export const TOURNAMENT_NAME = "Quantrelic's Mumbai Trading Tournament";
export const TOURNAMENT_SHORT_NAME = "MTT";
export const TOURNAMENT_ORGANIZER = "Quant Relic Analytics Private Limited";
export const TOURNAMENT_POWERED_BY = "POWERED BY QUANT RELIC";
export const TOURNAMENT_SLUG = "mtt";

/** Currencies are rendered with the Indian numbering system. */
export const CURRENCY = "INR";
export const CURRENCY_SYMBOL = "₹";

export type RegistrationStatus =
  | "draft"
  | "email_verification_pending"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "waitlisted"
  | "cancelled";

export const REGISTRATION_STATUSES: RegistrationStatus[] = [
  "draft",
  "email_verification_pending",
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "waitlisted",
  "cancelled",
];

export const STATUS_LABELS: Record<RegistrationStatus, string> = {
  draft: "Draft",
  email_verification_pending: "Email verification pending",
  submitted: "Submitted",
  under_review: "Under review",
  approved: "Approved",
  rejected: "Not selected",
  waitlisted: "Waitlisted",
  cancelled: "Cancelled",
};

export const STATUS_TONES: Record<RegistrationStatus, string> = {
  draft: "border-white/12 bg-white/5 text-ash",
  email_verification_pending: "border-flare-500/40 bg-flare-500/10 text-flare-300",
  submitted: "border-signal-500/40 bg-signal-500/10 text-signal-300",
  under_review: "border-flare-500/40 bg-flare-500/10 text-flare-300",
  approved: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  rejected: "border-red-500/40 bg-red-500/10 text-red-300",
  waitlisted: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  cancelled: "border-white/12 bg-white/5 text-ash",
};

export type PrizeTier = {
  key: string;
  label: string;
  amount: number;
  count: number;
  note?: string | null;
  kind: "cash" | "goodies";
};

export type TournamentConfig = {
  slug: string;
  name: string;
  short_name: string;
  organizer: string;
  tagline: string;
  hero_headline: string;
  hero_subhead: string;
  status_label: string;
  participation_type: string;
  qualifying_format: string;
  location_context: string;
  currency: string;
  prize_pool_total: number;
  cash_prize_pool: number;
  goodies_and_merchandise: number;
  champion_prize: number;
  first_runner_up_prize: number;
  second_runner_up_prize: number;
  merit_prize_count: number;
  merit_prize_amount: number;
  merit_prize_total: number;
  prize_tiers: PrizeTier[];
  event_starts_at: string | null;
  registration_opens_at: string | null;
  registration_closes_at: string | null;
  venue: string | null;
  eligibility: string | null;
  competition_format: string | null;
  qualifying_round_info: string | null;
  final_round_info: string | null;
  description: string | null;
  rules_md: string | null;
  registrations_open: boolean;
  auto_approve_registrations: boolean;
  leaderboard_enabled: boolean;
  contact_email: string | null;
  updated_at: string | null;
};

export type College = {
  id: string;
  name: string;
  location: string | null;
  logo_url: string | null;
  description: string | null;
  is_active: boolean;
  accepts_registrations: boolean;
  registration_count?: number;
  created_at?: string | null;
};

export type Sponsor = {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  category: string;
  display_order: number;
  is_active: boolean;
};

export const SPONSOR_CATEGORIES = [
  "title_sponsor",
  "associate_sponsor",
  "event_partner",
  "supporting_partner",
  "other_partner",
] as const;

export const SPONSOR_CATEGORY_LABELS: Record<string, string> = {
  title_sponsor: "Title Sponsor",
  associate_sponsor: "Associate Sponsor",
  event_partner: "Event Partner",
  supporting_partner: "Supporting Partner",
  other_partner: "Partner",
};

export const SPONSOR_CATEGORY_ORDER: string[] = [
  "title_sponsor",
  "associate_sponsor",
  "event_partner",
  "supporting_partner",
  "other_partner",
];

export type Announcement = {
  id: string;
  title: string;
  body_md: string;
  category: string;
  pinned: boolean;
  is_published: boolean;
  published_at: string | null;
};

export type LeaderboardEntry = {
  id?: string | null;
  rank: number | null;
  display_name: string;
  college_name: string | null;
  score: number | null;
  qualification_status: string | null;
};

export type LeaderboardPayload = {
  enabled: boolean;
  updated_at: string | null;
  entries: LeaderboardEntry[];
};

export type Registration = {
  id: string;
  registration_id: string;
  status: RegistrationStatus;
  full_name: string;
  email: string;
  mobile: string | null;
  college_id: string | null;
  college_name: string | null;
  college_location: string | null;
  college_logo_url: string | null;
  course: string | null;
  academic_year: string | null;
  city: string | null;
  email_verified: boolean;
  status_note: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type ParticipantProfile = {
  id: string;
  email: string;
  email_verified: boolean;
  full_name: string | null;
  created_at: string | null;
};

/** Prize configuration exactly as confirmed by the organisers (₹1,00,000). */
export const DEFAULT_PRIZE_TIERS: PrizeTier[] = [
  { key: "champion", label: "Champion", amount: 25000, count: 1, kind: "cash", note: "Highest honour of the tournament" },
  { key: "first_runner_up", label: "First Runner-up", amount: 15000, count: 1, kind: "cash", note: null },
  { key: "second_runner_up", label: "Second Runner-up", amount: 10000, count: 1, kind: "cash", note: null },
  { key: "merit", label: "Merit Prizes", amount: 1000, count: 10, kind: "cash", note: "10 winners × ₹1,000" },
  { key: "goodies", label: "Goodies & Merchandise", amount: 40000, count: 1, kind: "goodies", note: "Participant rewards, kits and merchandise" },
];

export const DEFAULT_TOURNAMENT_CONFIG: TournamentConfig = {
  slug: TOURNAMENT_SLUG,
  name: TOURNAMENT_NAME,
  short_name: TOURNAMENT_SHORT_NAME,
  organizer: TOURNAMENT_ORGANIZER,
  tagline: "Mumbai's trading competition",
  hero_headline: "THE MARKET IS YOUR ARENA.",
  hero_subhead:
    "Think strategically. Analyse the markets. Compete with the brightest minds across Mumbai.",
  status_label: "MUMBAI'S TRADING COMPETITION",
  participation_type: "Individual",
  qualifying_format: "College-level qualifying rounds",
  location_context: "Mumbai",
  currency: CURRENCY,
  prize_pool_total: 100000,
  cash_prize_pool: 60000,
  goodies_and_merchandise: 40000,
  champion_prize: 25000,
  first_runner_up_prize: 15000,
  second_runner_up_prize: 10000,
  merit_prize_count: 10,
  merit_prize_amount: 1000,
  merit_prize_total: 10000,
  prize_tiers: DEFAULT_PRIZE_TIERS,
  event_starts_at: null,
  registration_opens_at: null,
  registration_closes_at: null,
  venue: null,
  eligibility: null,
  competition_format: null,
  qualifying_round_info:
    "Detailed qualifying-round guidelines will be announced soon.",
  final_round_info: null,
  description: null,
  rules_md: null,
  registrations_open: true,
  auto_approve_registrations: false,
  leaderboard_enabled: false,
  contact_email: null,
  updated_at: null,
};

/** ₹1,00,000 — Indian digit grouping, no locale dependency (SSR-stable). */
export function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return "—";
  const negative = amount < 0;
  const value = Math.abs(Math.round(amount)).toString();
  if (value.length <= 3) return `${negative ? "-" : ""}${CURRENCY_SYMBOL}${value}`;
  const last3 = value.slice(-3);
  const rest = value.slice(0, -3);
  const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${negative ? "-" : ""}${CURRENCY_SYMBOL}${grouped},${last3}`;
}

/** Compact registration id display, e.g. MTT-8F3C21. */
export function shortRegistrationId(id: string | null | undefined): string {
  if (!id) return "—";
  const trimmed = id.trim().toUpperCase();
  // Already human-facing (e.g. "MTT-4KQ8ZP") — keep it exactly as printed.
  if (trimmed.length <= 12) return trimmed;
  const compact = trimmed.replace(/[^A-Z0-9]/g, "");
  return `${compact.slice(0, 3)}-${compact.slice(3, 9)}`;
}

export function displayRegistrationId(registration: {
  id?: string;
  registration_id?: string | null;
}): string {
  return registration.registration_id || shortRegistrationId(registration.id);
}

/** Reconciliation guard used by the admin form and its tests. */
export function validatePrizeConfig(config: {
  champion_prize: number;
  first_runner_up_prize: number;
  second_runner_up_prize: number;
  merit_prize_count: number;
  merit_prize_amount: number;
  merit_prize_total: number;
  cash_prize_pool: number;
  goodies_and_merchandise: number;
  prize_pool_total: number;
}): string[] {
  const errors: string[] = [];
  const meritTotal = Number(config.merit_prize_count) * Number(config.merit_prize_amount);
  const cashSum =
    Number(config.champion_prize) +
    Number(config.first_runner_up_prize) +
    Number(config.second_runner_up_prize) +
    meritTotal;

  if (meritTotal !== Number(config.merit_prize_total)) {
    errors.push(
      `Merit prizes must reconcile: ${config.merit_prize_count} × ₹${config.merit_prize_amount} = ₹${meritTotal}, not ₹${config.merit_prize_total}.`,
    );
  }
  if (cashSum !== Number(config.cash_prize_pool)) {
    errors.push(
      `Cash prizes must sum to the cash pool: ₹${cashSum} ≠ ₹${config.cash_prize_pool}.`,
    );
  }
  const total = Number(config.cash_prize_pool) + Number(config.goodies_and_merchandise);
  if (total !== Number(config.prize_pool_total)) {
    errors.push(
      `Cash pool + goodies must equal the total prize pool: ₹${total} ≠ ₹${config.prize_pool_total}.`,
    );
  }
  return errors;
}

export function isoToday(): string {
  return new Date().toISOString();
}

/** Countdown parts for a configured event date; null when unconfigured. */
export function countdownParts(targetIso: string | null, now: Date = new Date()) {
  if (!targetIso) return null;
  const target = new Date(targetIso);
  if (Number.isNaN(target.getTime())) return null;
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, elapsed: true };
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    elapsed: false,
  };
}

export function formatDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatDateTime(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })} · ${date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  })} IST`;
}
