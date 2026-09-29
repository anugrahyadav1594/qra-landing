"use client";

import { useRef } from "react";

import { useScrollScene } from "@/components/motion/useScrollScene";
import { IDEA } from "@/lib/content";

/**
 * One process, drawn as one diagram.
 *
 * Three stages share a single SVG: scattered marks arrive along the incoming
 * path, resolve into readable blocks, then settle into a hierarchy. The line
 * that runs through all three is the argument — this is one continuous process,
 * not three features — so it is literally the same stroke.
 *
 * Scrolling drives the drawing; without motion the diagram is simply present
 * and the three captions carry the meaning on their own.
 */
export function QRAProcessDiagram() {
  const ref = useRef<HTMLDivElement>(null);

  useScrollScene(ref, ({ gsap }) => {
    const scope = ref.current;
    if (!scope) return;

    const timeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: scope,
        start: "top 78%",
        end: "bottom 45%",
        scrub: 0.5,
      },
    });

    // Stage 01 — information arrives from everywhere.
    timeline.from("[data-scatter]", { opacity: 0, duration: 0.6, stagger: 0.02 });
    timeline.from(
      "[data-funnel]",
      { x: () => gsap.utils.random(-70, 70), y: () => gsap.utils.random(-40, 40), duration: 1 },
      "<",
    );

    // Stage 02 — the language becomes readable.
    timeline.from("[data-block]", {
      scaleX: 0,
      transformOrigin: "left center",
      opacity: 0,
      duration: 0.9,
      stagger: 0.12,
    });

    // Stage 03 — the blocks settle into a hierarchy.
    timeline.from("[data-tier]", {
      y: 18,
      opacity: 0,
      duration: 0.9,
      stagger: 0.14,
    });

    // The one line that ties the three stages together, drawn from its start.
    timeline.from(
      "[data-spine]",
      { scaleX: 0, transformOrigin: "left center", duration: 1.5, ease: "power2.inOut" },
      0,
    );

    // …and the node that travels along it: information entering, being
    // explained, arriving somewhere it can be held. One object, one pass.
    timeline.fromTo(
      "[data-travel]",
      { x: 0, opacity: 0 },
      { x: 410, opacity: 1, duration: 1.5, ease: "power1.inOut" },
      0.1,
    );
  });

  return (
    <div ref={ref} className="relative mt-16">
      <div className="data-seam mb-10" aria-hidden="true">
        <span className="data-seam__line" />
      </div>

      <svg
        viewBox="0 0 900 200"
        className="h-auto w-full"
        role="img"
        aria-label="Information arriving, becoming readable, then settling into a hierarchy"
      >
        {/* The continuous spine: one stroke through all three stages. */}
        <line
          data-spine
          x1="0"
          y1="100"
          x2="900"
          y2="100"
          stroke="rgba(245,247,250,0.12)"
          strokeWidth="1"
        />

        {/* The node that travels it — the argument, moving. It starts at the
            scattered marks and finishes inside the settled hierarchy. */}
        <circle cx="150" cy="100" r="7" fill="none" stroke="rgba(111,148,255,0.26)" strokeWidth="1" />
        <circle data-travel cx="150" cy="100" r="3.5" fill="#6F94FF" opacity="0" />

        {/* 01 — scattered points converging on a node */}
        <g>
          {[
            [40, 40],
            [90, 150],
            [30, 120],
            [120, 60],
            [70, 95],
            [110, 130],
          ].map(([x, y], index) => (
            <circle key={`s${index}`} data-scatter cx={x} cy={y} r="2" fill="#6F94FF" />
          ))}
          {[
            [40, 40, 150, 100],
            [90, 150, 150, 100],
            [30, 120, 150, 100],
            [120, 60, 150, 100],
            [110, 130, 150, 100],
          ].map(([x1, y1, x2, y2], index) => (
            <line
              key={`f${index}`}
              data-funnel
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(245,247,250,0.16)"
              strokeWidth="1"
            />
          ))}
          <circle cx="150" cy="100" r="4" fill="#3F6FFF" />
        </g>

        {/* 02 — the same information, now written in words */}
        <g>
          {[
            [230, 74, 96],
            [230, 96, 130],
            [230, 118, 74],
          ].map(([x, y, w], index) => (
            <rect
              key={`b${index}`}
              data-block
              x={x}
              y={y}
              width={w}
              height="8"
              rx="2"
              fill="rgba(245,247,250,0.34)"
            />
          ))}
          <rect x="230" y="140" width="150" height="1" fill="rgba(245,247,250,0.14)" />
        </g>

        {/* 03 — and settled into something you can hold in your head */}
        <g>
          {[
            [470, 50, 180],
            [470, 74, 120],
            [470, 98, 150],
            [530, 122, 120],
            [530, 146, 90],
          ].map(([x, y, w], index) => (
            <rect
              key={`t${index}`}
              data-tier
              x={x}
              y={y}
              width={w}
              height="6"
              rx="2"
              fill={index === 0 ? "rgba(63,111,255,0.75)" : "rgba(245,247,250,0.28)"}
            />
          ))}
          {[50, 74, 98, 122, 146].map((y, index) => (
            <line
              key={`l${index}`}
              x1={462}
              y1={y + 3}
              x2={470}
              y2={y + 3}
              stroke="rgba(245,247,250,0.18)"
              strokeWidth="1"
            />
          ))}
        </g>

        {/* Stage numbers, in the same key as the captions below. */}
        {[
          [150, "01"],
          [305, "02"],
          [560, "03"],
        ].map(([x, label]) => (
          <text
            key={String(label)}
            x={Number(x)}
            y="186"
            textAnchor="middle"
            fill="rgba(111,148,255,0.9)"
            fontSize="10"
            letterSpacing="2"
            fontFamily="ui-monospace, monospace"
          >
            {label}
          </text>
        ))}
      </svg>

      <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
        {IDEA.steps.map((step) => (
          <li key={step.n}>
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-xs text-brand-400">{step.n}</span>
              <h3 className="font-display text-lg font-semibold tracking-tight text-paper">
                {step.title}
              </h3>
            </div>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-paper-dim sm:text-base">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
