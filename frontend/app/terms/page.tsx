import type { Metadata } from "next";
import Link from "next/link";

import { SectionLabel } from "@/components/ui";
import { COMPANY_NAME, PRODUCT_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of service",
  description: `Terms that govern use of the ${COMPANY_NAME} website.`,
};

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "Using this website",
    body: (
      <>
        The website and its products are provided as-is and pre-launch. Joining a waitlist does not
        guarantee access to any product. {PRODUCT_NAME} explains financial information \u2014 it does
        not provide investment advice and does not tell anyone what to buy or sell.
      </>
    ),
  },
  {
    title: "Your content",
    body: (
      <>
        Feedback, contact messages and applications are submitted voluntarily. You grant us a limited
        license to use them for the purpose they were submitted for (support, product improvement,
        recruitment).
      </>
    ),
  },
  {
    title: "Acceptable use",
    body: (
      <>
        Do not abuse the forms: no automated submissions, no scraping, no attempts to bypass rate
        limits or bot checks. We rate-limit and screen submissions and may block abusive traffic.
      </>
    ),
  },
  {
    title: "Service changes",
    body: (
      <>
        We may change, pause or discontinue the website or any product at any time. Pre-launch
        details \u2014 features, timelines, availability \u2014 are indicative and may change.
      </>
    ),
  },
  {
    title: "Liability",
    body: (
      <>
        To the maximum extent permitted by law, the website is provided without warranties, and our
        liability is limited to the fullest extent applicable law allows.
      </>
    ),
  },
  {
    title: "Governing law",
    body: <>These terms are governed by the laws of India.</>,
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-shell px-5 pb-20 pt-14 sm:px-6 sm:pt-20">
      <div className="max-w-3xl">
        <SectionLabel tone="brand">Legal</SectionLabel>
        <h1 className="mt-5 font-display text-[2.2rem] font-semibold leading-[1.06] tracking-tightest text-paper sm:text-5xl">
          Terms of service
        </h1>

        <p className="mt-6 rounded-md border border-amber/30 bg-amber/[0.08] p-4 text-sm leading-relaxed text-paper-dim">
          <strong className="font-semibold text-paper">Placeholder text.</strong> Final terms are
          pending legal review before launch.
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

        <p className="mt-10 text-sm text-paper-faint">
          Questions about these terms?{" "}
          <Link href="/contact" className="text-brand-300 underline decoration-brand-500/40 underline-offset-2">
            Contact us
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
