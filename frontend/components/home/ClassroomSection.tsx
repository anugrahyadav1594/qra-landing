"use client";

import { QRAAtmosphere } from "@/components/motion/QRAAtmosphere";
import { QRAReveal } from "@/components/motion/QRAReveal";
import { QRASectionTransition } from "@/components/motion/QRASectionTransition";
import { Button, Section, SectionLabel } from "@/components/ui";
import { CLASSROOM } from "@/lib/content";

/**
 * THE IDEA — the market is the classroom.
 *
 * This is the section the whole page is arguing for, so it is laid out as a
 * route rather than as a set of columns: five stations on one line, numbered,
 * with a hairline drawn behind them and a single packet travelling the length
 * of it. Read left to right it is the product loop; read as a shape it is a
 * progression, which is the feeling the rest of the page depends on.
 *
 * The last station is the important one — the guidance is withdrawn and the
 * skill is scored — so the closing line lands on that and nowhere else.
 */
export function ClassroomSection() {
  return (
    <Section id="how-it-works" labelledBy="classroom-heading" className="relative overflow-hidden">
      <QRASectionTransition label="The loop" />

      {/* The environment: chaos resolving into order. */}
      <QRAAtmosphere variant="idea" />

      <div className="relative z-10">
        <QRAReveal>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <SectionLabel tone="brand">{CLASSROOM.label}</SectionLabel>
              <h2
                id="classroom-heading"
                className="mt-5 font-display text-[2.1rem] font-semibold leading-[1.08] tracking-tightest text-paper sm:text-5xl sm:leading-[1.05] lg:text-[3.4rem]"
              >
                {CLASSROOM.statement.map((line, index) => (
                  <span key={line} className="block">
                    {line}
                    {index < CLASSROOM.statement.length - 1 ? " " : null}
                  </span>
                ))}
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-paper-mute lg:text-right">
              {CLASSROOM.support}
            </p>
          </div>
        </QRAReveal>

        {/* The loop, as stations on one route. */}
        <div className="relative mt-16">
          <QRAReveal variant="fade">
            <div className="loop-flow" aria-hidden="true">
              <span className="loop-flow__line" />
              <span className="loop-flow__packet" />
            </div>
          </QRAReveal>

          <div className="grid gap-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-5 lg:gap-7">
            {CLASSROOM.steps.map((step, index) => (
              <QRAReveal key={step.n} delay={100 + index * 90} variant="clip" as="div">
                <div className="loop-step">
                  <span className="loop-step__num" aria-hidden="true">
                    {step.n}
                  </span>
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-xs tracking-[0.16em] text-brand-400">
                      {step.n}
                    </span>
                    <span aria-hidden="true" className="loop-rule" />
                  </div>
                  <p className="mt-5 font-display text-xl font-semibold tracking-tight text-paper sm:text-[1.4rem]">
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
            <p className="max-w-xl font-display text-xl font-semibold tracking-tight text-paper sm:text-2xl">
              {CLASSROOM.closing}
            </p>
            <Button href="#level-mode" variant="outline" className="btn-lift">
              {CLASSROOM.cta}
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
