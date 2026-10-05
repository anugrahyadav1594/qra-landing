"use client";

import { QRAAtmosphere } from "@/components/motion/QRAAtmosphere";
import { QRASectionTransition } from "@/components/motion/QRASectionTransition";
import { QRAReveal } from "@/components/motion/QRAReveal";
import { Section, SectionLabel, SectionStatement } from "@/components/ui";
import { PROBLEM } from "@/lib/content";

/**
 * THE PROBLEM — too much information, not enough clarity.
 *
 * The argument is stated once and the seven sources are an editorial list:
 * numbered, ruled, readable at a glance. Behind it, on a wide screen, the same
 * seven sources exist again as *scatter* — loose, rotated document chips that
 * settle as the section arrives. The list is the ordered truth; the scatter is
 * the unordered reality it is describing. It is purely decorative: aria-hidden,
 * behind the content, held at low opacity, and gone below the `lg` breakpoint
 * where it would only crowd the copy.
 */

/* Loose anchors for the scatter, as percentages of its box; the per-source
   offsets and rotations from the content add the disorder. */
const SCATTER_ANCHORS: Array<{ top: string; left: string }> = [
  { top: "4%", left: "6%" },
  { top: "0%", left: "50%" },
  { top: "26%", left: "30%" },
  { top: "20%", left: "72%" },
  { top: "50%", left: "10%" },
  { top: "46%", left: "56%" },
  { top: "72%", left: "32%" },
];

export function ProblemSection() {
  return (
    <Section
      id="problem"
      tone="raised"
      labelledBy="problem-heading"
      className="relative overflow-x-clip"
    >
      <QRASectionTransition label="Fragmented" />

      {/* The environment: scattered documents, felt rather than read. */}
      <QRAAtmosphere variant="problem" />

      {/* The scatter: the seven sources, unordered, as texture. Decorative and
          confined to wide screens. */}
      <div className="problem-scatter" aria-hidden="true">
        <QRAReveal variant="fade" stagger step={90} className="problem-scatter__inner">
          {PROBLEM.fragments.map((fragment, index) => {
            const anchor = SCATTER_ANCHORS[index % SCATTER_ANCHORS.length];
            return (
              <span
                key={fragment.label}
                className="problem-scatter__chip"
                style={
                  {
                    top: anchor.top,
                    left: anchor.left,
                    "--fx": fragment.fx,
                    "--fy": fragment.fy,
                    "--fr": fragment.fr,
                    "--float-delay": `${index * 0.55}s`,
                  } as React.CSSProperties
                }
              >
                <span className="problem-scatter__lines" />
                <span className="problem-scatter__label">{fragment.label}</span>
              </span>
            );
          })}
        </QRAReveal>
      </div>

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

        {/* The sources, ordered. A hairline each, a number, a name — and a quiet
            lift on hover so the list is a surface, not a column of text. */}
        <div className="mt-14 lg:mt-16">
          <QRAReveal variant="line" className="border-t border-line" />
          <ol className="grid sm:grid-cols-2 sm:gap-x-14">
            {PROBLEM.fragments.map((fragment, index) => (
              <QRAReveal
                as="li"
                key={fragment.label}
                delay={60 + index * 50}
                className="problem-row flex items-baseline gap-5 border-b border-line-faint py-5"
              >
                <span className="font-mono text-xs text-brand-400">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-base font-medium tracking-tight text-paper sm:text-lg">
                  {fragment.label}
                </span>
                <span aria-hidden="true" className="problem-row__tick">
                  ·
                </span>
              </QRAReveal>
            ))}
          </ol>
        </div>

        {/* The two statements, one after the other. Read in order, they are the
            whole argument. */}
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
