"use client";

import { useEffect, useRef } from "react";

/**
 * Numeric transition for the illustrative interfaces.
 *
 * The site never shows live data, so the only honest thing to animate is the
 * shape of a placeholder: the digits step toward their value and stop. This is
 * a text node update on a rAF loop — no React state, no re-render per frame.
 */
export function CountUp({
  to,
  prefix = "",
  suffix = "",
  duration = 1100,
  className = "",
  /** Rendered before the reveal (the "unknown" state of the interface). */
  from = 0,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
  from?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      element.textContent = format(to, prefix, suffix);
      return;
    }

    let frame = 0;
    let start = 0;

    const step = (now: number) => {
      if (!start) start = now;
      const progress = Math.min(1, (now - start) / duration);
      // Ease out cubic: fast information, calm arrival.
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = format(from + (to - from) * eased, prefix, suffix);
      if (progress < 1) frame = window.requestAnimationFrame(step);
    };

    // Only start once the panel is actually on screen.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            frame = window.requestAnimationFrame(step);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [to, from, duration, prefix, suffix]);

  return (
    <span ref={ref} className={className}>
      {format(from, prefix, suffix)}
    </span>
  );
}

function format(value: number, prefix: string, suffix: string) {
  // Indian-digit grouping for the crore-scale figures used in the interfaces.
  const rounded = Math.round(value);
  return `${prefix}${rounded.toLocaleString("en-IN")}${suffix}`;
}
