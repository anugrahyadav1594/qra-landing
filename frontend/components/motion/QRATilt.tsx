"use client";

/**
 * QRA TILT — the interface leans toward the pointer.
 *
 * The panel is the subject of the hero, and this is what makes it feel like an
 * object rather than a screenshot: a shallow 3-degree turn with a soft light
 * that follows the pointer across its surface.
 *
 * Everything is a transform on two elements — no filters, no shadows re-painted,
 * no React state. Pointer moves are coalesced into a single animation frame and
 * written straight to the DOM, so a fast drag across the panel costs one style
 * write per frame and never re-renders the tree. On a touch device or under
 * reduced motion the panel is simply still.
 */

import { useEffect, useRef, type ReactNode } from "react";

import { isTouchDevice, prefersReducedMotion } from "@/lib/motion";

/** Degrees of rotation at the furthest edge. Any more and it stops being subtle. */
const MAX_TILT = 3.2;

export function QRATilt({
  children,
  className = "",
  tilt = MAX_TILT,
}: {
  children: ReactNode;
  className?: string;
  tilt?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    const surface = surfaceRef.current;
    const glow = glowRef.current;
    if (!root || !surface || !glow) return;
    if (prefersReducedMotion() || isTouchDevice()) return;

    let frame = 0;
    let targetX = 0;
    let targetY = 0;

    const render = () => {
      frame = 0;
      const rotateY = (targetX * tilt).toFixed(2);
      const rotateX = (-targetY * tilt).toFixed(2);
      surface.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      // The light travels less than the panel turns: it should feel like it is
      // falling across the surface, not sliding off it.
      glow.style.transform = `translate3d(${(targetX * 34).toFixed(2)}%, ${(targetY * 34).toFixed(2)}%, 0)`;
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(render);
    };

    const onMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      // -1 … 1 from the centre of the panel.
      targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      surface.dataset.active = "true";
      schedule();
    };

    const onLeave = () => {
      targetX = 0;
      targetY = 0;
      surface.dataset.active = "false";
      schedule();
    };

    root.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerleave", onLeave, { passive: true });

    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [tilt]);

  return (
    <div ref={ref} className={`qra-tilt ${className}`.trim()}>
      <div ref={surfaceRef} className="qra-tilt__surface" data-active="false">
        {/* The travelling light, clipped by the panel it sits in. */}
        <div ref={glowRef} aria-hidden="true" className="qra-tilt__glow" />
        {children}
      </div>
    </div>
  );
}
