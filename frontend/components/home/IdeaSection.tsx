import { QRAAtmosphere } from "@/components/motion/QRAAtmosphere";
import { QRASectionTransition } from "@/components/motion/QRASectionTransition";
import { QRAReveal } from "@/components/motion/QRAReveal";
import { TextReveal } from "@/components/motion/TextReveal";
import { Button, Section, SectionLabel } from "@/components/ui";
import { IDEA } from "@/lib/content";

/**
 * THE IDEA — less searching, more understanding.
 *
 * The section used to hold a framed SVG diagram in the middle: a route, three
 * stations, a travelling packet. It was removed rather than repaired — the
 * drawing competed with the three written steps directly beneath it, and said
 * the same thing less clearly.
 *
 * What is left is the sequence itself: three numbered moves, set as an editorial
 * three-column spread, over a generated backdrop held at low opacity. The
 * argument is the order of the steps, so the section is ordered.
 */
export function IdeaSection() {
  return (
    <Section id="how-it-works" labelledBy="idea-heading" className="relative overflow-hidden">
      <QRASectionTransition label="Organized" />

      {/* The environment: a dark generated backdrop. */}
      <QRAAtmosphere variant="idea" />

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

        {/* The three moves. Each one gets its own column, its own number and a
            hairline that draws when it arrives — the sequence carried entirely by
            the layout, not by a drawing of it. */}
        <div className="mt-16 grid gap-10 sm:grid-cols-3 sm:gap-8 lg:gap-12">
          {IDEA.steps.map((step, index) => (
            <QRAReveal key={step.n} delay={120 + index * 110} className="flex flex-col">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-xs tracking-[0.16em] text-brand-400">
                  {step.n}
                </span>
                <span aria-hidden="true" className="idea-rule" />
              </div>
              <p className="mt-5 font-display text-2xl font-semibold tracking-tight text-paper sm:text-[1.75rem]">
                {step.title}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-paper-dim">{step.body}</p>
            </QRAReveal>
          ))}
        </div>

        <QRAReveal delay={80}>
          <div className="mt-16 flex flex-col gap-6 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
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
