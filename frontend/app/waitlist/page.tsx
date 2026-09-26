import type { Metadata } from "next";

import { WaitlistForm } from "@/components/WaitlistForm";
import { COMPANY_NAME, PRODUCT_NAME, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Join the waitlist",
  description:
    "Join the waitlist for QRA — Quantrelic Analytics' product that makes financial information easier to understand. Early access opens in cohorts.",
  openGraph: {
    title: `Join the waitlist · ${SITE_NAME}`,
    description:
      "Be among the first to experience a simpler way to understand investing.",
  },
};

export default function WaitlistPage() {
  return (
    <div className="mx-auto max-w-shell px-5 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto grid max-w-4xl gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-accent">
            Early access
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-tightest text-ink sm:text-5xl">
            Be among the first to experience a simpler way to understand investing.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            {PRODUCT_NAME} is in early development. Join the waitlist and we&rsquo;ll email you when
            early access opens.
          </p>
          <ul className="mt-8 space-y-3 text-base text-muted">
            {[
              "One email per person — duplicates are ignored.",
              "Waitlist updates only; marketing needs a separate opt-in.",
              "You can ask us to remove your details at any time.",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span aria-hidden="true" className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-positive" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm leading-relaxed text-muted">
            {PRODUCT_NAME} does not provide investment advice. It explains financial information;
            you decide what to do with it. {COMPANY_NAME}.
          </p>
        </div>

        <div className="rounded-lg border border-ink/10 bg-white p-6 shadow-card sm:p-8">
          <WaitlistForm />
        </div>
      </div>
    </div>
  );
}
