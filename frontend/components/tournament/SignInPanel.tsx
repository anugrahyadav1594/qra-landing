"use client";

import { useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button, Field, TextInput } from "@/components/tournament/ui";

/**
 * Step 1 of the wizard: passwordless identity.
 *
 * A six-digit code is emailed to the address; verifying it both signs the
 * participant in and proves ownership of the address, which is the email
 * verification the registration requires. No passwords are ever stored.
 */
export function SignInPanel({ onVerified }: { onVerified?: () => void }) {
  const { requestCode, confirmCode } = useAuth();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function sendCode(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const result = await requestCode(email.trim().toLowerCase());
      setStage("code");
      if (result.dev_code) {
        setNotice(
          `Development mode: your code is ${result.dev_code} (email delivery is not configured).`,
        );
      } else {
        setNotice(
          result.delivery === "smtp"
            ? "Code sent. Check your inbox."
            : "Code generated. Email delivery is not configured on this environment, so it was logged server-side.",
        );
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not send the code.");
    } finally {
      setBusy(false);
    }
  }

  async function verify(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await confirmCode(email.trim().toLowerCase(), code.trim());
      onVerified?.();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "That code did not work.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-bone">Verify your email</h2>
        <p className="mt-2 text-sm leading-relaxed text-ash">
          We sign you in with a one-time code — no password to remember, and the same step proves
          the address you will register with.
        </p>
      </div>

      {stage === "email" ? (
        <form onSubmit={sendCode} className="space-y-5" noValidate>
          <Field
            label="Email address"
            htmlFor="signin-email"
            required
            error={error ?? undefined}
            hint="Use the address you want tournament updates on."
          >
            <TextInput
              id="signin-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@college.ac.in"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              invalid={Boolean(error)}
              required
            />
          </Field>
          <Button type="submit" loading={busy} className="w-full sm:w-auto">
            Send my code
          </Button>
        </form>
      ) : (
        <form onSubmit={verify} className="space-y-5" noValidate>
          <Field
            label={`Code sent to ${email}`}
            htmlFor="signin-code"
            required
            error={error ?? undefined}
            hint="Six digits, valid for 10 minutes."
          >
            <TextInput
              id="signin-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="••••••"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
              invalid={Boolean(error)}
              className="font-mono tracking-[0.6em]"
              required
            />
          </Field>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" loading={busy}>
              Verify and continue
            </Button>
            <button
              type="button"
              onClick={() => {
                setStage("email");
                setCode("");
                setError(null);
                setNotice(null);
              }}
              className="arena-focus rounded text-sm text-ash underline underline-offset-4 hover:text-bone"
            >
              Use a different email
            </button>
          </div>
        </form>
      )}

      {notice && (
        <p role="status" className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-ash">
          {notice}
        </p>
      )}
    </div>
  );
}
