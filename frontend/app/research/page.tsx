import type { Metadata } from "next";

import { Reveal } from "@/components/Reveal";
import { Button, DataCard, SectionLabel, SectionStatement } from "@/components/ui";
import { EVIDENCE, HOW_IT_WORKS } from "@/lib/content";
import { PRODUCT_NAME, SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "Five steps, in the order a careful investor asks them: the business, the numbers, what changed, the risks, and your own decision.",
  openGraph: {
    title: `How it works · ${SITE_NAME}`,
    description: SITE_DESCRIPTION,
  },
};

/** How it works: one sentence and one visual per step. */
export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-shell px-5 pb-20 pt-14 sm:px-6 sm:pt-20">
      <Reveal>
        <div className="max-w-3xl">
          <SectionLabel tone="brand">{HOW_IT_WORKS.eyebrow}</SectionLabel>
          <SectionStatement
            id="how-it-works-heading"
            as="h2"
            size="lg"
            lines={HOW_IT_WORKS.headline}
            className="mt-5"
          />
          <p className="mt-6 text-lg leading-relaxed text-paper-dim">{HOW_IT_WORKS.support}</p>
        </div>
      </Reveal>

      <ol className="mt-16 border-t border-line">
        {HOW_IT_WORKS.steps.map((step, index) => (
          <Reveal as="li" key={step.n} delay={index * 90}>
            <div className="grid gap-4 border-b border-line py-8 sm:grid-cols-[auto_minmax(0,320px)_1fr] sm:items-baseline sm:gap-8">
              <span className="font-mono text-xs text-brand-400">{step.n}</span>
              <h2 className="font-display text-xl font-semibold tracking-tight text-paper sm:text-2xl">
                {step.title}
              </h2>
              <div className="flex items-center gap-4">
                <p className="max-w-md text-base leading-relaxed text-paper-dim">{step.body}</p>
                {/* Per-step precision marker: the line that connects to the next step */}
                <span aria-hidden="true" className="hidden h-px flex-1 bg-line lg:block" />
              </div>
            </div>
          </Reveal>
        ))}
      </ol>

      <Reveal>
        <section className="mt-20">
          <SectionLabel tone="brand">{EVIDENCE.label}</SectionLabel>
          <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight text-paper sm:text-3xl">
            {EVIDENCE.statement.join(" ")}
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {EVIDENCE.chain.map((node, index) => (
              <Reveal key={node.label} delay={index * 90}>
                <DataCard label={node.label} value={node.value} detail={node.detail} />
              </Reveal>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <div className="mt-16 flex flex-col gap-3 border-t border-line pt-10 sm:flex-row">
          <Button href="/waitlist">Join the waitlist</Button>
          <Button href="/product" variant="outline">
            See the product
          </Button>
        </div>
        <p className="mt-6 max-w-xl text-sm leading-relaxed text-paper-mute">
          {PRODUCT_NAME} explains financial information. It does not provide investment advice and
          does not make decisions for anyone.
        </p>
      </Reveal>
    </div>
  );
}
