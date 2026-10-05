"use client";

/**
 * THE POINTER.
 *
 * The system arrow is switched off on this site, so this is the pointer — not a
 * decoration behind one. That changes the requirements, and the design follows
 * them:
 *
 *   1. It must be *exact*. With no arrow underneath to fall back on, a lagging
 *      dot is a pointer that lies. So there are two parts: a core that is
 *      written straight from the pointer event and is therefore always exactly
 *      where the pointer is, and a ring that eases after it and carries the
 *      character. Precision and personality are no longer the same object.
 *   2. It must be readable anywhere. Rather than picking one colour that
 *      survives both a dark panel and a light one, it looks at what is
 *      underneath and inverts. On the dark surfaces this site is built from it
 *      draws in paper; over a light panel it draws in ink. Nothing has to be
 *      told which is which — a background colour is enough, and
 *      `data-cursor-tone="light|dark"` is there for the surfaces a colour
 *      cannot describe (an image, a gradient, a video).
 *
 * Failure is designed for, because `cursor: none` is only safe if something can
 * always put the arrow back. The attribute that hides it is written by this
 * component, after it has confirmed it can draw, and removed again on unmount;
 * if the script never runs, if motion is reduced, or if the device has no fine
 * pointer, the attribute is never written and the browser draws its own arrow
 * exactly as it always would.
 */

import { useEffect, useRef } from "react";

import { REDUCED_MOTION_QUERY, isTouchDevice, prefersReducedMotion } from "@/lib/motion";

const INTERACTIVE_SELECTOR =
  "a, button, [role='tab'], [role='button'], label, summary, input[type='checkbox'], input[type='radio'], input[type='range'], select, [data-cursor='ring']";
const FOCUS_SELECTOR = "[data-cursor='focus']";
const TEXT_SELECTOR =
  "input:not([type='checkbox']):not([type='radio']):not([type='range']):not([type='submit']):not([type='button']), textarea, [contenteditable=''], [contenteditable='true'], [data-cursor='text']";

/** The attribute written to <html> while this pointer is the only one. */
export const CURSOR_ATTRIBUTE = "data-cursor";

/** What the pointer is drawn as. */
export type CursorTone = "light" | "dark";

type RGB = { r: number; g: number; b: number; a: number };

/** `rgb(...)` / `rgba(...)`; anything else (color(srgb …), currentcolor) is
 *  not a colour this can reason about, and is treated as unknown. */
function parseColor(value: string): RGB | null {
  const match = value.match(/^rgba?\(([^)]+)\)$/i);
  if (!match) return null;
  const parts = match[1].split(/[\s,/]+/).filter(Boolean).map(Number);
  if (parts.length < 3 || parts.some((part) => Number.isNaN(part))) return null;
  return {
    r: parts[0] / 255,
    g: parts[1] / 255,
    b: parts[2] / 255,
    a: parts.length > 3 ? parts[3] : 1,
  };
}

