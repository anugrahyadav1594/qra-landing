/** Career application form (§6.1 / §13.3). Multipart POST with the resume
 * to /api/v1/careers/[slug]/apply. Client-side size/type checks mirror the
 * backend's MAX_RESUME_SIZE_MB + PDF-only rule (§14.4). */
"use client";

import { useRef, useState } from "react";

import { MAX_RESUME_SIZE_MB, TURNSTILE_SITE_KEY } from "@/lib/constants";
import { applySchema, errorMessage, retryAfterSeconds } from "@/lib/schemas";
import { FieldError, inputClass, labelClass } from "@/components/ui";
import { useTurnstile } from "@/components/useTurnstile";

type State = { kind: "idle" } | { kind: "success" } | { kind: "error"; message: string };

export function ApplyForm({ slug, title }: { slug: string; title: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [coverNote, setCoverNote] = useState("");
  const [consent, setConsent] = useState(false);
  const [resumeName, setResumeName] = useState("");
  const [fileError, setFileError] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const startedAtRef = useRef(Date.now());
  const fileRef = useRef<HTMLInputElement>(null);
  const { containerRef, reset: resetTurnstile } = useTurnstile(TURNSTILE_SITE_KEY, setTurnstileToken);

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setFileError("");
    if (!file) {
      setResumeName("");
      return;
    }
    if (file.type !== "application/pdf") {
      setFileError("Resume must be a PDF.");
      event.target.value = "";
      setResumeName("");
      return;
    }
    if (file.size > MAX_RESUME_SIZE_MB * 1024 * 1024) {
      setFileError(`Resume must be at most ${MAX_RESUME_SIZE_MB} MB.`);
      event.target.value = "";
      setResumeName("");
      return;
    }
    setResumeName(file.name);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setState({ kind: "idle" });
    setFieldErrors({});

    const parsed = applySchema.safeParse({ name, email, coverNote, consent });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!(key in errors)) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    const file = fileRef.current?.files?.[0];
    if (!file) {
      setFileError("Please attach your resume (PDF).");
      return;
    }

    setSubmitting(true);
    try {
      const honeypotValue =
        ((event.currentTarget as HTMLFormElement).elements.namedItem("honeypot") as
          | HTMLInputElement
          | null)?.value ?? "";
      const form = new FormData();
      form.append("name", name);
      form.append("email", email);
      form.append("phone", phone || "");
      form.append("cover_note", coverNote);
      form.append("consent_careers", String(consent));
      form.append("turnstile_token", turnstileToken || "");
      // The careers endpoint declares the trap field literally as
      // `honeypot` (§10.3) — the form field name must match exactly.
      form.append("honeypot", honeypotValue);
      form.append("client_ts", String(startedAtRef.current));
      form.append("resume", file);

      const response = await fetch(`/api/v1/careers/${slug}/apply`, {
        method: "POST",
        body: form,
      });
      const body = await response.json().catch(() => ({}));
      if (response.ok) {
        setState({ kind: "success" });
        resetTurnstile();
      } else if (response.status === 409) {
        setState({ kind: "error", message: "You have already applied to this position." });
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
        data-testid="apply-success"
        role="status"
        className="rounded-xl border border-aqua-500/30 bg-aqua-500/10 p-5 text-sm text-aqua-300"
      >
        <p className="font-semibold">Application received.</p>
        <p className="mt-1 text-zinc-300">
          Thanks for applying to {title}. We read every application and reply within a week —
          usually much sooner.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="apply-name" className={labelClass}>
            Full name
          </label>
          <input
            id="apply-name"
            data-testid="apply-name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? "apply-name-error" : undefined}
          />
          <FieldError id="apply-name-error">{fieldErrors.name}</FieldError>
        </div>
        <div>
          <label htmlFor="apply-email" className={labelClass}>
            Email
          </label>
          <input
            id="apply-email"
            data-testid="apply-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "apply-email-error" : undefined}
          />
          <FieldError id="apply-email-error">{fieldErrors.email}</FieldError>
        </div>
      </div>

      <div>
        <label htmlFor="apply-phone" className={labelClass}>
          Phone <span className="text-zinc-500">(optional)</span>
        </label>
        <input
          id="apply-phone"
          data-testid="apply-phone"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+91 …"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="apply-cover" className={labelClass}>
          Cover note <span className="text-zinc-500">(optional)</span>
        </label>
        <textarea
          id="apply-cover"
          data-testid="apply-cover"
          rows={4}
          value={coverNote}
          onChange={(e) => setCoverNote(e.target.value)}
          placeholder="Why this role, and why you?"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="apply-resume" className={labelClass}>
          Resume (PDF, max {MAX_RESUME_SIZE_MB} MB)
        </label>
        <input
          id="apply-resume"
          data-testid="apply-resume"
          ref={fileRef}
          type="file"
          accept="application/pdf"
          onChange={handleFile}
          className="block w-full text-sm text-zinc-400 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-white/20"
        />
        {resumeName && !fileError && (
          <p className="mt-1.5 text-xs text-zinc-400">Attached: {resumeName}</p>
        )}
        <FieldError id="apply-resume-error">{fileError}</FieldError>
      </div>

      <label className="flex items-start gap-2.5 text-sm text-zinc-300">
        <input
          type="checkbox"
          data-testid="apply-consent"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 accent-signal-500"
          aria-describedby={fieldErrors.consent ? "apply-consent-error" : undefined}
        />
        <span>
          I agree that Quantrelic Analytics may process my application data, including
          my resume, for this recruitment process. <span className="text-paper-dim/40">(required)</span>
        </span>
      </label>
      <FieldError id="apply-consent-error">{fieldErrors.consent}</FieldError>

      {/* Honeypot — hidden from humans; bots that fill it are dropped server-side. */}
      <div className="absolute -left-[9999px] top-auto" aria-hidden="true">
        <label>
          Leave this field empty
          <input tabIndex={-1} autoComplete="off" name="honeypot" />
        </label>
      </div>

      {TURNSTILE_SITE_KEY && <div ref={containerRef} />}

      <button
        type="submit"
        data-testid="apply-submit"
        disabled={submitting}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink-950 transition hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-white/40 disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Submit application"}
      </button>

      {state.kind === "error" && (
        <p data-testid="apply-error" role="alert" className="text-sm text-red-400">
          {state.message}
        </p>
      )}
      <p className="text-xs text-zinc-500">
        Your data is handled per our <a href="/privacy" className="underline hover:text-zinc-300">privacy policy</a>.
      </p>
    </form>
  );
}
