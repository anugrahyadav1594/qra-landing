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
  productId: z.string().min(1, "Choose a product"),
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
