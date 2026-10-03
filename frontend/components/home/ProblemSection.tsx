"use client";

import { QRAAtmosphere } from "@/components/motion/QRAAtmosphere";
import { QRASectionTransition } from "@/components/motion/QRASectionTransition";
import { Section, SectionLabel, SectionStatement } from "@/components/ui";
import { PROBLEM } from "@/lib/content";

/**
 * THE PROBLEM — information arriving from everywhere.
 *
 * There is no scroll-driven animation in this section, and that is the point.
 * It used to be a pinned stage with a scrubbed timeline that moved seven chips
 * around, repainted their borders and backgrounds, and scaled a playing video —
 * every one of which is a paint or a re-composite on every scroll frame.
 *
 * Instead:
 *
 *   · the film (pre-rendered, seamless) plays on the compositor, continuously;
 *   · the seven sources sit in a readable composition, always;
 *   · the two statements alternate on a slow CSS crossfade — the argument,
 *     stated as motion, with no scroll relationship at all.
 *
 * Everything that moves is opacity, which the compositor handles on its own
 * thread. Nothing here can stutter, because nothing here is doing work.
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

      {/* The heading states the argument before the stage shows it. */}
      <div className="relative z-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-16">
        <div>
          <SectionLabel tone="brand">{PROBLEM.label}</SectionLabel>
          <SectionStatement id="problem-heading" lines={PROBLEM.statement} as="h2" className="mt-5" />
        </div>
        <p className="max-w-md text-base leading-relaxed text-paper-dim lg:justify-self-end">
          {PROBLEM.note}
        </p>
      </div>

      {/* ── The stage ───────────────────────────────────────────────────── */}
      <div className="problem-stage mt-14 lg:mt-16">
        {/* The film: information arriving from everywhere, pre-rendered. */}
        <div className="problem-stage__flood">
          <QRAAtmosphere variant="problem" opacity={1} />
        </div>

        {/* A veil, so the readable layer always wins against the film. */}
        <div aria-hidden="true" className="problem-stage__veil" />

        {/* The sources, as themselves — the same seven the copy names. */}
        <div className="problem-stage__row">
          {PROBLEM.fragments.map((fragment, index) => (
            <div key={fragment.label} className="problem-chip">
              <span className="problem-chip__n">{String(index + 1).padStart(2, "0")}</span>
              <span className="problem-chip__label">{fragment.label}</span>
            </div>
          ))}
        </div>

        {/* The two statements, alternating. They cannot both be true of the same
            pile, which is exactly the section's argument — so the stage says one,
            then the other, forever, at a pace you can read. */}
        <p className="problem-stage__statement problem-stage__statement--alarm">
          {PROBLEM.overload}
        </p>
        <p className="problem-stage__statement problem-stage__statement--clarity">
          {PROBLEM.clarity}
        </p>

        {/* Where it resolves. */}
        <div className="problem-stage__node">
          <span className="problem-stage__node-mark">QRA</span>
          <span className="problem-stage__node-rule" aria-hidden="true" />
          <span className="problem-stage__node-word">Understand</span>
        </div>
      </div>
    </Section>
  );
}
