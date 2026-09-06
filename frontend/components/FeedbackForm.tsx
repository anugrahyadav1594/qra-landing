/** Feedback form (§10). Posts to /api/v1/feedback. Also used by the
 * contact page (with topic→category mapping and contact fields). */
"use client";

import { useRef, useState } from "react";

import { CONTACT_TOPICS, FEEDBACK_CATEGORIES, HONEYPOT_FIELD_NAME, TURNSTILE_SITE_KEY } from "@/lib/constants";
import { emailSchema, errorMessage, retryAfterSeconds, feedbackSchema } from "@/lib/schemas";
import { FieldError, inputClass, labelClass } from "@/components/ui";
import { useTurnstile } from "@/components/useTurnstile";

const RATINGS = [1, 2, 3, 4, 5] as const;

type Mode = "feedback" | "contact";

type State = { kind: "idle" } | { kind: "success" } | { kind: "error"; message: string };

export function FeedbackForm({
  mode = "feedback",
  defaultPageSlug,
}: {
  mode?: Mode;
  defaultPageSlug?: string;
}) {
  const [category, setCategory] = useState<string>(mode === "contact" ? "sales" : "website");
  const [topic, setTopic] = useState<string>(CONTACT_TOPICS[0].value);
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
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

    const parsed = feedbackSchema.safeParse({ message, contactEmail });
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
      // Honeypot (§10.3): a trap field, not part of the strict JSON
      // contract — sent only when a bot has filled the hidden input.
      const honeypotValue =
        ((event.currentTarget as HTMLFormElement).elements.namedItem(HONEYPOT_FIELD_NAME) as
          | HTMLInputElement
          | null)?.value ?? "";
      const payload: Record<string, unknown> = {
        category: mode === "contact" ? topic : category,
        message,
        rating: mode === "feedback" ? rating : null,
        page_slug:
          defaultPageSlug || (typeof window !== "undefined" ? window.location.pathname : ""),
        contact_name: mode === "contact" ? name || null : null,
        contact_email: mode === "contact" ? contactEmail || null : null,
        turnstile_token: turnstileToken || null,
        client_ts: startedAtRef.current,
      };
      if (honeypotValue) payload[HONEYPOT_FIELD_NAME] = honeypotValue;
      const response = await fetch("/api/v1/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => ({}));
      if (response.ok) {
        setState({ kind: "success" });
        setMessage("");
        setRating(null);
        if (mode === "contact") {
          setName("");
          setContactEmail("");
        }
        resetTurnstile();
      } else if (response.status === 429) {
        const retry = retryAfterSeconds(response);
        setState({
          kind: "error",
          message: retry
            ? `You're sending too quickly — try again in ${retry} seconds.`
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
        data-testid="feedback-success"
        role="status"
        className="rounded-xl border border-aqua-500/30 bg-aqua-500/10 p-5 text-sm text-aqua-300"
      >
        <p className="font-semibold">
          {mode === "contact" ? "Message sent." : "Thanks for the feedback!"}
        </p>
        <p className="mt-1 text-zinc-300">
          {mode === "contact"
            ? "We read everything and reply to every message, usually within two working days."
            : "Every submission lands in our queue and is read by a human."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {mode === "contact" && (
        <>
          <div>
            <label htmlFor="contact-name" className={labelClass}>
              Your name
            </label>
            <input
              id="contact-name"
              data-testid="contact-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="contact-email" className={labelClass}>
              Your email
            </label>
            <input
              id="contact-email"
              data-testid="contact-email"
              type="email"
              autoComplete="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputClass}
              aria-invalid={Boolean(fieldErrors.contactEmail)}
              aria-describedby={fieldErrors.contactEmail ? "contact-email-error" : undefined}
            />
            <FieldError id="contact-email-error">{fieldErrors.contactEmail}</FieldError>
          </div>
          <div>
            <label htmlFor="contact-topic" className={labelClass}>
              What is this about?
            </label>
            <select
              id="contact-topic"
              data-testid="contact-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className={inputClass}
            >
              {CONTACT_TOPICS.map((option) => (
                <option key={option.value} value={option.value} className="bg-ink-900">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {mode === "feedback" && (
        <div>
          <label htmlFor="feedback-category" className={labelClass}>
            Category
          </label>
          <select
            id="feedback-category"
            data-testid="feedback-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputClass}
          >
            {FEEDBACK_CATEGORIES.map((option) => (
              <option key={option.value} value={option.value} className="bg-ink-900">
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="feedback-message" className={labelClass}>
          {mode === "contact" ? "Message" : "What's on your mind?"}
        </label>
        <textarea
          id="feedback-message"
          data-testid="feedback-message"
          rows={5}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            mode === "contact"
              ? "How can we help?"
              : "Found a bug? Have an idea? Tell us — details help."
          }
          className={inputClass}
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={fieldErrors.message ? "feedback-message-error" : undefined}
        />
        <FieldError id="feedback-message-error">{fieldErrors.message}</FieldError>
      </div>

      {mode === "feedback" && (
        <fieldset>
          <legend className={labelClass}>Rating (optional)</legend>
          <div className="flex gap-2">
            {RATINGS.map((value) => (
              <button
                key={value}
                type="button"
                data-testid={`rating-${value}`}
                onClick={() => setRating(value)}
                aria-pressed={rating === value}
                aria-label={`Rate ${value} out of 5`}
                className={`h-10 w-10 rounded-lg border text-sm font-semibold transition ${
                  rating === value
                    ? "border-signal-500 bg-signal-500/20 text-paper"
                    : "border-white/10 bg-white/5 text-paper-dim/60 hover:border-white/25"
                }`}
              >
                {value}
              </button>
            ))}
            {rating !== null && (
              <button
                type="button"
                onClick={() => setRating(null)}
                className="ml-2 text-sm text-zinc-500 underline hover:text-zinc-300"
              >
                clear
              </button>
            )}
          </div>
        </fieldset>
      )}

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
        data-testid="feedback-submit"
        disabled={submitting}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink-950 transition hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-white/40 disabled:opacity-60"
      >
        {submitting ? "Sending…" : mode === "contact" ? "Send message" : "Submit feedback"}
      </button>

      {state.kind === "error" && (
        <p data-testid="feedback-error" role="alert" className="text-sm text-red-400">
          {state.message}
        </p>
      )}
    </form>
  );
}
