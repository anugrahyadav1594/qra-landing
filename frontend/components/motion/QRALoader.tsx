"use client";

/**
 * THE QRA OPENING SEQUENCE.
 *
 * The logo is the anchor and the system builds around it — this is the site's
 * thesis performed in two seconds: something clear, then structure, then
 * information, then the product.
 *
 *   0.00s  a near-black field; only the environment is alive
 *   0.30s  the logo arrives — opacity, scale, blur and a short lift, together
 *   0.80s  a ring draws around it, then coordinate lines extend from it
 *   1.20s  data points settle where the lines cross; the wordmark resolves
 *   1.60s  the structure expands outward, and the logo travels into the navbar
 *   2.35s  the hero is below it, already in place
 *
 * Two rules shape the implementation:
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

/** Timings (ms) — the whole sequence stays under 2.5s. */
const TIMING = {
  full: 2350,
  reduced: 520,
  /** Hard ceiling: whatever happens, the overlay is gone by now. */
  timeout: 3800,
};

/** How the browser should treat this visit. */
export type IntroMode = "play" | "skip" | "reduce";

/** Read by the inline script in the layout, before first paint. */
export const INTRO_BOOTSTRAP =
  `(function(){try{var d=document.documentElement,n="${SEEN_KEY}",f=${TIMING.full - 200};` +
  `if(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches){` +
  `d.setAttribute("${INTRO_ATTRIBUTE}","reduce");}` +
  `else if(sessionStorage.getItem(n)==="1"){d.setAttribute("${INTRO_ATTRIBUTE}","skip");}` +
  `else{d.setAttribute("${INTRO_ATTRIBUTE}","play");d.style.setProperty("--intro-delay",f+"ms");}` +
  `}catch(e){d.setAttribute("${INTRO_ATTRIBUTE}","skip");}})();`;

/** Two rings, in the same coordinate space as the lines. */
const RINGS = [
  { radius: 132, className: "qra-loader__ring qra-loader__ring--inner", delay: 780 },
  { radius: 236, className: "qra-loader__ring qra-loader__ring--outer", delay: 1000 },
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

export function QRALoader() {
  const [mode, setMode] = useState<IntroMode | null>(null);

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
    const duration = resolved === "reduce" ? TIMING.reduced : TIMING.full;
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
    const guard = window.setTimeout(finish, TIMING.timeout);
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
      role="presentation"
      aria-hidden="true"
      data-testid="qra-loader"
    >
      <div className="qra-loader__stage">
        {/* The coordinate system that forms around the logo. */}
        <div className="qra-loader__structure">
          <svg
            className="qra-loader__axes"
            viewBox="0 0 1000 1000"
            focusable="false"
            aria-hidden="true"
          >
            {RINGS.map((ring) => (
              <circle
                key={ring.radius}
                className={ring.className}
                cx="500"
                cy="500"
                r={ring.radius}
                style={{
                  "--circ": `${Math.round(2 * Math.PI * ring.radius)}`,
                  animationDelay: `${ring.delay}ms`,
                } as React.CSSProperties}
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
                style={{ animationDelay: `${1180 + index * 40}ms` }}
              />
            ))}
          </svg>
        </div>

        {/* The anchor. The inner span carries the departure: the mark travels
            to the navbar's own position instead of vanishing. */}
        <div className="qra-loader__mark">
          <span className="qra-loader__handoff">
            <Logo className="qra-loader__logo" />
          </span>
        </div>

        {/* The name, then the line the whole company is built on. */}
        <div className="qra-loader__name">
          <p className="qra-loader__name-text" aria-hidden="true">
            {LOADER.name.split("").map((character, index) => (
              <span
                key={`${character}-${index}`}
                className="qra-loader__char"
                style={{ animationDelay: `${1260 + index * 34}ms` }}
              >
                {character}
              </span>
            ))}
          </p>
          <p className="qra-loader__tagline">{LOADER.tagline}</p>
        </div>

      </div>

      {/* Announced outside the hidden overlay, so the sequence is described
          once without exposing its decorative structure to assistive tech. */}
      <p role="status" className="sr-only">
        {LOADER.announcement}
      </p>
    </div>
  );
}
