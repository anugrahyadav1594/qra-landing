import type { Metadata } from "next";
import Link from "next/link";

import { COMPANY_NAME, CONTACT_GENERAL_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `How ${COMPANY_NAME} handles personal data on this website.`,
};

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "What we collect",
    body: (
      <>
        On this website we collect only what forms ask for: your email address for the waitlist,
        feedback and contact messages, and application details (including your resume) for careers.
        We store IP addresses in hashed form for abuse prevention, never raw.
      </>
    ),
  },
  {
    title: "Why, and on what basis",
    body: (
      <>
        Waitlist entries are used solely to contact you about early access to QRA. Feedback is used
        to improve the site and the product. Applications are used for recruitment. Every purpose
        requires a separate, explicit consent, recorded with the policy version you saw.
      </>
    ),
  },
  {
    title: "Your choices",
    body: (
      <>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li>Withdraw any consent at any time — it takes effect immediately.</li>
          <li>Request a copy of everything we hold about you.</li>
          <li>Request deletion — with a reversible 30-day cooling-off window.</li>
        </ul>
        <p className="mt-3">
          To make a data request,{" "}
          {CONTACT_GENERAL_EMAIL ? (
            <>
              email{" "}
              <a
                href={`mailto:${CONTACT_GENERAL_EMAIL}`}
                className="text-accent underline decoration-accent/40 underline-offset-2"
              >
                {CONTACT_GENERAL_EMAIL}
              </a>
              .
            </>
          ) : (
            <>
              use our{" "}
              <Link
                href="/contact"
                className="text-accent underline decoration-accent/40 underline-offset-2"
              >
                contact form
              </Link>{" "}
              and start your message with &ldquo;data request&rdquo;.
            </>
          )}
        </p>
      </>
    ),
  },
  {
    title: "Sharing",
    body: (
      <>
        We never sell or rent personal data, and we never use it for advertising profiling.
        Processors (hosting, email delivery, analytics) are bound by data-processing agreements and
        listed in the final policy.
      </>
    ),
  },
  {
    title: "Retention",
    body: (
      <>
        Waitlist and feedback data: up to 24 months, then purged. Applications: retained for
        recruitment audit, anonymized on account deletion. Backups age out automatically.
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-shell px-5 py-14 sm:px-6 sm:py-20">
      <div className="max-w-3xl">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-accent">Legal</p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-tightest text-ink sm:text-5xl">
          Privacy policy
        </h1>

        <p className="mt-6 rounded-md border border-caution/25 bg-caution-50 p-4 text-sm leading-relaxed text-ink-800">
          <strong className="font-semibold">Placeholder text.</strong> Final policy language is
          pending legal review before launch.
        </p>

        <div className="mt-10 space-y-8">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
                {section.title}
              </h2>
              <div className="mt-2 text-base leading-relaxed text-muted">{section.body}</div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
