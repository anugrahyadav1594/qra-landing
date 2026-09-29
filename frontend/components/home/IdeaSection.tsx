import { ProcessDiagram } from "@/components/ProcessDiagram";
import { Reveal } from "@/components/Reveal";
import { TextReveal } from "@/components/TextReveal";
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

      <div className="relative">
        <Reveal>
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
        </Reveal>

        <ProcessDiagram />

        <Reveal delay={80}>
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
        </Reveal>
      </div>
    </Section>
  );
}
