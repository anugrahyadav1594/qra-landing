import type { Metadata } from "next";
import Link from "next/link";

import { FeedbackForm } from "@/components/FeedbackForm";
import { SectionLabel } from "@/components/ui";
import { SITE_NAME } from "@/lib/constants";
import { FEEDBACK_COPY } from "@/lib/content";

export const metadata: Metadata = {
  title: "Feedback",
  description:
    "Tell us what\u2019s broken, what\u2019s missing, or what you\u2019d like to see \u2014 a human reads every message.",
  openGraph: {
    title: `Feedback \u00b7 ${SITE_NAME}`,
    description: "Tell us what\u2019s broken, what\u2019s missing, or what you\u2019d like to see.",
  },
};

export default function FeedbackPage() {
  return (
    <div className="mx-auto max-w-shell px-5 pb-20 pt-14 sm:px-6 sm:pt-20">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
        <div>
          <SectionLabel tone="brand">{FEEDBACK_COPY.eyebrow}</SectionLabel>
          <h1 className="mt-5 font-display text-[2.2rem] font-semibold leading-[1.06] tracking-tightest text-paper sm:text-5xl">
            {FEEDBACK_COPY.headline}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-paper-dim">{FEEDBACK_COPY.support}</p>
          <p className="mt-6 text-sm leading-relaxed text-paper-mute">
            Reporting a security issue? Choose the Security topic and see our{" "}
            <Link href="/security" className="text-brand-300 underline decoration-brand-500/40 underline-offset-2">
              disclosure policy
            </Link>{" "}
            for what to include.
          </p>
        </div>

        <div className="rounded-xl border border-line bg-ink-850/80 p-6 shadow-panel sm:p-8">
          <FeedbackForm mode="feedback" defaultPageSlug="/feedback" />
        </div>
      </div>
    </div>
  );
}
