import type { Metadata } from "next";

import { Reveal } from "@/components/Reveal";
import { Button, SectionLabel, SectionStatement } from "@/components/ui";
import { ABOUT } from "@/lib/content";
import { COMPANY_NAME, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description:
    "Quantrelic Analytics Private Limited is building technology that makes financial information easier to understand and investing simpler for everyday investors.",
  openGraph: {
    title: `About · ${SITE_NAME}`,
    description:
      "Quantrelic Analytics Private Limited is building technology that makes financial information easier to understand.",
  },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-shell px-5 pb-20 pt-14 sm:px-6 sm:pt-20">
      <Reveal>
        <div className="max-w-3xl">
          <SectionLabel tone="brand">{ABOUT.eyebrow}</SectionLabel>
          <SectionStatement id="about-heading" as="h2" lines={ABOUT.headline} className="mt-5" />
        </div>
      </Reveal>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1.1fr_minmax(0,420px)] lg:gap-16">
        <Reveal>
          <div className="max-w-2xl space-y-6 text-lg leading-relaxed text-paper-dim">
            {ABOUT.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <ul className="mt-12 grid gap-8 sm:grid-cols-3">
            {ABOUT.principles.map((principle, index) => (
              <Reveal as="li" key={principle.title} delay={index * 90}>
                <div className="border-t border-line pt-5">
                  <h2 className="font-display text-base font-semibold tracking-tight text-paper">
                    {principle.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-paper-mute">{principle.body}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={120} variant="scale">
          <div className="rounded-xl border border-line bg-ink-850/80 p-6 shadow-panel sm:p-7">
            <dl className="divide-y divide-line-faint">
              {ABOUT.facts.map((fact) => (
                <div key={fact.label} className="flex items-baseline justify-between gap-4 py-3">
                  <dt className="micro !tracking-[0.16em]">{fact.label}</dt>
                  <dd className="text-sm text-paper">{fact.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-xs leading-relaxed text-paper-faint">
              QRA is in early development. We are pre-launch, so there are no customers, results or
              partnerships to report yet — when there is something true to say, it will appear here.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Button href="/waitlist">Join the waitlist</Button>
              <Button href="/careers" variant="outline">
                We’re hiring
              </Button>
            </div>
          </div>
        </Reveal>
      </div>

      <p className="mt-16 border-t border-line pt-8 text-sm text-paper-faint">{COMPANY_NAME}</p>
    </div>
  );
}
