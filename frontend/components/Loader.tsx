"use client";

/**
 * The Quantrelic opening sequence.
 *
 * Five frames, ~2.3 seconds, once per browser session:
 *   01  the mark and the wordmark on a black field
 *   02  the mark dissolves into thin data lines across the viewport
 *   03  the lines converge and nodes appear at the intersections
 *   04  QUANTRELEC reveals character by character over the brand line
 *   05  the structure compresses and lifts into the hero
 *
 * Two rules shape the implementation:
 *
 * 1. NOTHING MAY TRAP THE PAGE. The overlay is server-rendered (so there is no
 *    flash of the hero first) but it carries its own CSS-only dismissal, so a
 *    failure in JavaScript still clears it. The hero's entrance is delayed by a
 *    custom property rather than paused, so it always ends up visible.
 * 2. The decision is made before paint. A tiny inline script in the layout
 *    writes `data-intro` on <html>: "skip" for a returning visitor, "reduce"
 *    when motion is not wanted, "play" otherwise. CSS then shows or hides the
 *    overlay accordingly — no hydration-dependent flicker.
 */

import { useEffect, useState } from "react";

import { Logo } from "@/components/Logo";
import { LOADER } from "@/lib/content";

export const INTRO_ATTRIBUTE = "data-intro";
const SEEN_KEY = "qra-loader-seen";

/** Timings (ms) — the whole sequence stays under 2.5s. */
const TIMING = {
  full: 2350,
  short: 420,
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

const HORIZONTAL_LINES = 7;
const VERTICAL_LINES = 7;
const NODES = 16;

export function Loader() {
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
      /* Set by the component so the rest of the site can respond to the intro. */
      data-testid="qra-loader"
    >
      <div className="qra-loader__stage">
        {/* Frames 02–03: the mark becomes a coordinate system. */}
        <div className="qra-loader__lines">
          {Array.from({ length: HORIZONTAL_LINES }, (_, index) => (
            <span
              key={`h${index}`}
              className="qra-loader__line qra-loader__line--h"
              style={{ top: `${((index + 1) / (HORIZONTAL_LINES + 1)) * 100}%` }}
            />
          ))}
          {Array.from({ length: VERTICAL_LINES }, (_, index) => (
            <span
              key={`v${index}`}
              className="qra-loader__line qra-loader__line--v"
              style={{ left: `${((index + 1) / (VERTICAL_LINES + 1)) * 100}%` }}
            />
          ))}
          <div className="qra-loader__nodes">
            {Array.from({ length: NODES }, (_, index) => {
              const column = index % 4;
              const row = Math.floor(index / 4) % 4;
              return (
                <span
                  key={index}
                  className="qra-loader__node"
                  style={{
                    left: `${(column + 1) * 20}%`,
                    top: `${(row + 1) * 20}%`,
                    animationDelay: `${1080 + (index % 5) * 55}ms`,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Frames 01 and 04: the brand itself. */}
        <div className="qra-loader__mark">
          <Logo className="qra-loader__logo" />
          <p className="qra-loader__wordmark">{LOADER.wordmark}</p>
        </div>

        <div className="qra-loader__name">
          <p className="qra-loader__name-text" aria-hidden="true">
            {LOADER.name.split("").map((character, index) => (
              <span
                key={`${character}-${index}`}
                className="qra-loader__char"
                style={{ animationDelay: `${1460 + index * 38}ms` }}
              >
                {character}
              </span>
            ))}
          </p>
          <p className="qra-loader__tagline">{LOADER.tagline}</p>
        </div>

        <p className="sr-only">{LOADER.announcement}</p>
      </div>
    </div>
  );
}