/** WCAG relative luminance: 0 is black, 1 is white. */
function luminance({ r, g, b }: RGB): number {
  const linear = (channel: number) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

/**
 * What is under a point, or nothing.
 *
 * Hit-testing is the one part of this a DOM may not offer — jsdom does not, and
 * an unusual embedding may not. It is wrapped rather than trusted, because the
 * answer "unknown" is cheap and a thrown exception inside a pointermove handler
 * is not.
 */
function elementUnder(x: number, y: number): Element | null {
  if (typeof document.elementFromPoint !== "function") return null;
  try {
    return document.elementFromPoint(x, y);
  } catch {
    return null;
  }
}

/**
 * Which tone the pointer should take over a given element.
 *
 * Walks up from it to the first surface that can actually be read: an explicit
 * `data-cursor-tone`, or a background colour opaque enough to be the thing you
 * are looking at. The page itself is ink, so an unreadable chain resolves to a
 * light pointer.
 *
 * Results are cached per element. Without the cache this would resolve a style
 * chain on every pointer event, which is the kind of cost that turns a smooth
 * cursor into a stuttering one.
 */
export function toneFor(element: Element | null, cache: WeakMap<Element, CursorTone>): CursorTone {
  if (!element) return "light";

  const cached = cache.get(element);
  if (cached) return cached;

  let node: Element | null = element;
  while (node) {
    const forced = node.getAttribute?.("data-cursor-tone");
    if (forced === "light" || forced === "dark") {
      // The attribute names the surface; the pointer takes the opposite.
      const tone: CursorTone = forced === "light" ? "dark" : "light";
      cache.set(element, tone);
      return tone;
    }

    const background = parseColor(window.getComputedStyle(node).backgroundColor);
    if (background && background.a >= 0.55) {
      const tone: CursorTone = luminance(background) > 0.42 ? "dark" : "light";
      cache.set(element, tone);
      return tone;
    }

    node = node.parentElement;
  }

  cache.set(element, "light");
  return "light";
}

export function Cursor() {
  const layerRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (prefersReducedMotion() || isTouchDevice()) return;
    const layer = layerRef.current;
    const core = coreRef.current;
    const ring = ringRef.current;
    // Never take the arrow away before there is something to replace it with.
    if (!layer || !core || !ring) return;

    const root = document.documentElement;
    const tones = new WeakMap<Element, CursorTone>();

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let targetX = x;
    let targetY = y;
    let frame = 0;
    let visible = false;
    let lastSurface: Element | null = null;
    let toneQueued = false;
    let toneFrame = 0;

    const setTone = () => {
      toneQueued = false;
      // Normally the last pointer event already told us what is underneath. A
      // hit test is only needed before the first move, and after a scroll,
      // because scrolling moves the surface under a pointer that has not.
      const surface = lastSurface ?? elementUnder(targetX, targetY);
      const tone = toneFor(surface, tones);
      if (layer.dataset.tone !== tone) layer.dataset.tone = tone;
    };

    /** Read the surface again, but at most once per frame. */
    const queueTone = () => {
      if (toneQueued) return;
      toneQueued = true;
      toneFrame = window.requestAnimationFrame(() => {
        toneFrame = 0;
        setTone();
      });
    };

    const render = () => {
      frame = 0;
      // Tight enough that the ring reads as attached to the pointer, loose
      // enough that it is visibly a second object following the first.
      x += (targetX - x) * 0.24;
      y += (targetY - y) * 0.24;
      ring.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) translate(-50%, -50%)`;
      if (Math.abs(targetX - x) > 0.2 || Math.abs(targetY - y) > 0.2) {
        frame = window.requestAnimationFrame(render);
      } else {
        ring.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
      }
    };

    const onMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      // The core is the pointer: written straight from the event, never eased,
      // so the thing you aim with is always where you actually are.
      core.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;

      if (!visible) {
        visible = true;
        // Snap the ring rather than easing it, so it never flies in from a
        // corner of the screen it was last seen in.
        x = targetX;
        y = targetY;
        ring.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
        layer.dataset.visible = "true";
      }

      const element = event.target as Element | null;
      if (element && typeof element.closest === "function") {
        const mode = element.closest(TEXT_SELECTOR)
          ? "text"
          : element.closest(FOCUS_SELECTOR)
            ? "focus"
            : element.closest(INTERACTIVE_SELECTOR)
              ? "ring"
              : "dot";
        if (layer.dataset.mode !== mode) layer.dataset.mode = mode;
      }

      // This layer never catches a pointer, so the event's target *is* the
      // surface under the pointer: the tone can be re-read without a hit test,
      // and only when that surface has actually changed.
      if (element && element !== lastSurface) {
        lastSurface = element;
        queueTone();
      }

      if (!frame) frame = window.requestAnimationFrame(render);
    };

    // Scrolling moves the surface under a stationary pointer.
    const onScroll = () => {
      lastSurface = null;
      queueTone();
    };

    const onHide = () => {
      visible = false;
      lastSurface = null;
      layer.dataset.visible = "false";
    };

    const onDown = () => {
      layer.dataset.pressed = "true";
    };
    const onUp = () => {
      layer.dataset.pressed = "false";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", onScroll);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointerleave", onHide);
    document.addEventListener("dragstart", onHide);

    // From here the site has one pointer, and it is this one.
    root.setAttribute(CURSOR_ATTRIBUTE, "custom");
    setTone();

    // A visitor who turns "reduce motion" on mid-session gets the arrow back
    // immediately, without a reload. (Turning it off again needs one: the
    // decision not to draw is made before any of this exists.)
    const motion =
      typeof window.matchMedia === "function" ? window.matchMedia(REDUCED_MOTION_QUERY) : null;
    const onMotionChange = (event: MediaQueryListEvent) => {
      if (event.matches) root.removeAttribute(CURSOR_ATTRIBUTE);
    };
    motion?.addEventListener?.("change", onMotionChange);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onHide);
      document.removeEventListener("dragstart", onHide);
      motion?.removeEventListener?.("change", onMotionChange);
      if (frame) window.cancelAnimationFrame(frame);
      if (toneFrame) window.cancelAnimationFrame(toneFrame);
      // The arrow comes back. This is the line that makes `cursor: none` safe.
      root.removeAttribute(CURSOR_ATTRIBUTE);
    };
  }, []);

  return (
    <div
      ref={layerRef}
      className="qra-cursor"
      aria-hidden="true"
      data-visible="false"
      data-mode="dot"
      data-tone="light"
      data-testid="qra-cursor"
    >
      {/* The ring: follows, and says what is clickable. */}
      <span ref={ringRef} className="qra-cursor__ring" />
      {/* The core: the pointer itself, always exact. */}
      <span ref={coreRef} className="qra-cursor__core" />
    </div>
  );
}
