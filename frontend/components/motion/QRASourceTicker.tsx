"use client";

/**
 * THE SOURCES BAND.
 *
 * A thin, continuous band of the source types the product reads — the same
 * seven the problem section names. It is the one permanently moving thing on the
 * page, and it earns its place twice: it is a designed piece of the composition,
 * and it says something true about the product (all of this, in one place).
 *
 * It is a CSS translate on a single element holding two copies of the list, so
 * the loop is seamless and runs entirely on the compositor. It pauses the moment
 * it leaves the screen, and under reduced motion it does not move at all — the
 * list simply sits there, readable.
 */

import { useEffect, useRef } from "react";

import { prefersReducedMotion } from "@/lib/motion";

import { observeOnScreen } from "./screen-observer";

const SOURCES = [
  "Annual Reports",
  "Quarterly Results",
  "Filings",
  "News",
  "Charts",
  "Ratios",
  "Financial Statements",
];

export function QRASourceTicker() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (prefersReducedMotion()) return;

    // Off screen, a permanently animated element is a permanently wasted core.
    return observeOnScreen(element, (onScreen) => {
      element.dataset.paused = onScreen ? "false" : "true";
    });
  }, []);

  return (
    <div ref={ref} className="source-ticker" data-paused="false">
      <div className="source-ticker__label" aria-hidden="true">
        What we read
      </div>

      <div className="source-ticker__viewport">
        {/* Two identical runs: the track translates by exactly half its width,
            so the second run lands where the first began and the loop has no
            seam. The whole list is decorative here — the same sources are named
            in full in the problem section below. */}
        <div className="source-ticker__track" aria-hidden="true">
          {[0, 1].map((copy) => (
            <div className="source-ticker__run" key={copy}>
              {SOURCES.map((source) => (
                <span className="source-ticker__item" key={`${copy}-${source}`}>
                  {source}
                  <span className="source-ticker__dot" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
