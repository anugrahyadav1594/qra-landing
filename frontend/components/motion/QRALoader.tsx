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

import { useEffect, useState } from "react";

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
  full: 2600,
  reduced: 520,
  /** Hard ceiling: whatever happens, the overlay is gone by now. */
  timeout: 3400,
} as const;

/** How long the hero waits (the screen starts to part just before the end). */
export const INTRO_HERO_DELAY = INTRO_TIMING.full - 700;

/** How the browser should treat this visit. */
export type IntroMode = "play" | "skip" | "reduce";

/** Read by the inline script in the layout, before first paint. */
export const INTRO_BOOTSTRAP =
  `(function(){try{var d=document.documentElement,n="${SEEN_KEY}",f=${INTRO_HERO_DELAY};` +
  `if(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches){` +
  `d.setAttribute("${INTRO_ATTRIBUTE}","reduce");}` +
  // An escape hatch for anyone reviewing the sequence: the opening is gated to
  // one play per session, and a reviewer cannot review what they cannot replay.
  `else if(location.search.indexOf("intro")>-1){` +
  `d.setAttribute("${INTRO_ATTRIBUTE}","play");d.style.setProperty("--intro-delay",f+"ms");}` +
  `else if(sessionStorage.getItem(n)==="1"){d.setAttribute("${INTRO_ATTRIBUTE}","skip");}` +
  `else{d.setAttribute("${INTRO_ATTRIBUTE}","play");d.style.setProperty("--intro-delay",f+"ms");}` +
  `}catch(e){d.setAttribute("${INTRO_ATTRIBUTE}","skip");}})();`;

/** Two rings, in the same coordinate space as the lines. */
const RINGS = [
  { radius: 132, className: "qra-loader__ring qra-loader__ring--inner", at: 0.34 },
  { radius: 236, className: "qra-loader__ring qra-loader__ring--outer", at: 0.44 },
];

/** Guides at a quarter and three quarters of the field. */
const GUIDES = [0.25, 0.75];

/** Points settle where the guides cross the axes (plus the guide corners). */
const POINTS: Array<[number, number]> = [
  [0.5, 0.25],
  [0.5, 0.75],
  [0.25, 0.5],
  [0.75, 0.5],
  [0.25, 0.25],
  [0.75, 0.25],
  [0.25, 0.75],
  [0.75, 0.75],
];

/** Twelve ticks on the instrument dial, like graduations on a lens. */
const TICKS = Array.from({ length: 12 }, (_, index) => index * 30);

/**
 * Ambient motes drifting in the field.
 *
 * Positions come from a fixed low-discrepancy sequence rather than from
 * `Math.random`, so the server and the client lay out exactly the same sky —
 * a random field here would be a hydration mismatch on every page load.
 */
const PARTICLES = Array.from({ length: 34 }, (_, index) => {
  const golden = (index * 0.6180339887498949) % 1;
  const silver = (index * 0.7548776662466927) % 1;
  return {
    left: 3 + golden * 94,
    top: 4 + silver * 92,
    size: 1 + (index % 3),
    delay: (index % 12) * 0.28,
    duration: 4.2 + (index % 5) * 1.1,
  };
});

