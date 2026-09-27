"use client";

import { useRef } from "react";

import { Section, SectionLabel, SectionStatement } from "@/components/ui";
import { useScrollPhase } from "@/components/useScrollPhase";
import { PROBLEM } from "@/lib/content";

/**
 * The problem, told visually: eight sources of financial information start
 * scattered and disorganised, then align. It is the site's signature
 * transformation — fragmented information becoming a structure you can read.
 *
 * The alignment is driven by scroll phase (state changes only when the phase
 * changes, the movement itself is CSS transform/opacity).
 */
export function ProblemSection() {
  const ref = useRef<HTMLDivElement>(null);
  const phase = useScrollPhase(ref, 3);

  return (
    <Section id="problem" tone="raised" labelledBy="problem-heading">
      <div ref={ref} data-phase={phase}>
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <SectionLabel tone="brand">{PROBLEM.label}</SectionLabel>
            <SectionStatement id="problem-heading" lines={PROBLEM.statement} as="h2" className="mt-5" />
            <p className="mt-6 max-w-md text-base leading-relaxed text-paper-dim">{PROBLEM.note}</p>
          </div>

          {/* The fragment field (clipped: the scatter offsets are decorative) */}
          <div className="overflow-x-clip">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
              {PROBLEM.fragments.map((fragment, index) => (
                <div
                  key={fragment.label}
                  className="fragment seq rounded-md border border-line bg-ink-850/80 px-3 py-3"
                  style={
                    {
                      "--fx": fragment.fx,
                      "--fy": fragment.fy,
                      "--fr": fragment.fr,
                      "--fd": `${index * 45}ms`,
                      "--d": `${index * 45}ms`,
                    } as React.CSSProperties
                  }
                >
                  <span className="micro !tracking-[0.14em] !text-paper-faint">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-2 text-xs leading-snug text-paper-dim sm:text-sm">
                    {fragment.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Structure emerging from the noise */}
            <div className="mt-8 flex flex-col items-center">
              <div className="connector h-10 w-px bg-brand-500/40" aria-hidden="true" />
              <div className="understood flex flex-col items-center gap-3">
                <span className="rounded-md border border-brand-500/40 bg-brand-500/[0.08] px-4 py-2 font-display text-sm font-semibold tracking-[0.08em] text-paper">
                  QRA
                </span>
                <span aria-hidden="true" className="h-6 w-px bg-line-strong" />
                <span className="micro !tracking-[0.24em] !text-brand-400">Understand</span>
              </div>

              <div className="understood mt-8 grid w-full gap-2 text-center sm:grid-cols-2 sm:text-left">
                <p className="border-t border-line pt-3 text-sm font-medium text-paper">
                  {PROBLEM.overload}
                </p>
                <p className="border-t border-line pt-3 text-sm font-medium text-brand-300">
                  {PROBLEM.clarity}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
