import type { Metadata } from "next";
import Link from "next/link";

import { SectionLabel } from "@/components/ui";
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
        IP addresses are stored in hashed form for abuse prevention, never raw.
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
          <li>Withdraw any consent at any time \u2014 it takes effect immediately.</li>
          <li>Request a copy of everything we hold about you.</li>
          <li>Request deletion \u2014 with a reversible 30-day cooling-off window.</li>
        </ul>
        <p className="mt-3">
          To make a data request,{" "}
          {CONTACT_GENERAL_EMAIL ? (
            <>
              email{" "}
              <a href={`mailto:${CONTACT_GENERAL_EMAIL}`} className="text-brand-300 underline decoration-brand-500/40 underline-offset-2">
                {CONTACT_GENERAL_EMAIL}
              </a>
              .
            </>
          ) : (
            <>
              use our{" "}
              <Link href="/contact" className="text-brand-300 underline decoration-brand-500/40 underline-offset-2">
                contact form
              </Link>{" "}
              and start your message with \u201cdata request\u201d.
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
        Processors (hosting, email delivery) are bound by data-processing agreements and listed in
        the final policy.
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
    <div className="mx-auto max-w-shell px-5 pb-20 pt-14 sm:px-6 sm:pt-20">
      <div className="max-w-3xl">
        <SectionLabel tone="brand">Legal</SectionLabel>
        <h1 className="mt-5 font-display text-[2.2rem] font-semibold leading-[1.06] tracking-tightest text-paper sm:text-5xl">
          Privacy policy
        </h1>

        <p className="mt-6 rounded-md border border-amber/30 bg-amber/[0.08] p-4 text-sm leading-relaxed text-paper-dim">
          <strong className="font-semibold text-paper">Placeholder text.</strong> Final policy
          language is pending legal review before launch.
        </p>

        <div className="mt-10 space-y-8">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="font-display text-lg font-semibold tracking-tight text-paper">
                {section.title}
              </h2>
              <div className="mt-2 text-base leading-relaxed text-paper-dim">{section.body}</div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
