import { ProductPreview } from "@/components/ProductPreview";
import { QRAReveal } from "@/components/motion/QRAReveal";
import { QRAAtmosphere } from "@/components/motion/QRAAtmosphere";
import { QRASectionTransition } from "@/components/motion/QRASectionTransition";
import { Button, Section, SectionLabel, SectionStatement } from "@/components/ui";
import { PRODUCT, RESEARCH_LAB } from "@/lib/content";

/**
 * RESEARCH LAB — the analysis layer underneath the game.
 *
 * The fundamentals interface is unchanged, and deliberately so: it is the part
 * of QRA that already existed and it is good. What changed is its position in
 * the story. It is no longer the product; it is where a player goes when the
 * chart is not enough — the intelligence layer the practice sits on top of.
 *
 * So the section leads with that relationship, then hands the screen to the
 * interface and lets it be the subject.
 */
export function ResearchLabSection() {
  return (
    <Section
      id="research-lab"
      tone="raised"
      labelledBy="research-lab-heading"
      className="relative overflow-hidden"
    >
      <QRASectionTransition label="Go deeper" />

      {/* Barely there: the interface is the brightest thing on screen. */}
      <QRAAtmosphere variant="about" />

      <div className="relative z-10">
        <QRAReveal>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <SectionLabel tone="brand">{RESEARCH_LAB.label}</SectionLabel>
              <SectionStatement
                id="research-lab-heading"
                lines={RESEARCH_LAB.statement}
                as="h2"
                className="mt-5"
              />
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-paper-mute lg:text-right">
              {RESEARCH_LAB.support}
            </p>
          </div>
        </QRAReveal>

        {/* The interface, with the room to be the subject: a wider gap above it
            than below, so the hierarchy reads statement → interface → next. */}
        <QRAReveal delay={120} variant="scale" className="mt-16 lg:mt-20">
          <ProductPreview />
        </QRAReveal>

        <QRAReveal delay={80}>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center lg:mt-12">
            <Button href="/product" variant="outline" className="btn-lift">
              Open the research lab
              <span aria-hidden="true" className="btn-arrow">
                →
              </span>
            </Button>
            <p className="text-sm text-paper-mute">
              {PRODUCT.statement[0]} {PRODUCT.statement[1]}
            </p>
          </div>
        </QRAReveal>
      </div>
    </Section>
  );
}
