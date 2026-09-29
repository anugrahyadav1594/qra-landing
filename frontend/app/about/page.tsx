import type { Metadata } from "next";

import { socialMetadata } from "@/lib/seo";

import { QRADataField } from "@/components/motion/QRADataField";
import { QRAAtmosphere } from "@/components/motion/QRAAtmosphere";
import { QRAReveal } from "@/components/motion/QRAReveal";
import { Button, SectionLabel, SectionStatement } from "@/components/ui";
import { ABOUT } from "@/lib/content";
import { COMPANY_NAME, SITE_NAME, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description:
    "Quantrelic Analytics Private Limited is building technology that makes financial information easier to understand and investing simpler for everyday investors.",
  ...socialMetadata({
    title: `About · ${SITE_NAME}`,
    description: "Quantrelic Analytics Private Limited is building technology that makes financial information easier to understand.",
    url: `${SITE_URL}/about`,
  }),
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-shell px-5 pb-20 pt-14 sm:px-6 sm:pt-20">
      <QRAReveal>
        <div className="max-w-3xl">
          <SectionLabel tone="brand">{ABOUT.eyebrow}</SectionLabel>
          <SectionStatement id="about-heading" as="h2" lines={ABOUT.headline} className="mt-5" />
        </div>
      </QRAReveal>

      <QRAReveal variant="scale" className="mt-10">
        {/* The Quantrelic architecture: vertical spines, horizontal pathways and
            nodes, constructing itself. No photograph — the same visual system
            as every other section, in its most structural pose. */}
        <div className="relative h-[220px] overflow-hidden rounded-xl border border-line sm:h-[280px] lg:h-[320px]">
          <QRAAtmosphere variant="about" className="rounded-xl" />
          <QRADataField
            variant="structure"
            density={1.3}
            intensity={0.9}
            autoPlay
            className="opacity-90"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-ink-950/60"
          />
          <p className="micro absolute bottom-4 left-4 !tracking-[0.2em]">
            Infrastructure for understanding
          </p>
        </div>
      </QRAReveal>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1.1fr_minmax(0,420px)] lg:gap-16">
        <QRAReveal>
          <div className="max-w-2xl space-y-6 text-lg leading-relaxed text-paper-dim">
            {ABOUT.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <ul className="mt-12 grid gap-8 sm:grid-cols-3">
            {ABOUT.principles.map((principle, index) => (
              <QRAReveal as="li" key={principle.title} delay={index * 90}>
                <div className="border-t border-line pt-5">
                  <h2 className="font-display text-base font-semibold tracking-tight text-paper">
                    {principle.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-paper-mute">{principle.body}</p>
                </div>
              </QRAReveal>
            ))}
          </ul>
        </QRAReveal>

        <QRAReveal delay={120} variant="scale">
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
        </QRAReveal>
      </div>

      <p className="mt-16 border-t border-line pt-8 text-sm text-paper-faint">{COMPANY_NAME}</p>
    </div>
  );
}
