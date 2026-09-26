import type { Metadata } from "next";
import Link from "next/link";

import { FeedbackForm } from "@/components/FeedbackForm";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Feedback",
  description:
    "Tell us what's broken, what's missing, or what you'd like to see — every message is read by a person at Quantrelic Analytics.",
  openGraph: {
    title: `Feedback · ${SITE_NAME}`,
    description: "Tell us what's broken, what's missing, or what you'd like to see.",
  },
};

export default function FeedbackPage() {
  return (
    <div className="mx-auto max-w-shell px-5 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto grid max-w-4xl gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-accent">
            Feedback
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-tightest text-ink sm:text-5xl">
            Help us make it better.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            Every submission lands in a queue that a human reads. Bugs, ideas, and anything that
            didn&rsquo;t make sense are all welcome.
          </p>
          <p className="mt-6 text-base leading-relaxed text-muted">
            Reporting a security issue? Choose the{" "}
            <span className="font-medium text-ink-800">Security</span> topic, and see our{" "}
            <Link
              href="/security"
              className="text-accent underline decoration-accent/40 underline-offset-2 hover:text-accent-700"
            >
              disclosure policy
            </Link>{" "}
            for what to include.
          </p>
        </div>

        <div className="rounded-lg border border-ink/10 bg-white p-6 shadow-card sm:p-8">
          <FeedbackForm mode="feedback" defaultPageSlug="/feedback" />
        </div>
      </div>
    </div>
  );
}
