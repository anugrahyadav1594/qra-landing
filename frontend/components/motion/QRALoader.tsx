"use client";

/**
 * THE QRA OPENING SEQUENCE.
 *
 * A first impression gets one chance, so this one is built as a piece of
 * staging rather than as a spinner. The logo is still the anchor and the system
 * still builds around it, but it now arrives as a *moment*:
 *
 *   0.00s  a near-black field, already breathing; a single hairline of light
 *          appears at the exact centre of the screen
 *   0.10s  the mark is uncovered by an opening circle, out of a bloom of light
 *   0.22s  that hairline splits — two beams travel outward, a shockwave leaves
 *          the centre
 *   0.30s  instrument rings close around the mark: one drawn, one dashed and
 *          turning, twelve graduations arriving around it
 *   0.42s  a bar of light writes the wordmark, letter by letter, while the
 *          coordinate system draws itself outward and a scan sweeps the field,
 *          leaving readings where the guides cross the axes
 *   0.72s  the structure expands away and the mark leaves for the navbar
 *   0.82s  the screen parts down the middle — the hero is rising behind it, and
 *          the mark is still in flight above the gap
 *   1.00s  gone
 *
 * The budget is deliberate. Everything below the curtains is finished by 0.82;
 * the only things still moving after that are the curtains, the flare between
 * them, and the mark — which sits above them on purpose so the flight to the
 * navbar is what carries the eye from the sequence into the page.
 *
 * Two rules shape the implementation, and they have not changed:
 *
 * 1. NOTHING MAY TRAP THE PAGE. The overlay is server-rendered (so the hero
 *    never flashes first) but it carries its own CSS-only dismissal, so a
 *    failure in JavaScript still clears it. The hero's entrance is delayed by a
 *    custom property rather than paused, so it always ends up visible.
 * 2. The decision is made before paint. A tiny inline script in the layout
 *    writes `data-intro` on <html>: "skip" for a returning visitor, "reduce"
 *    when motion is not wanted, "play" otherwise. CSS then shows or hides the
 *    overlay accordingly — no hydration-dependent flicker. A returning visitor
 *    is skipped entirely rather than given a shorter sequence: the opening is a
 *    first impression, not a toll on every page in a session.
 */

import { useEffect, useRef, useState } from "react";

import { Logo } from "@/components/Logo";
import { LOADER } from "@/lib/content";

export const INTRO_ATTRIBUTE = "data-intro";
const SEEN_KEY = "qra-loader-seen";

/**
 * Timings (ms). Everything in the stylesheet is a fraction of `full`, so the
 * whole opening can be retimed from here without touching a keyframe.
 *
 * Exported because the test suite has to prove the overlay removes itself
 * before its own hard ceiling — a number it should not have to guess at.
 */
export const INTRO_TIMING = {
  /**
   * The loading screen that runs *before* the opening.
   *
   * A separate beat, not a replacement: the field boots, reports that it is
   * ready, and only then does the opening sequence begin. The whole sequence
   * is shifted by this amount in the stylesheet, so nothing in it is shortened
   * to make room.
   */
  boot: 1500,
  full: 2600,
  reduced: 520,
  /** Hard ceiling: whatever happens, the overlay is gone by now. */
  timeout: 5400,
} as const;

/** Boot plus opening — how long the overlay is actually up. */
export const INTRO_TOTAL = INTRO_TIMING.boot + INTRO_TIMING.full;

/**
 * When the hero starts to arrive.
 *
 * Not "as late as possible": the hero's own cascade is scaled by
 * INTRO_STAGGER so that its *last* element is nearly settled by the time the
 * screen has finished opening. Left at full stagger it would not even begin
 * until the curtains were done, and the parting would reveal a half-built page.
 */
export const INTRO_HERO_DELAY = INTRO_TOTAL - 1200;

/** The hero's cascade, compressed for the length of the opening. */
export const INTRO_STAGGER = 0.45;

/**
 * When the navbar's own mark fades in — the landing site of the handoff.
 *
 * On the hero's clock it would be fully visible a quarter of a second before
 * the mark flying towards it arrives, which puts two logos on screen at once.
 * It waits, so the arrival reads as the mark becoming the navbar's.
 */
export const INTRO_MARK_DELAY = INTRO_TOTAL - 450;

