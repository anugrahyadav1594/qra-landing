import { QRAAtmosphere } from "@/components/motion/QRAAtmosphere";
import { QRASectionTransition } from "@/components/motion/QRASectionTransition";
import { QRAReveal } from "@/components/motion/QRAReveal";
import { TextReveal } from "@/components/motion/TextReveal";
import { Button, Section, SectionLabel } from "@/components/ui";
import { IDEA } from "@/lib/content";

/**
 * THE IDEA — less searching, more understanding.
 *
 * Three numbered moves set as three columns, over the chaos-to-order threads.
 * The sequence is carried by the layout: the columns lift in order, a hairline
 * draws across each as it arrives, and on a wide screen a thin flow line runs
 * behind them with a single packet travelling 01 → 03 — the same argument the
 * steps make, felt rather than diagrammed.
 *
 * Each move is an elevated panel with its number ghosted behind it, so the
 * three read as distinct stations on one route rather than as bare columns.
 */
export function IdeaSection() {
  return (
    <Section id="how-it-works" labelledBy="idea-heading" className="relative overflow-hidden">
      <QRASectionTransition label="Organized" />

      {/* The environment: chaos resolving into order. */}
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

        {/* The three moves, as stations on one route. */}
        <div className="relative mt-16">
          {/* The flow behind the columns: a line and a travelling packet, wide
              screens only, decorative. */}
          <QRAReveal variant="fade">
            <div className="idea-flow" aria-hidden="true">
              <span className="idea-flow__line" />
              <span className="idea-flow__packet" />
            </div>
          </QRAReveal>

          <div className="grid gap-10 sm:grid-cols-3 sm:gap-8 lg:gap-12">
            {IDEA.steps.map((step, index) => (
              <QRAReveal key={step.n} delay={120 + index * 110} variant="clip" as="div">
                <div className="idea-step">
                  <span className="idea-step__num" aria-hidden="true">
                    {step.n}
                  </span>
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
                </div>
              </QRAReveal>
            ))}
          </div>
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
