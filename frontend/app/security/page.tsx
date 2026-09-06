import type { Metadata } from "next";

import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Security",
  description: "Quantrelic Analytics' security posture and disclosure policy.",
};

const PRACTICES = [
  "No passwords at launch — authentication uses email/phone one-time codes and Google sign-in, handled by a hardened provider.",
  "Rate limits and bot checks on every public form; spam screened with honeypots and timing checks.",
  "UUIDv7 identifiers everywhere — never sequential, so records can't be enumerated.",
  "IP addresses hashed at rest; uploads restricted to PDF and size-capped.",
  "Security headers (CSP, HSTS, nosniff) in production; audit logs for sensitive actions.",
  "Backups with periodic restore drills before launch.",
];

export default function SecurityPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <Reveal>
        <SectionHeading
          eyebrow="Trust"
          title="Security"
          description="We treat security as an engineering property — controls are in the code, not in a slide deck."
        />
        <div className="mx-auto max-w-3xl space-y-8 rounded-3xl border border-white/5 bg-ink-900/60 p-8">
          <ul className="space-y-3 text-sm leading-relaxed text-paper-dim/85">
            {PRACTICES.map((item) => (
              <li key={item} className="flex gap-3">
                <span aria-hidden="true" className="mt-0.5 text-aqua-300">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <div>
            <h2 className="text-base font-semibold text-paper">Responsible disclosure</h2>
            <p className="mt-2 text-sm leading-relaxed text-paper-dim/85">
              Found a vulnerability? Email{" "}
              <span className="font-mono text-signal-300">security@company.com</span> (placeholder).
              Please give us a reasonable window before public disclosure. We respond
              within 5 working days, and we credit researchers in our changelog.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-paper-dim/85">
              Machine-readable policy:{" "}
              <a href="/security.txt" className="underline decoration-signal-400/40 underline-offset-2 hover:text-signal-300">
                security.txt
              </a>
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