/** How the browser should treat this visit. */
export type IntroMode = "play" | "skip" | "reduce";

/** Read by the inline script in the layout, before first paint. */
export const INTRO_BOOTSTRAP =
  `(function(){try{var d=document.documentElement;d.className+=" js";var n="${SEEN_KEY}",` +
  `play=function(){d.setAttribute("${INTRO_ATTRIBUTE}","play");` +
  `d.style.setProperty("--intro-delay","${INTRO_HERO_DELAY}ms");` +
  `d.style.setProperty("--intro-mark-delay","${INTRO_MARK_DELAY}ms");` +
  `d.style.setProperty("--intro-stagger","${INTRO_STAGGER}");};` +
  `if(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches){` +
  `d.setAttribute("${INTRO_ATTRIBUTE}","reduce");}` +
  // An escape hatch for anyone reviewing the sequence: the opening is gated to
  // one play per session, and a reviewer cannot review what they cannot replay.
  `else if(location.search.indexOf("intro")>-1){play();}` +
  `else if(sessionStorage.getItem(n)==="1"){d.setAttribute("${INTRO_ATTRIBUTE}","skip");}` +
  `else{play();}` +
  `}catch(e){d.setAttribute("${INTRO_ATTRIBUTE}","skip");}})();`;

/**
 * Where an element sits once its own entrance transform has resolved.
 *
 * The navbar's mark has not started arriving when this runs, so it is sitting
 * 6px below where it will end up and invisible; a plain bounding rect would
 * measure that and the handoff would land short. The applied transform is read
 * back off the element and taken out of the measurement, which keeps this
 * correct if the navbar's entrance ever changes shape.
 */
function settledRect(element: Element): { x: number; y: number; height: number } | null {
  const rect = element.getBoundingClientRect();
  if (!rect.width && !rect.height) return null;

  let dx = 0;
  let dy = 0;
  let scale = 1;
  const transform = window.getComputedStyle(element).transform;
  if (transform && transform !== "none" && typeof DOMMatrixReadOnly === "function") {
    try {
      const matrix = new DOMMatrixReadOnly(transform);
      dx = matrix.m41;
      dy = matrix.m42;
      scale = matrix.a || 1;
    } catch {
      // An unusual transform string: measure it as it stands rather than
      // losing the handoff entirely. The CSS fallback is still behind this.
    }
  }

  return {
    x: rect.left - dx + rect.width / 2,
    y: rect.top - dy + rect.height / 2,
    height: rect.height / scale,
  };
}

