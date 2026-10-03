"use client";

import { useEffect } from "react";

/**
 * Thin reading-progress marker pinned under the navbar.
 *
 * Writes a single CSS custom property on <html> from a rAF-throttled scroll
 * listener — no React re-renders while scrolling, and the transform stays on
 * the compositor. Decorative only, so it is hidden from assistive tech.
 */
export function ScrollProgress() {
  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;

    const measure = () => {
      frame = 0;
      const scrollable = root.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      root.style.setProperty("--scroll-progress", progress.toFixed(4));
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
      root.style.removeProperty("--scroll-progress");
    };
  }, []);

  return (
    <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-transparent">
      <div className="scroll-progress h-full w-full bg-brand-500/80" />
    </div>
  );
}
