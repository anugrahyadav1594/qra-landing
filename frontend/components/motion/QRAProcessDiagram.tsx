"use client";

/**
 * THE QRA PROCESS — one route, drawn by the scroll.
 *
 * Three stations sit on a single thread: sources are found, the movement is
 * explained, and the result is understood. The only thing that animates is the
 * route itself — a dash offset driven by the section's own progress — so the
 * graphic is finished, readable and still whenever motion is not wanted.
 *
 * The faint version of the thread is always visible: the route is a plan, and
 * the progress fills it in.
 */

import { useEffect, useRef, useState } from "react";

import { prefersReducedMotion } from "@/lib/motion";

import { useScrollScene } from "./useScrollScene";

const THREAD = "M -10 100 H 910";

/** Stations hang off the thread, alternating above and below it. */
const STATIONS = [
  {
    key: "find",
    label: "Find",
    caption: "Every source that already exists, gathered in one place.",
    x: 150,
    side: "above" as const,
  },
  {
    key: "explain",
    label: "Explain",
    caption: "What moved, how much, and the sentence that says why.",
    x: 450,
    side: "below" as const,
  },
  {
    key: "understand",
    label: "Understand",
    caption: "One picture of your holdings you can hold in your head.",
    x: 750,
    side: "above" as const,
  },
];

/** Scattered marks, converging on the first station. */
const MARKS: Array<[number, number]> = [
  [58, 44],
  [104, 72],
  [212, 50],
  [236, 84],
];

export function QRAProcessDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  // Hidden until drawn, so the finished state never flashes before the scroll
  // scene takes over. Under reduced motion there is no scene, so the drawing is
  // simply finished.
  const [still, setStill] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) setStill(true);
  }, []);

  useScrollScene(ref, ({ gsap }) => {
    const scope = ref.current;
    if (!scope) return;

    const timeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: scope,
        start: "top 80%",
        end: "bottom 55%",
        scrub: 0.6,
      },
    });

    // The route draws. Nothing else moves.
    timeline.fromTo(
      "[data-route]",
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 3 },
      0,
    );

    // Each station's geometry and label arrive as the route reaches them —
    // progress, expressed as opacity, on the same timeline.
    timeline.from("[data-station='find']", { opacity: 0, duration: 0.5 }, 0.35);
    timeline.from("[data-station='explain']", { opacity: 0, duration: 0.5 }, 1.35);
    timeline.from("[data-station='understand']", { opacity: 0, duration: 0.5 }, 2.35);
  });

  return (
    <div ref={ref} data-still={still ? "true" : "false"} className="mt-16">
      <svg
        viewBox="0 0 900 200"
        className="qra-process h-auto w-full"
        role="img"
        aria-label="A route through three stages: find, explain, understand"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* The plan: the whole route, faintly, from the start. */}
        <path d={THREAD} pathLength={1} className="qra-process__plan" />

        {/* The progress: the same route, drawn as the section advances. */}
        <path data-route pathLength={1} d={THREAD} className="qra-process__route" />

        {/* Station 01 — sources, and the marks that become them. */}
        <g data-station="find" className="qra-process__station">
          <circle cx="150" cy="100" r="7" className="qra-process__ring" />
          <circle cx="150" cy="100" r="3" className="qra-process__node" />
          <line x1="150" y1="100" x2="150" y2="52" className="qra-process__tick" />
          {MARKS.map(([x, y], index) => (
            <g key={`mark-${index}`}>
              <circle cx={x} cy={y} r="1.75" className="qra-process__dot" />
              <line x1={x} y1={y} x2="150" y2="100" className="qra-process__link" />
            </g>
          ))}
        </g>

        {/* Station 02 — the same information, written in words. */}
        <g data-station="explain" className="qra-process__station">
          <circle cx="450" cy="100" r="7" className="qra-process__ring" />
          <circle cx="450" cy="100" r="3" className="qra-process__node" />
          <line x1="450" y1="100" x2="450" y2="146" className="qra-process__tick" />
          {[
            [380, 118, 132],
            [380, 138, 96],
            [380, 158, 118],
          ].map(([x, y, width], index) => (
            <rect
              key={`word-${index}`}
              x={x}
              y={y}
              width={width}
              height={index === 0 ? 7 : 5}
              rx="1.5"
              className={index === 0 ? "qra-process__word qra-process__word--lead" : "qra-process__word"}
            />
          ))}
        </g>

        {/* Station 03 — and settled into a hierarchy. */}
        <g data-station="understand" className="qra-process__station">
          <circle cx="750" cy="100" r="7" className="qra-process__ring" />
          <circle cx="750" cy="100" r="3" className="qra-process__node" />
          <line x1="750" y1="100" x2="750" y2="52" className="qra-process__tick" />
          {[
            [686, 30, 150],
            [686, 46, 104],
            [710, 62, 126],
            [710, 78, 78],
          ].map(([x, y, width], index) => (
            <rect
              key={`tier-${index}`}
              x={x}
              y={y}
              width={width}
              height={index === 0 ? 6 : 4}
              rx="1.5"
              className={index === 0 ? "qra-process__word qra-process__word--lead" : "qra-process__word"}
            />
          ))}
        </g>
      </svg>

      {/* The three stages, named — one column per station. */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {STATIONS.map((station) => (
          <div key={station.key} className="text-center">
            <p className="font-display text-sm font-semibold tracking-tightest text-paper">
              {station.label}
            </p>
            <p className="qra-process__caption mt-1.5 text-[0.78rem] leading-relaxed text-paper-muted">
              {station.caption}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
