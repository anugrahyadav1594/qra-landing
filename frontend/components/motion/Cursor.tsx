"use client";

/**
 * A very small custom cursor: a dot that opens into a ring over anything
 * interactive, and into a wider ring inside the product interface.
 *
 * Deliberately unobtrusive — 10px, no trail, no distortion, no magnetic pull.
 * It is only mounted on a fine-pointer, non-reduced-motion device, and the
 * native cursor is only hidden once the replacement is actually running, so a
 * failure here can never leave someone without a pointer.
 */

import { useEffect, useRef } from "react";

import { isTouchDevice, prefersReducedMotion } from "@/lib/motion";

const INTERACTIVE_SELECTOR = "a, button, [role='tab'], label, summary, [data-cursor='ring']";
const TEXT_SELECTOR = "input, textarea, select, [contenteditable='true']";
const FOCUS_SELECTOR = "[data-cursor='focus']";

export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion() || isTouchDevice()) return;
    const dot = dotRef.current;
    if (!dot) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let targetX = x;
    let targetY = y;
    let frame = 0;
    let visible = false;

    const render = () => {
      frame = 0;
      // Ease so the ring feels attached rather than pinned to the pointer.
      x += (targetX - x) * 0.28;
      y += (targetY - y) * 0.28;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (Math.abs(targetX - x) > 0.2 || Math.abs(targetY - y) > 0.2) {
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
        dot.dataset.visible = "true";
      }
      // mode is derived from the element under the pointer, not from hover
      // listeners on every link.
      const element = event.target as Element | null;
      if (!element || typeof element.closest !== "function") return;
      const mode = element.closest(FOCUS_SELECTOR)
        ? "focus"
        : element.closest(INTERACTIVE_SELECTOR)
          ? "ring"
          : "dot";
      if (dot.dataset.mode !== mode) dot.dataset.mode = mode;
      schedule();
    };

    const onLeave = () => {
      visible = false;
      dot.dataset.visible = "false";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.documentElement.dataset.cursor = "custom";

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      delete document.documentElement.dataset.cursor;
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={dotRef} className="qra-cursor" aria-hidden="true" data-visible="false" data-mode="dot" />;
}

/** True when the custom cursor will actually run — used to hide the native one. */
export function cursorIsActive(): boolean {
  return !prefersReducedMotion() && !isTouchDevice();
}

export { TEXT_SELECTOR };
