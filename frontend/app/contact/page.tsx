import type { Metadata } from "next";
import Link from "next/link";

import { FeedbackForm } from "@/components/FeedbackForm";
import { COMPANY_NAME, CONTACT_GENERAL_EMAIL, SECURITY_CONTACT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Quantrelic Analytics — product questions, working with us, careers, or anything else. Use the form and we'll get back to you.",
  openGraph: {
    title: "Contact · Quantrelic Analytics",
    description:
      "Product questions, working with us, or something else — use the form and we'll get back to you.",
  },
};

const HELP_TOPICS = [
  "Have a product question?",
  "Want to work with us?",
  "Interested in joining the team?",
];

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-contact px-5 py-14 sm:px-6 sm:py-20">
      <header className="max-w-2xl">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-accent">Contact</p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-tightest text-ink sm:text-5xl">
          Let&rsquo;s talk.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">
          Whether you&rsquo;re curious about Quantrelic, interested in working with us, or simply
          want to ask a question — we&rsquo;d like to hear from you.
        </p>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,35fr)_minmax(0,65fr)] lg:gap-16">
        {/* ── Information ──────────────────────────────────────────── */}
        <div className="lg:pt-1">
          <ul className="space-y-3 text-base leading-relaxed text-ink-800">
            {HELP_TOPICS.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>

          <p className="mt-6 text-base leading-relaxed text-muted">
            Use the form and we&rsquo;ll get back to you. A person at {COMPANY_NAME} reads every
            message — usually within two working days.
          </p>

          {(CONTACT_GENERAL_EMAIL || SECURITY_CONTACT_EMAIL) && (
            <dl className="mt-8 space-y-4 border-t border-ink/10 pt-6 text-sm">
              {CONTACT_GENERAL_EMAIL && (
                <div>
                  <dt className="text-muted">General enquiries</dt>
                  <dd className="mt-1 font-medium text-ink">
                    <a
                      href={`mailto:${CONTACT_GENERAL_EMAIL}`}
                      className="break-words underline decoration-accent/40 underline-offset-2 hover:text-accent-700"
                    >
                      {CONTACT_GENERAL_EMAIL}
                    </a>
                  </dd>
                </div>
              )}
              {SECURITY_CONTACT_EMAIL && (
                <div>
                  <dt className="text-muted">Security reports</dt>
                  <dd className="mt-1 font-medium text-ink">
                    <a
                      href={`mailto:${SECURITY_CONTACT_EMAIL}`}
                      className="break-words underline decoration-accent/40 underline-offset-2 hover:text-accent-700"
                    >
                      {SECURITY_CONTACT_EMAIL}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          )}

          <div className="mt-8 border-t border-ink/10 pt-6">
            <p className="text-sm font-medium text-ink-700">Other ways to reach us</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/feedback" className="text-accent underline decoration-accent/40 underline-offset-2 hover:text-accent-700">
                  Send feedback on this site or the product
                </Link>
              </li>
              <li>
                <Link href="/security" className="text-accent underline decoration-accent/40 underline-offset-2 hover:text-accent-700">
                  Responsible disclosure policy
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-accent underline decoration-accent/40 underline-offset-2 hover:text-accent-700">
                  Open roles
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Form ─────────────────────────────────────────────────── */}
        <div className="rounded-lg border border-ink/10 bg-white p-6 shadow-card sm:p-8">
          <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
            Send us a message
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Name, email and topic help us route your message to the right person.
          </p>
          <div className="mt-6">
            <FeedbackForm mode="contact" defaultPageSlug="/contact" />
          </div>
        </div>
      </div>
    </div>
  );
}
