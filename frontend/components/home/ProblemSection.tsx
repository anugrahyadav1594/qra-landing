"use client";

import { useEffect, useRef, useState } from "react";

import { QRAAtmosphere } from "@/components/motion/QRAAtmosphere";
import { QRASectionTransition } from "@/components/motion/QRASectionTransition";
import { Section, SectionLabel, SectionStatement } from "@/components/ui";
import { useScrollScene } from "@/components/motion/useScrollScene";
import { PROBLEM } from "@/lib/content";

/**
 * THE PROBLEM — information arriving from everywhere.
 *
 * The stage is a pre-rendered film: ninety documents drifting in three depth
 * layers, made in scripts/render-graphics.py and encoded to a seamless loop. It
 * plays continuously, on the compositor, while the scroll choreographs only the
 * seven readable fragments on top of it.
 *
 * The sequence is the section's argument, in order:
 *
 *   quiet      the seven sources sit in a readable row
 *   1          they drift out of line and crowd each other
 *   2          "Too much information." lands on top of the pile
 *   3          everything stops — a real hold, so the freeze registers
 *   4          the pile converges on one node, and the film recedes
 *   5          "Not enough clarity." resolves; the node is what is left
 *
 * Built with gsap.fromTo so the authored markup is the *settled* state: with
 * reduced motion, without JavaScript, or before the scene loads, the section
 * reads as a tidy row of sources and a node — the argument, still.
 */

/** Where each fragment drifts to when the pile loses its order. */
const SCATTER: Array<[number, number, number]> = [
  [86, -74, -7],
  [-98, -46, 5],
  [64, 58, 8],
  [-72, 74, -4],
  [118, 12, 6],
  [-56, -92, -9],
  [42, 96, 3],
];

export function ProblemSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [choreographed, setChoreographed] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setChoreographed(true);
  }, []);

  useScrollScene(
    ref,
    ({ gsap }) => {
      const scope = ref.current;
      if (!scope) return;

      const stage = scope.querySelector("[data-stage]");
      const fragments = gsap.utils.toArray<HTMLElement>("[data-fragment]", scope);
      const pinned = scope.firstElementChild as HTMLElement | null;
      const wide = window.matchMedia("(min-width: 1024px)").matches;
      // On a phone the scattered offsets are halved: the stage is narrower, and
      // fragments that leave it read as broken rather than as crowded.
      const reach = wide ? 1 : 0.5;

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: scope,
          start: wide ? "top 64px" : "top 74%",
          end: wide
            ? () => `+=${Math.max(1, scope.offsetHeight - (pinned?.offsetHeight ?? 0))}`
            : "bottom 60%",
          scrub: 0.7,
        },
      });

      // 1 — the pile loses its order. Fragments move out of the row, tilt, and
      //     brighten as they crowd: the same seven things, no longer readable.
      timeline.to(
        fragments,
        {
          xPercent: (index: number) => SCATTER[index % SCATTER.length][0] * reach,
          yPercent: (index: number) => SCATTER[index % SCATTER.length][1] * reach,
          rotate: (index: number) => SCATTER[index % SCATTER.length][2] * reach,
          borderColor: "rgba(245,247,250,0.30)",
          backgroundColor: "rgba(21,30,42,1)",
          duration: 1.4,
          stagger: { each: 0.06, from: "center" },
        },
        0,
      );

      // The film comes forward as the pile does.
      timeline.to("[data-flood]", { opacity: 1, scale: 1.03, duration: 1.2 }, 0.2);

      // 2 — the statement lands while the pile is at its worst.
      timeline.fromTo(
        "[data-overload]",
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.7 },
        1.15,
      );

      // 3 — everything stops. A hold with no movement at all, which is the only
      //     way a pause reads as deliberate rather than as a dropped frame.
      timeline.to({}, { duration: 0.85 });
      timeline.to("[data-overload]", { opacity: 0, duration: 0.5 });

      // 4 — convergence: the pile returns to one line, dims, and the film
      //     recedes behind the resolved frame.
      timeline.to(
        fragments,
        {
          xPercent: 0,
          yPercent: 0,
          rotate: 0,
          opacity: 0.16,
          duration: 1.2,
          stagger: { each: 0.04, from: "edges" },
        },
        ">-0.2",
      );
      timeline.to("[data-flood]", { opacity: 0.45, scale: 1, duration: 1.2 }, "<");

      // The node arrives last: it is the conclusion, not a decoration.
      timeline.fromTo(
        "[data-node]",
        { opacity: 0, scale: 0.94 },
        { opacity: 1, scale: 1, duration: 0.9 },
        "<0.35",
      );
      timeline.fromTo(
        "[data-clarity]",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.7 },
        "<0.15",
      );

      // 5 — a last beat of stillness on the resolved composition.
      timeline.to({}, { duration: 0.7 });

      // The stage's own border brightens as the section resolves.
      if (stage) {
        timeline.to(stage, { borderColor: "rgba(63,111,255,0.36)", duration: 0.8 }, 2.2);
      }
    },
    [choreographed],
  );

  return (
    <Section
      id="problem"
      tone="raised"
      labelledBy="problem-heading"
      className="relative overflow-x-clip"
    >
      <QRASectionTransition label="Fragmented" />

      <div
        ref={ref}
        className={`relative ${choreographed ? "lg:min-h-[215vh]" : ""}`}
      >
        <div className={choreographed ? "lg:sticky lg:top-16" : ""}>
          {/* The heading stays outside the stage: the argument is stated, then
              shown. */}
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-16">
            <div>
              <SectionLabel tone="brand">{PROBLEM.label}</SectionLabel>
              <SectionStatement
                id="problem-heading"
                lines={PROBLEM.statement}
                as="h2"
                className="mt-5"
              />
            </div>
            <p className="max-w-md text-base leading-relaxed text-paper-dim lg:justify-self-end">
              {PROBLEM.note}
            </p>
          </div>

          {/* ── The stage ─────────────────────────────────────────────────── */}
          <div
            data-stage
            className="problem-stage mt-14 border border-line bg-ink-900/60 lg:mt-16"
          >
            {/* The film: information arriving from everywhere, pre-rendered. */}
            <div data-flood className="problem-stage__flood">
              <QRAAtmosphere variant="problem" drift={false} opacity={1} />
            </div>

            {/* A veil, so the readable fragments always win against the film. */}
            <div aria-hidden="true" className="problem-stage__veil" />

            {/* The seven sources, authored as a readable row. */}
            <div className="problem-stage__row">
              {PROBLEM.fragments.map((fragment, index) => (
                <div key={fragment.label} data-fragment className="problem-chip">
                  <span className="problem-chip__n">{String(index + 1).padStart(2, "0")}</span>
                  <span className="problem-chip__label">{fragment.label}</span>
                </div>
              ))}
            </div>

            {/* The two statements, and the node they resolve to. */}
            <p data-overload className="problem-stage__statement problem-stage__statement--alarm">
              {PROBLEM.overload}
            </p>

            <div data-node className="problem-stage__node">
              <span className="problem-stage__node-mark">QRA</span>
              <span className="problem-stage__node-rule" aria-hidden="true" />
              <span className="problem-stage__node-word">Understand</span>
            </div>

            <p data-clarity className="problem-stage__statement problem-stage__statement--clarity">
              {PROBLEM.clarity}
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
