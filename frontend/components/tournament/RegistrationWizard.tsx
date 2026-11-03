"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { CollegeSelect } from "@/components/tournament/CollegeSelect";
import { SignInPanel } from "@/components/tournament/SignInPanel";
import {
  Button,
  Checkbox,
  EmptyState,
  ErrorState,
  Field,
  Select,
  Steps,
  TextInput,
  useToast,
} from "@/components/tournament/ui";
import { ACADEMIC_YEAR_OPTIONS, tournamentRegistrationSchema } from "@/lib/schemas";
import { HONEYPOT_FIELD_NAME } from "@/lib/constants";
import { submitRegistration } from "@/lib/tournamentApi";
import type { College, Registration, TournamentConfig } from "@/lib/tournament";

type FormState = {
  full_name: string;
  email: string;
  mobile: string;
  college_id: string;
  course: string;
  academic_year: string;
  city: string;
};

const STEP_LABELS = ["Identity", "Your details", "College", "Review"];

/**
 * The individual registration journey: verify email → your details → college
 * → review & consent. Nothing is submitted until the backend confirms the
 * transaction, and no success state is shown before that.
 */
export function RegistrationWizard({
  colleges,
  config,
  existingRegistration,
}: {
  colleges: College[];
  config: TournamentConfig;
  existingRegistration: Registration | null;
}) {
  const router = useRouter();
  const { status, user, registration, setRegistration } = useAuth();
  const { push } = useToast();

  const [form, setForm] = useState<FormState>({
    full_name: user?.full_name ?? "",
    email: user?.email ?? "",
    mobile: "",
    college_id: "",
    course: "",
    academic_year: "",
    city: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [consentParticipation, setConsentParticipation] = useState(false);
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [step, setStep] = useState(0);

  const idempotencyKey = useRef<string>("");
  useEffect(() => {
    idempotencyKey.current =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `mtt-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }, []);

  // Keep the form in sync with the signed-in identity.
  useEffect(() => {
    if (!user) return;
    setForm((current) => ({
      ...current,
      email: user.email,
      full_name: current.full_name || user.full_name || "",
    }));
  }, [user]);

  const signedIn = status === "signed-in";
  const currentStep = signedIn ? Math.max(step, 1) : 0;

  const selectedCollege = useMemo(
    () => colleges.find((college) => college.id === form.college_id) ?? null,
    [colleges, form.college_id],
  );

  const validateStep = useCallback(
    (target: number): boolean => {
      const parsed = tournamentRegistrationSchema.safeParse(form);
      const nextErrors: Partial<Record<keyof FormState, string>> = {};
      if (!parsed.success) {
        for (const issue of parsed.error.issues) {
          const key = issue.path[0] as keyof FormState;
          if (key && !nextErrors[key]) nextErrors[key] = issue.message;
        }
      }
      const relevant: (keyof FormState)[] =
        target === 1
          ? ["full_name", "email", "mobile"]
          : target === 2
            ? ["college_id"]
            : (Object.keys(form) as (keyof FormState)[]);
      const stepErrors: Partial<Record<keyof FormState, string>> = {};
      for (const key of relevant) {
        if (nextErrors[key]) stepErrors[key] = nextErrors[key];
      }
      setErrors(stepErrors);
      return Object.keys(stepErrors).length === 0;
    },
    [form],
  );

  async function handleSubmit() {
    if (!validateStep(3)) return;
    if (!consentParticipation || !consentPrivacy) {
      setServerError("Both participation consent and privacy-policy consent are required.");
      return;
    }
    setServerError(null);
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        email: user?.email ?? form.email,
        consent_event_participation: consentParticipation,
        consent_privacy_policy: consentPrivacy,
        consent_marketing_email: consentMarketing,
        client_ts: Date.now(),
        [HONEYPOT_FIELD_NAME]: "",
        honeypot: "",
      };
      const result = await submitRegistration(payload, {
        idempotencyKey: idempotencyKey.current,
      });
      setRegistration(result.registration);
      if (result.already_registered) {
        push("You were already registered — here is your existing entry.", "info");
      }
      router.push("/tournament/success?new=1");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Registration failed.";
      setServerError(message);
      if (/college/i.test(message)) {
        setErrors((current) => ({ ...current, college_id: message }));
        setStep(2);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="arena-panel arena-panel-sm p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-ash">
          Checking your session…
        </p>
      </div>
    );
  }

  if (existingRegistration || registration) {
    const record = existingRegistration ?? registration;
    return (
      <div className="arena-panel arena-panel-sm p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-flare-300">
          Already registered
        </p>
        <h2 className="mt-3 font-display text-2xl font-semibold text-bone">
          You&apos;re in. Welcome to the arena.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ash">
          Registration <span className="font-mono text-bone">{record?.registration_id}</span> is on
          file{record?.college_name ? ` for ${record.college_name}` : ""}. You can review your entry,
          announcements and next steps from your dashboard.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/tournament/dashboard" className="btn-flare arena-focus rounded-full px-5 py-2.5 text-sm">
            Open my dashboard
          </Link>
          <Link href="/tournament/success" className="btn-ghost arena-focus rounded-full px-5 py-2.5 text-sm">
            View confirmation
          </Link>
        </div>
      </div>
    );
  }

  if (!config.registrations_open) {
    return (
      <EmptyState
        icon="ring"
        title="Registrations are closed"
        description="The organisers have paused registrations for this edition. Follow the announcements for the next update — your dashboard and the tournament page always show the current state."
      />
    );
  }

  if (colleges.length === 0) {
    return (
      <EmptyState
        icon="grid"
        title="Registrations open shortly"
        description="Colleges are being onboarded by the organisers, and the registration form opens as soon as the verified list is live. Nothing is accepted manually in the meantime, so every entry stays attributable to a real campus."
        action={
          <Link href="/contact" className="btn-ghost arena-focus rounded-full px-5 py-2.5 text-sm">
            Contact the organisers
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      <Steps
        steps={STEP_LABELS}
        current={currentStep}
        onSelect={(index) => {
          if (index >= 1 && index < currentStep) setStep(index);
        }}
      />

      <div className="arena-panel arena-panel-sm relative overflow-hidden p-6 sm:p-8">
        {currentStep === 0 && (
          <SignInPanel
            onVerified={() => {
              setStep(1);
            }}
          />
        )}

        {currentStep === 1 && (
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              if (validateStep(1)) setStep(2);
            }}
            className="space-y-5"
          >
            <div>
              <h2 className="font-display text-xl font-semibold text-bone">Your details</h2>
              <p className="mt-2 text-sm text-ash">
                These are the details printed on your entry. Keep them accurate — they are what the
                organisers verify you with.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name" htmlFor="full_name" required error={errors.full_name}>
                <TextInput
                  id="full_name"
                  autoComplete="name"
                  value={form.full_name}
                  invalid={Boolean(errors.full_name)}
                  onChange={(event) => setForm({ ...form, full_name: event.target.value })}
                  placeholder="As on your college ID"
                />
              </Field>

              <Field
                label="Email address"
                htmlFor="email"
                required
                error={errors.email}
                hint="Verified in step 1 — contact support if this is wrong."
              >
                <TextInput id="email" value={form.email} readOnly disabled />
              </Field>

              <Field label="Mobile number" htmlFor="mobile" required error={errors.mobile}>
                <TextInput
                  id="mobile"
                  inputMode="tel"
                  autoComplete="tel"
                  value={form.mobile}
                  invalid={Boolean(errors.mobile)}
                  onChange={(event) =>
                    setForm({ ...form, mobile: event.target.value.replace(/[^\d+]/g, "") })
                  }
                  placeholder="10-digit mobile number"
                />
              </Field>

              <Field label="Course / branch" htmlFor="course" error={errors.course}>
                <TextInput
                  id="course"
                  value={form.course}
                  onChange={(event) => setForm({ ...form, course: event.target.value })}
                  placeholder="e.g. B.Tech Computer Science"
                />
              </Field>

              <Field label="Academic year" htmlFor="academic_year">
                <Select
                  id="academic_year"
                  value={form.academic_year}
                  onChange={(event) => setForm({ ...form, academic_year: event.target.value })}
                >
                  <option value="">Select year</option>
                  {ACADEMIC_YEAR_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="City" htmlFor="city" error={errors.city}>
                <TextInput
                  id="city"
                  autoComplete="address-level2"
                  value={form.city}
                  onChange={(event) => setForm({ ...form, city: event.target.value })}
                  placeholder={config.location_context}
                />
              </Field>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit">Continue to college</Button>
            </div>
          </form>
        )}

        {currentStep === 2 && (
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              if (validateStep(2)) setStep(3);
            }}
            className="space-y-6"
          >
            <div>
              <h2 className="font-display text-xl font-semibold text-bone">Your college</h2>
              <p className="mt-2 text-sm leading-relaxed text-ash">
                You represent your institution in the college-level qualifying rounds, so your
                college must come from the onboarded list. If yours is missing, the organisers need
                to onboard it before you can register.
              </p>
            </div>

            <CollegeSelect
              colleges={colleges}
              value={form.college_id || null}
              onChange={(collegeId) => setForm({ ...form, college_id: collegeId ?? "" })}
              invalid={Boolean(errors.college_id)}
              describedBy="college-help"
            />
            <p id="college-help" className="text-xs text-ash">
              {errors.college_id ?? `${colleges.length} onboarded colleges available.`}
            </p>

            {selectedCollege?.description && (
              <p className="rounded-md border border-white/8 bg-white/[0.02] px-4 py-3 text-sm text-ash">
                {selectedCollege.description}
              </p>
            )}

            <div className="flex flex-wrap justify-between gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button type="submit">Review entry</Button>
            </div>
          </form>
        )}

        {currentStep === 3 && (
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              void handleSubmit();
            }}
            className="space-y-6"
          >
            <div>
              <h2 className="font-display text-xl font-semibold text-bone">Review your entry</h2>
              <p className="mt-2 text-sm text-ash">
                Check every line before you submit. You can still go back and edit.
              </p>
            </div>

            <dl className="divide-y divide-white/8 border-y border-white/8">
              <SummaryRow label="Tournament" value={config.name} />
              <SummaryRow label="Full name" value={form.full_name} />
              <SummaryRow label="Email" value={user?.email ?? form.email} />
              <SummaryRow label="Mobile" value={form.mobile} />
              <SummaryRow
                label="College"
                value={
                  selectedCollege
                    ? `${selectedCollege.name}${selectedCollege.location ? ` · ${selectedCollege.location}` : ""}`
                    : "—"
                }
              />
              <SummaryRow label="Course / branch" value={form.course || "—"} />
              <SummaryRow label="Academic year" value={form.academic_year || "—"} />
              <SummaryRow label="City" value={form.city || "—"} />
              <SummaryRow label="Participation" value={config.participation_type} />
            </dl>

            <div className="space-y-4">
              <Checkbox
                id="consent-participation"
                checked={consentParticipation}
                onChange={setConsentParticipation}
                label="I consent to participate in the tournament."
                description="Required — confirms you accept the tournament rules and the competition format."
              />
              <Checkbox
                id="consent-privacy"
                checked={consentPrivacy}
                onChange={setConsentPrivacy}
                label="I have read and agree to the privacy policy."
                description={
                  <>
                    Required — see the{" "}
                    <Link href="/privacy" className="arena-focus rounded text-flare-300 underline underline-offset-4">
                      privacy policy
                    </Link>
                    .
                  </>
                }
              />
              <Checkbox
                id="consent-marketing"
                checked={consentMarketing}
                onChange={setConsentMarketing}
                label="Send me tournament news and event updates. (Optional)"
                description="You can change this later from your dashboard."
              />
            </div>

            {serverError && <ErrorState message={serverError} />}

            <div className="flex flex-wrap justify-between gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setStep(2)} disabled={submitting}>
                Back
              </Button>
              <Button type="submit" loading={submitting} size="lg">
                {submitting ? "Submitting entry…" : "Submit registration"}
              </Button>
            </div>

            <p className="text-xs leading-relaxed text-ash/80">
              Submitting records your entry — it does not by itself confirm a tournament slot. Your
              dashboard always shows the current status of your own registration.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[11rem_1fr] sm:items-baseline sm:gap-6">
      <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-ash">{label}</dt>
      <dd className="text-sm text-bone">{value || "—"}</dd>
    </div>
  );
}