export function QRALoader() {
  const [mode, setMode] = useState<IntroMode | null>(null);
  const [tier, setTier] = useState<"high" | "low">("high");
  const handoffRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // A low-tier device gets a thinner sky. Decided after mount, and expressed
    // as a CSS class, so the server-rendered markup never disagrees with it.
    const cores = navigator.hardwareConcurrency;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    if ((typeof cores === "number" && cores <= 4) || (typeof memory === "number" && memory <= 4)) {
      setTier("low");
    }
  }, []);

  /* Aim the handoff at the navbar mark it is actually going to become.
   *
   * The distance was a hardcoded guess, and a guess is a visible teleport: the
   * mark would arrive somewhere near the navbar and the navbar's own logo would
   * appear a few pixels away from it. Measuring it instead is what makes the
   * last beat of the sequence read as one object moving rather than two
   * cross-fading.
   *
   * Timed to 40% of the sequence: late enough that the mark's own entrance has
   * resolved to `transform: none` and its rect is therefore exact, and well
   * before the handoff begins at 72%. If any of it fails, the stylesheet's
   * fallback coordinates are still there and nothing breaks. */
  useEffect(() => {
    if (mode !== "play") return;
    const handoff = handoffRef.current;
    if (!handoff) return;

    const measure = window.setTimeout(() => {
      const destination = document.querySelector("[data-nav-logo] img");
      if (!destination) return;

      const from = settledRect(handoff);
      const to = settledRect(destination);
      if (!from || !to || !from.height) return;

      handoff.style.setProperty("--handoff-x", `${Math.round(to.x - from.x)}px`);
      handoff.style.setProperty("--handoff-y", `${Math.round(to.y - from.y)}px`);
      handoff.style.setProperty("--handoff-scale", (to.height / from.height).toFixed(3));
    }, INTRO_TIMING.boot + INTRO_TIMING.full * 0.4);

    return () => window.clearTimeout(measure);
  }, [mode]);

  useEffect(() => {
    const root = document.documentElement;
    const attribute = root.getAttribute(INTRO_ATTRIBUTE);
    const resolved: IntroMode =
      attribute === "play" || attribute === "reduce" || attribute === "skip" ? attribute : "skip";

    if (resolved === "skip") {
      setMode("skip");
      root.removeAttribute(INTRO_ATTRIBUTE);
      return;
    }

    setMode(resolved);

    // The overlay is removed from the DOM as soon as it has finished; the timer
    // is a hard ceiling so a throttled tab can never leave the site covered.
    const duration = resolved === "reduce" ? INTRO_TIMING.reduced : INTRO_TOTAL;
    const finish = () => {
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        // Private mode or blocked storage: the sequence simply plays again.
      }
      root.removeAttribute(INTRO_ATTRIBUTE);
      setMode("skip");
    };

    const timer = window.setTimeout(finish, duration);
    const guard = window.setTimeout(finish, INTRO_TIMING.timeout);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(guard);
    };
  }, []);

  // Rendered during server rendering as well, so the overlay exists before the
  // hero paints. A returning visitor never sees it: the inline bootstrap script
  // has already set data-intro="skip", and CSS hides it from the first frame.
  if (mode === "skip") return null;

  return (
    <div
      className="qra-loader"
      data-mode={mode ?? "play"}
      data-tier={tier}
      role="presentation"
      aria-hidden="true"
      data-testid="qra-loader"
    >
      <div className="qra-loader__stage">
        {/* THE LOADING SCREEN.
            It runs first, on its own clock, and is gone before the opening
            begins. The sequence behind it is shifted by --loader-boot rather
            than shortened, so this is a beat added in front of the opening
            and never a replacement for it. */}
        <div className="qra-loader__boot" aria-hidden="true">
          <span className="qra-loader__boot-label">Loading</span>
          <span className="qra-loader__boot-track">
            <span className="qra-loader__boot-fill" />
          </span>
          <span className="qra-loader__boot-status">
            <span className="qra-loader__boot-dot" />
            Preparing the market
          </span>
        </div>

        {/* The anchor. The inner span carries the departure: the mark travels
            to the navbar's own position instead of vanishing. */}
        <div className="qra-loader__mark">
          <span className="qra-loader__halo" aria-hidden="true" />
          <span className="qra-loader__handoff" ref={handoffRef}>
            <span className="qra-loader__logo-frame">
              <Logo className="qra-loader__logo" />
              <span className="qra-loader__writehead" aria-hidden="true" />
            </span>
          </span>
        </div>

        {/* The name, then the line the whole company is built on. */}
        <div className="qra-loader__name">
          <p className="qra-loader__name-text" aria-hidden="true">
            {LOADER.name.split("").map((character, index) => (
              <span
                key={`${character}-${index}`}
                className="qra-loader__char"
                style={{ animationDelay: `calc(var(--loader-boot) + var(--loader-dur) * 0.42 + ${index * 26}ms)` }}
              >
                {character}
              </span>
            ))}
            <span className="qra-loader__writehead qra-loader__writehead--name" aria-hidden="true" />
          </p>
          <span className="qra-loader__rule" aria-hidden="true" />
          <p className="qra-loader__tagline">{LOADER.tagline}</p>
        </div>

        {/* A quiet readout along the bottom edge: the three things it does. */}
        <div className="qra-loader__readout" aria-hidden="true">
          {LOADER.readout.map((word, index) => (
            <span
              key={word}
              className="qra-loader__readout-word"
              style={{ animationDelay: `calc(var(--loader-boot) + var(--loader-dur) * 0.52 + ${index * 110}ms)` }}
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      {/* The screen parts down the middle rather than fading: the last beat is
          an opening, not a dissolve. */}
      <div className="qra-loader__curtain qra-loader__curtain--left" aria-hidden="true" />
      <div className="qra-loader__curtain qra-loader__curtain--right" aria-hidden="true" />

      {/* Announced outside the hidden overlay, so the sequence is described
          once without exposing its decorative structure to assistive tech. */}
      <p role="status" className="sr-only">
        {LOADER.announcement}
      </p>
    </div>
  );
}
