import type { Metadata } from "next";
import Link from "next/link";

import { SectionLabel } from "@/components/ui";
import { COMPANY_NAME, SECURITY_CONTACT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Security",
  description: `Security practices at ${COMPANY_NAME}, and how to report a vulnerability responsibly.`,
};

const PRACTICES = [
  "Rate limits and bot checks on every public form; spam screened with honeypots and timing checks.",
  "UUIDv7 identifiers everywhere \u2014 never sequential, so records can\u2019t be enumerated.",
  "IP addresses hashed at rest; uploads restricted to PDF and size-capped.",
  "Security headers (CSP, HSTS, nosniff) in production; audit logs for sensitive actions.",
  "Backups with periodic restore drills before launch.",
];

export default function SecurityPage() {
  return (
    <div className="mx-auto max-w-shell px-5 pb-20 pt-14 sm:px-6 sm:pt-20">
      <div className="max-w-3xl">
        <SectionLabel tone="brand">Trust</SectionLabel>
        <h1 className="mt-5 font-display text-[2.2rem] font-semibold leading-[1.06] tracking-tightest text-paper sm:text-5xl">
          Security
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-paper-dim">
          Security as an engineering property \u2014 controls in the code, not in a slide deck.
        </p>

        <ul className="mt-10 border-t border-line">
          {PRACTICES.map((practice) => (
            <li key={practice} className="border-b border-line py-4 text-base leading-relaxed text-paper-dim">
              {practice}
            </li>
          ))}
        </ul>

        <section className="mt-12">
          <h2 className="font-display text-lg font-semibold tracking-tight text-paper">
            Responsible disclosure
          </h2>
          <p className="mt-3 text-base leading-relaxed text-paper-dim">
            Found a vulnerability?{" "}
            {SECURITY_CONTACT_EMAIL ? (
              <>
                Email{" "}
                <a href={`mailto:${SECURITY_CONTACT_EMAIL}`} className="text-brand-300 underline decoration-brand-500/40 underline-offset-2">
                  {SECURITY_CONTACT_EMAIL}
                </a>
                , or use our{" "}
                <Link href="/feedback" className="text-brand-300 underline decoration-brand-500/40 underline-offset-2">
                  feedback form
                </Link>{" "}
                and choose the Security topic.
              </>
            ) : (
              <>
                Use our{" "}
                <Link href="/feedback" className="text-brand-300 underline decoration-brand-500/40 underline-offset-2">
                  feedback form
                </Link>{" "}
                and choose the Security topic \u2014 it reaches the same place.
              </>
            )}{" "}
            Please give us a reasonable window before public disclosure.
          </p>
          <p className="mt-3 text-base leading-relaxed text-paper-dim">
            Machine-readable policy:{" "}
            <a href="/security.txt" className="text-brand-300 underline decoration-brand-500/40 underline-offset-2">
              security.txt
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
