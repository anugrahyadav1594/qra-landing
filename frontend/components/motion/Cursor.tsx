"use client";

/**
 * THE POINTER ACCENT.
 *
 * Two problems with what was here before, both of them the reason it was hard to
 * use:
 *
 *   1. it replaced the pointer. `cursor: none` on every element means the thing
 *      that tells you where you are pointing is gone, and a lagging circle is a
 *      worse map of a screen than an arrow. The system cursor is now always
 *      visible and always exactly where the pointer is.
 *   2. it was a white dot at 90% opacity. On anything light that is invisible,
 *      and on dark it reads as a speck of dust rather than as a pointer.
 *
 * What this draws instead is an accent *behind* the system cursor: a ring with a
 * solid centre, white on the inside and dark on the outside, so it reads on a
 * light background and a dark one without changing colour. It settles onto
 * interactive elements by opening and tinting, which is a second, calmer signal
 * that something is clickable.
 *
 * It is mounted only on a fine-pointer device with motion enabled, it only ever
 * writes a transform (no layout, no repaint), and if it fails to load the browser
 * draws its own cursor exactly as it always would.
 */

import { useEffect, useRef } from "react";

import { isTouchDevice, prefersReducedMotion } from "@/lib/motion";

const INTERACTIVE_SELECTOR = "a, button, [role='tab'], [role='button'], label, summary, [data-cursor='ring']";
const FOCUS_SELECTOR = "[data-cursor='focus']";

export function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion() || isTouchDevice()) return;
    const ring = ringRef.current;
    if (!ring) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let targetX = x;
    let targetY = y;
    let frame = 0;
    let visible = false;

    const render = () => {
      frame = 0;
      // A short, tight easing: enough to feel attached to the pointer without
      // ever being behind it. The old value (0.28) left the ring visibly
      // trailing, which is what made it hard to aim with.
      x += (targetX - x) * 0.55;
      y += (targetY - y) * 0.55;
      ring.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) translate(-50%, -50%)`;
      if (Math.abs(targetX - x) > 0.15 || Math.abs(targetY - y) > 0.15) {
        frame = window.requestAnimationFrame(render);
      }
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(render);
    };

    const onMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!visible) {
        visible = true;
        // Snap rather than ease on the first frame, so it never flies in.
        x = targetX;
        y = targetY;
        ring.dataset.visible = "true";
      }
      const element = event.target as Element | null;
      if (!element || typeof element.closest !== "function") return;
      const mode = element.closest(FOCUS_SELECTOR)
        ? "focus"
        : element.closest(INTERACTIVE_SELECTOR)
          ? "ring"
          : "dot";
      if (ring.dataset.mode !== mode) ring.dataset.mode = mode;
      schedule();
    };

    const onLeave = () => {
      visible = false;
      ring.dataset.visible = "false";
    };

    // A press is acknowledged: the ring tightens.
    const onDown = () => {
      ring.dataset.pressed = "true";
    };
    const onUp = () => {
      ring.dataset.pressed = "false";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ringRef} className="qra-cursor" aria-hidden="true" data-visible="false" data-mode="dot">
      <span className="qra-cursor__core" />
    </div>
  );
}
