"use client";

/**
 * THE POINTER.
 *
 * Replaces the system pointer on this site. It is a two-tone shape, and that is
 * the whole design: a white disc with a dark rim, both drawn at all times.
 *
 * On the site's near-black ink the rim disappears and you see a bright disc. On
 * a white panel the disc disappears and you see a dark ring. So the pointer
 * *does* change colour between dark and light areas — but as a property of its
 * own construction rather than as a guess about what is underneath it, which is
 * what makes it dependable. Every custom cursor that fails on light surfaces,
 * including the previous single-colour white dot in this file, fails because it
 * has only one colour to work with.
 *
 * The elegant alternative is `mix-blend-mode: difference` on a white shape,
 * which mathematically returns the inverse of the backdrop. It was built first
 * and then dropped: it renders correctly in a plain test page, but on this site
 * the values it produced depended on how the compositor grouped the page's
 * layered backdrops and came out mid-grey where it should have been near-white.
 * A pointer must not be subtle about being visible, so it does not rely on a
 * blending mode to be legible.
 *
 * Over anything clickable it opens into a ring and takes the brand colour; the
 * disc tightens on press. The system cursor is hidden everywhere except text
 * entry, where the I-beam is load-bearing.
 *
 * Cost: one element, one transform write per frame, no layout and no paint. It
 * mounts only on a fine-pointer device with motion enabled, and if it never
 * mounts the browser draws its own cursor exactly as it always would.
 */

import { useEffect, useRef } from "react";

import { isTouchDevice, prefersReducedMotion } from "@/lib/motion";

const INTERACTIVE_SELECTOR =
  "a, button, [role='tab'], [role='button'], label, summary, [data-cursor='ring']";
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
      // Tight enough to feel welded to the pointer. The previous version eased
      // at 0.28 and was visibly behind the hand, which is what made it hard to
      // aim with; at 0.6 it is never more than a pixel out.
      x += (targetX - x) * 0.6;
      y += (targetY - y) * 0.6;
      dot.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) translate(-50%, -50%)`;
      if (Math.abs(targetX - x) > 0.1 || Math.abs(targetY - y) > 0.1) {
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
        // Snap on the first frame rather than easing in from the middle.
        x = targetX;
        y = targetY;
        dot.dataset.visible = "true";
      }
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

    // A press is acknowledged: the shape tightens.
    const onDown = () => {
      dot.dataset.pressed = "true";
    };
    const onUp = () => {
      dot.dataset.pressed = "false";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointerleave", onLeave);
    document.documentElement.dataset.cursor = "custom";

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      delete document.documentElement.dataset.cursor;
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={dotRef} className="qra-cursor" aria-hidden="true" data-visible="false" data-mode="dot" />
  );
}
