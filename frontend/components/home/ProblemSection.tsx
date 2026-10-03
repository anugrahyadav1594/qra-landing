"use client";

import { QRAAtmosphere } from "@/components/motion/QRAAtmosphere";
import { QRASectionTransition } from "@/components/motion/QRASectionTransition";
import { QRAReveal } from "@/components/motion/QRAReveal";
import { Section, SectionLabel, SectionStatement } from "@/components/ui";
import { PROBLEM } from "@/lib/content";

/**
 * THE PROBLEM — too much information, not enough clarity.
 *
 * This section is copy and one quiet list. It used to carry a full-width stage:
 * a film of drifting documents behind seven chips, two statements alternating
 * over them and a node underneath. It never worked — at any width the overlays
 * fought the copy, and the film read as noise rather than as depth — so it is
 * gone rather than adjusted.
 *
 * What is left is the argument itself, stated once, and the seven sources as an
 * editorial list: numbered, ruled, and readable at a glance. The atmosphere
 * behind it is an AI-generated backdrop held at low opacity, which is the only
 * moving part and the only thing that does not have to be read.
 */
export function ProblemSection() {
  return (
    <Section
      id="problem"
      tone="raised"
      labelledBy="problem-heading"
      className="relative overflow-x-clip"
    >
      <QRASectionTransition label="Fragmented" />

      {/* The environment: a dark generated backdrop, felt rather than seen. */}
      <QRAAtmosphere variant="problem" />

      <div className="relative z-10">
        <QRAReveal>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <SectionLabel tone="brand">{PROBLEM.label}</SectionLabel>
              <SectionStatement
                id="problem-heading"
                lines={PROBLEM.statement}
                as="h2"
                className="mt-5"
              />
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-paper-mute lg:text-right">
              {PROBLEM.note}
            </p>
          </div>
        </QRAReveal>

        {/* The sources, as themselves. A hairline each, a number, a name — no
            cards, no motion, nothing competing with the sentence above. */}
        <div className="mt-14 lg:mt-16">
          <QRAReveal variant="line" className="border-t border-line" />
          <ol className="grid sm:grid-cols-2 sm:gap-x-14">
            {PROBLEM.fragments.map((fragment, index) => (
              <QRAReveal
                as="li"
                key={fragment.label}
                delay={60 + index * 50}
                className="flex items-baseline gap-5 border-b border-line-faint py-5"
              >
                <span className="font-mono text-xs text-brand-400">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-base font-medium tracking-tight text-paper sm:text-lg">
                  {fragment.label}
                </span>
              </QRAReveal>
            ))}
          </ol>
        </div>

        {/* The two statements, one after the other. Read in order, they are the
            whole argument; there is no need to animate them. */}
        <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-baseline sm:gap-6">
          <p className="font-display text-xl font-semibold tracking-tight text-paper sm:text-2xl">
            {PROBLEM.overload}
          </p>
          <p className="font-display text-xl font-semibold tracking-tight text-brand-300 sm:text-2xl">
            {PROBLEM.clarity}
          </p>
        </div>
      </div>
    </Section>
  );
}
