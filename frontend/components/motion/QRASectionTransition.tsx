"use client";

/**
 * QRA SECTION TRANSITION — the thread between two sections.
 *
 * Sections used to simply end and the next one begin. This is the small piece
 * of connective tissue that makes the page read as one journey: a hairline that
 * draws across the width as the boundary enters view, a single node travelling
 * along it, and — where the site has a word for it — the state the next section
 * arrives in.
 *
 * It is deliberately the same object every time, at every boundary. One line,
 * one node, one label. Nothing else moves here, which is what keeps the seams
 * from competing with the sections they join.
 */

import { useRef } from "react";

import { EASE, TIMING } from "@/lib/motion";

import { useScrollScene } from "./useScrollScene";

export function QRASectionTransition({
  label,
  className = "",
}: {
  /** The state the next section arrives in, e.g. "Organized". Keep to one word. */
  label?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useScrollScene(ref, ({ gsap }) => {
    const scope = ref.current;
    if (!scope) return;

    const line = scope.querySelector("[data-transition-line]");
    const node = scope.querySelector("[data-transition-node]");
    const caption = scope.querySelector("[data-transition-label]");
    if (!line) return;

    const timeline = gsap.timeline({
      defaults: { ease: EASE.none },
      scrollTrigger: {
        trigger: scope,
        start: "top 92%",
        end: "bottom 60%",
        scrub: 0.4,
      },
    });

    timeline.fromTo(line, { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, duration: 1 });

    if (node) {
      timeline.fromTo(
        node,
        { x: 0, opacity: 0 },
        {
          // Travels the full width of the rule it rides on.
          x: () => Math.max(0, (line as HTMLElement).offsetWidth - (node as HTMLElement).offsetWidth),
          opacity: 1,
          duration: 1,
          ease: EASE.inOut,
        },
        0,
      );
    }

    if (caption) {
      timeline.fromTo(
        caption,
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: TIMING.micro, ease: EASE.out },
        0.45,
      );
    }
  });

  return (
    <div ref={ref} aria-hidden="true" className={`qra-transition ${className}`}>
      <div className="relative flex items-center gap-4">
        <span data-transition-line className="qra-transition__line" />
        <span data-transition-node className="qra-transition__node" />
      </div>
      {label ? (
        <span data-transition-label className="qra-transition__label">
          {label}
        </span>
      ) : null}
    </div>
  );
}
