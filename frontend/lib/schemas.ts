/** Client-side validation (mirrors the backend's Pydantic contract in
 * backend/app/schemas.py — keep the two in sync). */

import { z } from "zod";

const EMAIL_RE = /^[^@\s]{1,64}@[^@\s]{1,255}$/;

export const emailSchema = z
  .string()
  .trim()
  .max(254, "Email is too long")
  .refine((value) => EMAIL_RE.test(value), "Enter a valid email address");

export const waitlistSchema = z.object({
  email: emailSchema,
  interest: z.string().optional(),
  consentWaitlistContact: z.literal(true, {
    errorMap: () => ({ message: "Consent to waitlist contact is required" }),
  }),
});

export const feedbackSchema = z.object({
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more (at least 10 characters)")
    .max(4000, "Message must be at most 4,000 characters"),
  contactEmail: z.union([z.literal(""), emailSchema]).optional(),
});

export const applySchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(200),
  email: emailSchema,
  coverNote: z.string().trim().max(4000, "Cover note must be at most 4,000 characters").optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Consent to process your application is required" }),
  }),
});

export type ApiErrorEnvelope = {
  error?: { code?: string; message?: string; request_id?: string };
  detail?: unknown;
};

export function errorMessage(body: unknown): string {
  const envelope = body as ApiErrorEnvelope;
  if (envelope?.error?.message) return envelope.error.message;
  return "Something went wrong. Please try again.";
}

export function retryAfterSeconds(response: Response): number | null {
  const value = response.headers.get("Retry-After");
  if (!value) return null;
  const seconds = Number(value);
  return Number.isFinite(seconds) ? seconds : null;
}

// ── Mumbai Trading Tournament registration (mirrors backend/app/tournament/schemas.py) ──

export const mobileSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[^0-9]/g, ""))
  .refine((digits) => {
    const trimmed = digits.startsWith("91") && digits.length === 12 ? digits.slice(2) : digits;
    return /^[0-9]{10,15}$/.test(trimmed);
  }, "Enter a valid 10-digit mobile number")
  .transform((digits) =>
    digits.startsWith("91") && digits.length === 12 ? digits.slice(2) : digits,
  );

export const tournamentRegistrationSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Enter your full name")
    .max(200, "Name must be at most 200 characters"),
  email: emailSchema,
  mobile: mobileSchema,
  college_id: z.string().min(1, "Select your college from the onboarded list"),
  course: z.string().trim().max(120, "Keep this under 120 characters").optional(),
  academic_year: z.string().trim().max(40).optional(),
  city: z.string().trim().max(120).optional(),
});

export type TournamentRegistrationInput = z.infer<typeof tournamentRegistrationSchema>;

export const ACADEMIC_YEAR_OPTIONS = [
  "First year",
  "Second year",
  "Third year",
  "Fourth year",
  "Fifth year",
  "Postgraduate",
  "Other",
] as const;
