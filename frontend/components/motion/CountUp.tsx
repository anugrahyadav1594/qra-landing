"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

import { prefersReducedMotion } from "@/lib/motion";

/**
 * Numeric transition for the illustrative interfaces.
 *
 * The site never shows live data, so the only honest thing to animate is the
 * shape of a placeholder: the digits step toward their value and stop. This is
 * a text node update on a rAF loop — no React state, no re-render per frame.
 *
 * Progressive by construction: the server renders the *final* figure, so a
 * reader without JavaScript (or without an observer) sees the value rather than
 * a zero. The reset to the starting value happens in a layout effect, before
 * the first paint, so the digits have somewhere to travel from without anyone
 * ever seeing the finished number flash first.
 */

/** Layout effects warn during server rendering; fall back there. */
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function CountUp({
  to,
  prefix = "",
  suffix = "",
  duration = 1100,
  /** Decimal places (a margin reads 15.1%, not 15%). */
  decimals = 0,
  className = "",
  /** Rendered before the reveal (the "unknown" state of the interface). */
  from = 0,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  /** Decimal places (a margin reads 15.1%, not 15%). */
  decimals?: number;
  className?: string;
  from?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    // No motion wanted, no observer to wait for, or nothing to travel: the
    // figure is simply the figure.
    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined" || to === from) {
      element.textContent = format(to, prefix, suffix, decimals);
      return;
    }

    // Before paint: the interface does not know the number yet.
    element.textContent = format(from, prefix, suffix, decimals);

    let frame = 0;
    let start = 0;

    const step = (now: number) => {
      if (!start) start = now;
      const progress = Math.min(1, (now - start) / duration);
      // Ease out cubic: fast information, calm arrival.
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = format(from + (to - from) * eased, prefix, suffix, decimals);
      if (progress < 1) frame = window.requestAnimationFrame(step);
    };

    // Only start once the element is actually on screen.
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
  }, [to, from, duration, prefix, suffix, decimals]);

  return (
    <span ref={ref} className={className}>
      {format(to, prefix, suffix, decimals)}
    </span>
  );
}

function format(value: number, prefix: string, suffix: string, decimals = 0) {
  // Decimal figures (a margin, a growth rate) read exactly as authored.
  if (decimals > 0) return `${prefix}${value.toFixed(decimals)}${suffix}`;
  // Whole figures use Indian-digit grouping, as the crore scale is read here.
  const rounded = Math.round(value);
  return `${prefix}${rounded.toLocaleString("en-IN")}${suffix}`;
}
