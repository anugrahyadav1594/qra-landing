"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Scroll-driven phase for the site's signature transformation:
 *
 *   scattered  →  sorted  →  understood
 *
 * Returns 0..phaseCount-1 based on how far the element has travelled through
 * the viewport. State only changes when the phase changes (never per pixel),
 * so scrolling stays cheap; the movement itself is CSS.
 *
 * Reduced-motion users get the final phase immediately (and CSS also
 * neutralises the transforms).
 */
export function useScrollPhase(
  ref: RefObject<HTMLElement | null>,
  phaseCount = 3,
  enabled = true,
): number {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return;

    const prefersReduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced || typeof window === "undefined") {
      setPhase(phaseCount - 1);
      return;
    }

    let frame = 0;

    const measure = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      // 0 when the element enters from the bottom, 1 by the time its top has
      // risen to a third of the viewport (where the user is actually reading).
      const start = viewport * 0.95;
      const end = viewport * 0.3;
      const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
      const next = Math.min(phaseCount - 1, Math.floor(progress * phaseCount));
      setPhase((current) => (current === next ? current : next));
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [ref, phaseCount, enabled]);

  return phase;
}
