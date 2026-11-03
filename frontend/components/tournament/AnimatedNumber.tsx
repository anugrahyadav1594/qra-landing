"use client";

import { useEffect, useRef } from "react";

import { prefersReducedMotion, useInView } from "@/components/tournament/useInView";
import { CURRENCY_SYMBOL, formatINR } from "@/lib/tournament";

/**
 * Counts up to `value` the first time it enters the viewport.
 * Writes straight to the DOM node (no per-frame React state) and snaps to
 * the final value when the visitor prefers reduced motion.
 */
export function AnimatedNumber({
  value,
  durationMs = 1400,
  className = "",
  prefix = CURRENCY_SYMBOL,
}: {
  value: number;
  durationMs?: number;
  className?: string;
  prefix?: string;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>({ threshold: 0.35 });
  const nodeRef = useRef<HTMLSpanElement>(null);
  const final = formatINR(value);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const reduced = prefersReducedMotion();
    if (!inView) {
      node.textContent = reduced ? final : `${prefix}0`;
      return;
    }
    if (reduced) {
      node.textContent = final;
      return;
    }

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      node.textContent = formatINR(value * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, durationMs, final, prefix]);

  return (
    <span ref={ref} className={className}>
      <span ref={nodeRef} className="mono-readout" aria-hidden="true">
        {final}
      </span>
      <span className="sr-only-live">{final}</span>
    </span>
  );
}
