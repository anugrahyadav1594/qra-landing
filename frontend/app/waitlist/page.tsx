import type { Metadata } from "next";

import { WaitlistForm } from "@/components/WaitlistForm";
import { SectionLabel, SectionStatement } from "@/components/ui";
import { COMPANY_NAME, PRODUCT_NAME, SITE_NAME } from "@/lib/constants";
import { WAITLIST_PAGE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Join the waitlist",
  description:
    "Join the waitlist for QRA — Quantrelic Analytics' product that makes financial information easier to understand. Early access opens in cohorts.",
  openGraph: {
    title: `Join the waitlist · ${SITE_NAME}`,
    description: "We\u2019re building QRA now. We\u2019ll email you when early access opens.",
  },
};

export default function WaitlistPage() {
  return (
    <div className="mx-auto max-w-shell px-5 pb-20 pt-14 sm:px-6 sm:pt-20">
      <div className="grid gap-12 lg:grid-cols-[1fr_minmax(0,520px)] lg:gap-20">
        <div>
          <SectionLabel tone="brand">{WAITLIST_PAGE.eyebrow}</SectionLabel>
          <SectionStatement
            id="waitlist-heading"
            as="h2"
            size="lg"
            lines={[WAITLIST_PAGE.headline]}
            className="mt-5"
          />
          <p className="mt-6 text-lg leading-relaxed text-paper-dim">{WAITLIST_PAGE.support}</p>
          <ul className="mt-8 space-y-3 text-sm text-paper-mute">
            <li>One email per person \u2014 duplicates are ignored.</li>
            <li>Waitlist updates only; marketing needs a separate opt-in.</li>
            <li>Ask us to remove your details at any time.</li>
          </ul>
          <p className="mt-8 text-xs leading-relaxed text-paper-faint">
            {PRODUCT_NAME} explains financial information; you decide what to do with it.
            {" "}{COMPANY_NAME}.
          </p>
        </div>

        <div className="rounded-xl border border-line bg-ink-850/80 p-6 shadow-panel sm:p-7">
          <WaitlistForm />
        </div>
      </div>
    </div>
  );
}
