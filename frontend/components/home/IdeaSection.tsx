import { Reveal } from "@/components/Reveal";
import { Button, Section, SectionLabel, SectionStatement } from "@/components/ui";
import { IDEA } from "@/lib/content";

/**
 * The idea in three moves. One precision line runs over the three steps to
 * show they are a single process, not three features.
 */
export function IdeaSection() {
  return (
    <Section id="how-it-works" labelledBy="idea-heading">
      <Reveal>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <SectionLabel tone="brand">{IDEA.label}</SectionLabel>
            <SectionStatement
              id="idea-heading"
              lines={IDEA.statement}
              as="h2"
              className="mt-5"
            />
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-paper-mute lg:text-right">
            Three moves. No jargon, no dashboards to learn.
          </p>
        </div>
      </Reveal>

      {/* Precision line — the three steps are one process */}
      <div aria-hidden="true" className="mt-16 hidden h-px w-full bg-line md:block" />

      <ol className="grid gap-10 md:mt-0 md:grid-cols-3 md:gap-8 md:pt-0">
        {IDEA.steps.map((step, index) => (
          <Reveal as="li" key={step.n} delay={index * 110}>
            <div className="relative border-t border-line pt-6 md:border-t-0 md:pt-8">
              <span aria-hidden="true" className="absolute -top-px left-0 h-3 w-px bg-brand-500/70" />
              <span className="font-mono text-xs text-brand-400">{step.n}</span>
              <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight text-paper">
                {step.title}
              </h3>
              <p className="mt-3 max-w-xs text-base leading-relaxed text-paper-dim">{step.body}</p>
            </div>
          </Reveal>
        ))}
      </ol>

      <Reveal delay={80}>
        <div className="mt-16 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-xl font-semibold tracking-tight text-paper sm:text-2xl">
            {IDEA.closing}
          </p>
          <Button href="/research" variant="outline">
            See the full process
          </Button>
        </div>
      </Reveal>
    </Section>
  );
}
