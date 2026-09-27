/** Waitlist join form (§9). Posts to /api/v1/waitlist (proxied to the
 * FastAPI backend) for the single real product — QRA (slug "qra").
 * Handles: strict client validation, honeypot field, submit timing,
 * optional Turnstile, 429 retry guidance, dedupe.
 *
 * Honeypot note: the backend's spam screen keys on HONEYPOT_FIELD_NAME,
 * which is a trap field, not part of the strict JSON contract. A clean
 * (human) submission therefore omits the key; the key is included only
 * when the hidden field has been filled — which is the bot case — and is
 * then silently dropped server-side (§10.3). */
"use client";

import { useRef, useState } from "react";

import { FieldError, inputClass, labelClass } from "@/components/ui";
import { useTurnstile } from "@/components/useTurnstile";
import {
  HONEYPOT_FIELD_NAME,
  TURNSTILE_SITE_KEY,
  WAITLIST_INTERESTS,
  WAITLIST_PRODUCT_SLUG,
} from "@/lib/constants";
import { errorMessage, retryAfterSeconds, waitlistSchema } from "@/lib/schemas";

type State =
  | { kind: "idle" }
  | { kind: "success"; alreadyPresent: boolean }
  | { kind: "error"; message: string };

export function WaitlistForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState("");
  const [consent, setConsent] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [state, setState] = useState<State>({ kind: "idle" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const startedAtRef = useRef(Date.now());
  const { containerRef, reset: resetTurnstile } = useTurnstile(TURNSTILE_SITE_KEY, setTurnstileToken);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setState({ kind: "idle" });
    setFieldErrors({});

    const parsed = waitlistSchema.safeParse({
      email,
      interest: interest || undefined,
      consentWaitlistContact: consent,
    });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!(key in errors)) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const honeypotValue =
        ((event.currentTarget as HTMLFormElement).elements.namedItem(HONEYPOT_FIELD_NAME) as
          | HTMLInputElement
          | null)?.value ?? "";
      const payload: Record<string, unknown> = {
        slug: WAITLIST_PRODUCT_SLUG,
        email,
        consent_waitlist_contact: consent,
        consent_marketing_email: marketing,
        turnstile_token: turnstileToken || null,
        client_ts: startedAtRef.current,
        source: {
          utm_source: interest,
          page: typeof window !== "undefined" ? window.location.pathname : "",
        },
      };
      if (honeypotValue) payload[HONEYPOT_FIELD_NAME] = honeypotValue;
      const response = await fetch("/api/v1/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => ({}));
      if (response.ok) {
        setState({ kind: "success", alreadyPresent: Boolean(body.already_present) });
        setEmail("");
        setInterest("");
        resetTurnstile();
      } else if (response.status === 429) {
        const retry = retryAfterSeconds(response);
        setState({
          kind: "error",
          message: retry
            ? `You're sending requests too quickly — try again in ${retry} seconds.`
            : "Too many requests right now. Please try again shortly.",
        });
      } else {
        setState({ kind: "error", message: errorMessage(body) });
      }
    } catch {
      setState({ kind: "error", message: "Network error — is the API running? Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  if (state.kind === "success") {
    return (
      <div
        data-testid="waitlist-success"
        role="status"
        className="rounded-lg border border-positive/30 bg-positive/[0.08] p-5 text-sm"
      >
        <p className="font-semibold text-paper">
          {state.alreadyPresent ? "You're already on the list." : "You're on the list!"}
        </p>
        <p className="mt-1.5 leading-relaxed text-paper-dim">
          {state.alreadyPresent
            ? "We already have this email for QRA — no action needed."
            : "We'll email you when early access opens. Waitlist updates only — no spam."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor="waitlist-email" className={labelClass}>
          Email
        </label>
        <input
          id="waitlist-email"
          data-testid="waitlist-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={inputClass}
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "waitlist-email-error" : undefined}
        />
        <FieldError id="waitlist-email-error">{fieldErrors.email}</FieldError>
      </div>

      <div>
        <label htmlFor="waitlist-interest" className={labelClass}>
          What would you like to understand better?{" "}
          <span className="font-normal text-paper-mute">(optional)</span>
        </label>
        <select
          id="waitlist-interest"
          data-testid="waitlist-interest"
          value={interest}
          onChange={(e) => setInterest(e.target.value)}
          className={inputClass}
        >
          <option value="">Choose an area</option>
          {WAITLIST_INTERESTS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        <label className="flex items-start gap-2.5 text-sm leading-relaxed text-paper-dim">
          <input
            type="checkbox"
            data-testid="waitlist-consent"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-line-strong accent-brand-500"
            aria-describedby={fieldErrors.consentWaitlistContact ? "waitlist-consent-error" : undefined}
          />
          <span>
            I agree to be contacted about waitlist updates and early access for QRA.{" "}
            <span className="text-paper-mute">(required)</span>
          </span>
        </label>
        <FieldError id="waitlist-consent-error">{fieldErrors.consentWaitlistContact}</FieldError>
        <label className="flex items-start gap-2.5 text-sm leading-relaxed text-paper-mute">
          <input
            type="checkbox"
            data-testid="waitlist-marketing"
            checked={marketing}
            onChange={(e) => setMarketing(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-line-strong accent-brand-500"
          />
          <span>Optional: send me occasional product news (marketing consent, separate).</span>
        </label>
      </div>

      {/* Honeypot — hidden from humans; bots that fill it are dropped server-side. */}
      <div className="absolute -left-[9999px] top-auto" aria-hidden="true">
        <label>
          Leave this field empty
          <input tabIndex={-1} autoComplete="off" name={HONEYPOT_FIELD_NAME} />
        </label>
      </div>

      {TURNSTILE_SITE_KEY && <div ref={containerRef} />}

      <button
        type="submit"
        data-testid="waitlist-submit"
        disabled={submitting}
        className={`${
          compact ? "w-full" : "w-full sm:w-auto"
        } inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-60`}
      >
        {submitting ? "Joining…" : "Join the waitlist"}
      </button>

      {state.kind === "error" && (
        <p data-testid="waitlist-error" role="alert" className="text-sm text-danger">
          {state.message}
        </p>
      )}
      <p className="text-xs leading-relaxed text-paper-mute">
        Protected by rate limits, bot checks and spam filters. Read the{" "}
        <a href="/privacy" className="underline hover:text-paper-dim">
          privacy policy
        </a>
        .
      </p>
    </form>
  );
}