export function QRALoader() {
  const [mode, setMode] = useState<IntroMode | null>(null);
  const [tier, setTier] = useState<"high" | "low">("high");

  useEffect(() => {
    // A low-tier device gets a thinner sky. Decided after mount, and expressed
    // as a CSS class, so the server-rendered markup never disagrees with it.
    const cores = navigator.hardwareConcurrency;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    if ((typeof cores === "number" && cores <= 4) || (typeof memory === "number" && memory <= 4)) {
      setTier("low");
    }
  }, []);

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
    const duration = resolved === "reduce" ? INTRO_TIMING.reduced : INTRO_TIMING.full;
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
        {/* The sky the sequence is staged against. */}
        <div className="qra-loader__sky" aria-hidden="true">
          {PARTICLES.map((particle, index) => (
            <span
              key={index}
              className="qra-loader__mote"
              style={{
                left: `${particle.left.toFixed(2)}%`,
                top: `${particle.top.toFixed(2)}%`,
                "--size": `${particle.size}px`,
                animationDelay: `${particle.delay.toFixed(2)}s`,
                animationDuration: `${particle.duration.toFixed(2)}s`,
              } as React.CSSProperties}
            />
          ))}
        </div>

        {/* The seam of light the whole opening comes out of. */}
        <div className="qra-loader__horizon" aria-hidden="true">
          <span className="qra-loader__beam qra-loader__beam--up" />
          <span className="qra-loader__beam qra-loader__beam--down" />
        </div>
        <div className="qra-loader__bloom" aria-hidden="true" />

        {/* The coordinate system that forms around the logo. */}
        <div className="qra-loader__structure">
          <svg
            className="qra-loader__axes"
            viewBox="0 0 1000 1000"
            focusable="false"
            aria-hidden="true"
          >
            {/* The shockwave: one expanding ring, gone before the axes land. */}
            <circle className="qra-loader__shock" cx="500" cy="500" r="120" />

            {RINGS.map((ring) => (
              <circle
                key={ring.radius}
                className={ring.className}
                cx="500"
                cy="500"
                r={ring.radius}
                style={{
                  "--circ": `${Math.round(2 * Math.PI * ring.radius)}`,
                  animationDelay: `calc(var(--loader-dur) * ${ring.at})`,
                } as React.CSSProperties}
              />
            ))}

            {/* The instrument dial: dashed, and turning the whole time. */}
            <circle className="qra-loader__dial" cx="500" cy="500" r="176" />

            {TICKS.map((angle) => (
              <line
                key={angle}
                className="qra-loader__tick"
                x1="500"
                y1="284"
                x2="500"
                y2="298"
                transform={`rotate(${angle} 500 500)`}
                style={{
                  animationDelay: `calc(var(--loader-dur) * 0.4 + ${(angle / 360) * 260}ms)`,
                }}
              />
            ))}

            <line className="qra-loader__axis qra-loader__axis--h" x1="0" y1="500" x2="1000" y2="500" />
            <line className="qra-loader__axis qra-loader__axis--v" x1="500" y1="0" x2="500" y2="1000" />

            {GUIDES.map((position) => (
              <line
                key={`h${position}`}
                className="qra-loader__guide qra-loader__guide--h"
                x1="0"
                y1={position * 1000}
                x2="1000"
                y2={position * 1000}
              />
            ))}
            {GUIDES.map((position) => (
              <line
                key={`v${position}`}
                className="qra-loader__guide qra-loader__guide--v"
                x1={position * 1000}
                y1="0"
                x2={position * 1000}
                y2="1000"
              />
            ))}

            {POINTS.map(([x, y], index) => (
              <circle
                key={`${x}-${y}`}
                className="qra-loader__point"
                cx={x * 1000}
                cy={y * 1000}
                r="3.5"
                style={{ animationDelay: `calc(var(--loader-dur) * 0.5 + ${index * 34}ms)` }}
              />
            ))}
          </svg>

          {/* The reading that sweeps the field and leaves the points behind. */}
          <span className="qra-loader__scan" aria-hidden="true" />
        </div>

        {/* The anchor. The inner span carries the departure: the mark travels
            to the navbar's own position instead of vanishing. */}
        <div className="qra-loader__mark">
          <span className="qra-loader__halo" aria-hidden="true" />
          <span className="qra-loader__handoff">
            <span className="qra-loader__logo-frame">
              <Logo className="qra-loader__logo" />
              <span className="qra-loader__sheen" aria-hidden="true" />
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
                style={{ animationDelay: `calc(var(--loader-dur) * 0.42 + ${index * 26}ms)` }}
              >
                {character}
              </span>
            ))}
            <span className="qra-loader__sweep" aria-hidden="true" />
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
              style={{ animationDelay: `calc(var(--loader-dur) * 0.52 + ${index * 110}ms)` }}
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
