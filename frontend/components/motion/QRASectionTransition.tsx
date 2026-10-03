"use client";

/**
 * THE RULE BETWEEN SECTIONS.
 *
 * A hairline that draws itself, a node that rides it, and the word the next
 * section arrives in — the page's connective tissue, and the one place where the
 * thread from section to section is made explicit.
 *
 * This used to be scroll-scrubbed: a GSAP timeline drove `scaleX`, a measured
 * pixel travel and an opacity, recomputed continuously while the section passed
 * the viewport. It is now a CSS animation that plays once when the rule comes
 * into view — the same movement, on the compositor, with nothing to recalculate
 * and no relationship to how fast anyone scrolls.
 *
 * The travel distance is expressed as a percentage of the rule, so there is no
 * measurement to take and nothing to keep in sync on resize.
 */

import { useEffect, useRef, useState } from "react";

import { prefersReducedMotion } from "@/lib/motion";

import { sharedRevealObserver } from "./reveal-observer";

export function QRASectionTransition({
  label,
  className = "",
}: {
  /** The state the next section arrives in, e.g. "Organized". Keep to one word. */
  label?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (prefersReducedMotion()) {
      setDrawn(true);
      return;
    }
    return sharedRevealObserver().observe(element, () => setDrawn(true));
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-drawn={drawn ? "true" : "false"}
      className={`qra-transition ${className}`}
    >
      <div className="relative flex items-center gap-4">
        <span className="qra-transition__line" />
        <span className="qra-transition__node" />
      </div>
      {label ? <span className="qra-transition__label">{label}</span> : null}
    </div>
  );
}
