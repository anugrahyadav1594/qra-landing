import { QRAProcessDiagram } from "@/components/motion/QRAProcessDiagram";
import { QRAAtmosphere } from "@/components/motion/QRAAtmosphere";
import { QRASectionTransition } from "@/components/motion/QRASectionTransition";
import { QRAReveal } from "@/components/motion/QRAReveal";
import { TextReveal } from "@/components/motion/TextReveal";
import { Button, Section, SectionLabel } from "@/components/ui";
import { IDEA } from "@/lib/content";

/**
 * The idea. The three moves are one continuous diagram rather than three cards,
 * so the section argues for a process instead of listing features.
 */
export function IdeaSection() {
  return (
    <Section id="how-it-works" labelledBy="idea-heading" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-line to-transparent"
      />

      <QRASectionTransition label="Organized" />

      {/* No section-level film here: the band below shows it properly, and the
          same film twice would be two decoders for one picture. */}
      <div aria-hidden="true" className="idea-ground" />

      <div className="relative z-10">
        <QRAReveal>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <SectionLabel tone="brand">{IDEA.label}</SectionLabel>
              <h2
                id="idea-heading"
                className="mt-5 font-display text-[2.1rem] font-semibold leading-[1.08] tracking-tightest text-paper sm:text-5xl sm:leading-[1.05] lg:text-[3.4rem]"
              >
                {IDEA.statement.map((line, index) => (
                  <span key={line} className="block">
                    <TextReveal text={line} step={80} />
                    {index < IDEA.statement.length - 1 ? " " : null}
                  </span>
                ))}
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-paper-mute lg:text-right">
              Three moves. No jargon, no dashboards to learn.
            </p>
          </div>
        </QRAReveal>

        {/* A window onto the film, at full width: information arriving without
            order on the left, leaving in rows on the right. */}
        <QRAReveal delay={100} variant="scale" className="mt-14">
          <div className="flow-band">
            <QRAAtmosphere variant="idea" drift={false} opacity={0.95} className="flow-band__film" />
            <div aria-hidden="true" className="flow-band__labels">
              <span>Scattered</span>
              <span>Aligned</span>
              <span>Structured</span>
            </div>
          </div>
        </QRAReveal>

        <QRAProcessDiagram />

        <QRAReveal delay={80}>
          <div className="mt-14 flex flex-col gap-6 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-display text-xl font-semibold tracking-tight text-paper sm:text-2xl">
              {IDEA.closing}
            </p>
            <Button href="/research" variant="outline" className="btn-lift">
              See the full process
              <span aria-hidden="true" className="btn-arrow">
                →
              </span>
            </Button>
          </div>
        </QRAReveal>
      </div>
    </Section>
  );
}
