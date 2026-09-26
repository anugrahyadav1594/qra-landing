import type { Metadata } from "next";
import Link from "next/link";

import { COMPANY_NAME, SECURITY_CONTACT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Security",
  description: `Security practices at ${COMPANY_NAME}, and how to report a vulnerability responsibly.`,
};

const PRACTICES = [
  "Rate limits and bot checks on every public form; spam screened with honeypots and timing checks.",
  "UUIDv7 identifiers everywhere — never sequential, so records can't be enumerated.",
  "IP addresses hashed at rest; uploads restricted to PDF and size-capped.",
  "Security headers (CSP, HSTS, nosniff) in production; audit logs for sensitive actions.",
  "Backups with periodic restore drills before launch.",
];

export default function SecurityPage() {
  return (
    <div className="mx-auto max-w-shell px-5 py-14 sm:px-6 sm:py-20">
      <div className="max-w-3xl">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-accent">Trust</p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-tightest text-ink sm:text-5xl">
          Security
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">
          We treat security as an engineering property — controls live in the code, not in a slide
          deck.
        </p>

        <ul className="mt-10 border-t border-ink/15">
          {PRACTICES.map((practice) => (
            <li key={practice} className="border-b border-ink/10 py-4 text-base leading-relaxed text-ink-700">
              {practice}
            </li>
          ))}
        </ul>

        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
            Responsible disclosure
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Found a vulnerability?{" "}
            {SECURITY_CONTACT_EMAIL ? (
              <>
                Email{" "}
                <a
                  href={`mailto:${SECURITY_CONTACT_EMAIL}`}
                  className="text-accent underline decoration-accent/40 underline-offset-2"
                >
                  {SECURITY_CONTACT_EMAIL}
                </a>
                , or use our{" "}
                <Link
                  href="/feedback"
                  className="text-accent underline decoration-accent/40 underline-offset-2"
                >
                  feedback form
                </Link>{" "}
                and choose the Security topic.
              </>
            ) : (
              <>
                use our{" "}
                <Link
                  href="/feedback"
                  className="text-accent underline decoration-accent/40 underline-offset-2"
                >
                  feedback form
                </Link>{" "}
                and choose the Security topic — it reaches the same place.
              </>
            )}{" "}
            Please give us a reasonable window before public disclosure.
          </p>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Machine-readable policy:{" "}
            <a
              href="/security.txt"
              className="text-accent underline decoration-accent/40 underline-offset-2"
            >
              security.txt
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
