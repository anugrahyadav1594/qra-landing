/** Waitlist join form (§9). Posts to /api/v1/waitlist (proxied to the
 * FastAPI backend). Handles: strict client validation, honeypot field,
 * submit timing, optional Turnstile, 429 retry guidance, dedupe. */
"use client";

import { useRef, useState } from "react";

import { HONEYPOT_FIELD_NAME, TURNSTILE_SITE_KEY } from "@/lib/constants";
import { errorMessage, retryAfterSeconds, waitlistSchema } from "@/lib/schemas";
import { FieldError, inputClass, labelClass } from "@/components/ui";
import { useTurnstile } from "@/components/useTurnstile";

export type WaitlistProduct = { id: string; slug: string; name: string };

type State =
  | { kind: "idle" }
  | { kind: "success"; alreadyPresent: boolean }
  | { kind: "error"; message: string };

export function WaitlistForm({
  products,
  defaultProductId,
  compact = false,
}: {
  products: WaitlistProduct[];
  defaultProductId?: string;
  compact?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [productId, setProductId] = useState(defaultProductId || products[0]?.id || "");
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
      productId,
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
      const response = await fetch("/api/v1/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          email,
          consent_waitlist_contact: consent,
          consent_marketing_email: marketing,
          turnstile_token: turnstileToken || null,
          [HONEYPOT_FIELD_NAME]: "",
          client_ts: startedAtRef.current,
          source: { page: typeof window !== "undefined" ? window.location.pathname : "" },
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (response.ok) {
        setState({ kind: "success", alreadyPresent: Boolean(body.already_present) });
        setEmail("");
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
        className="rounded-xl border border-accent-500/30 bg-accent-500/10 p-5 text-sm text-accent-400"
      >
        <p className="font-semibold">
          {state.alreadyPresent ? "You're already on the list." : "You're on the list! 🎉"}
        </p>
        <p className="mt-1 text-zinc-300">
          {state.alreadyPresent
            ? "We already have this email for this product — no action needed."
            : "We'll email you when early access opens. First come, first served — no spam."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
        <label htmlFor="waitlist-product" className={labelClass}>
          Which product are you interested in?
        </label>
        <select
          id="waitlist-product"
          data-testid="waitlist-product"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className={inputClass}
        >
          {products.map((product) => (
            <option key={product.id} value={product.id} className="bg-ink-900">
              {product.name}
            </option>
          ))}
        </select>
        <FieldError id="waitlist-product-error">{fieldErrors.productId}</FieldError>
      </div>

      <div className="space-y-2">
        <label className="flex items-start gap-2.5 text-sm text-zinc-300">
          <input
            type="checkbox"
            data-testid="waitlist-consent"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 accent-brand-500"
            aria-describedby={fieldErrors.consentWaitlistContact ? "waitlist-consent-error" : undefined}
          />
          <span>
            I agree to be contacted about waitlist updates and early access for this
            product. <span className="text-zinc-500">(required)</span>
          </span>
        </label>
        <FieldError id="waitlist-consent-error">{fieldErrors.consentWaitlistContact}</FieldError>
        <label className="flex items-start gap-2.5 text-sm text-zinc-400">
          <input
            type="checkbox"
            data-testid="waitlist-marketing"
            checked={marketing}
            onChange={(e) => setMarketing(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 accent-brand-500"
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
        className={`${compact ? "w-full" : "w-full sm:w-auto"} inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink-950 transition hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-white/40 disabled:opacity-60`}
      >
        {submitting ? "Joining…" : "Join the waitlist"}
      </button>

      {state.kind === "error" && (
        <p data-testid="waitlist-error" role="alert" className="text-sm text-red-400">
          {state.message}
        </p>
      )}
      <p className="text-xs text-zinc-500">
        Protected by rate limits, bot checks and spam filters. Read the{" "}
        <a href="/privacy" className="underline hover:text-zinc-300">privacy policy</a>.
      </p>
    </form>
  );
}
