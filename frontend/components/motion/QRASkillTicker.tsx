"use client";

/**
 * THE CURRICULUM BAND.
 *
 * A thin, continuous band of the market skills the levels teach — the full
 * twelve, where the level section itself only shows five. It is the one
 * permanently moving thing on the page, and it earns its place twice: it is a
 * designed piece of the composition, and it quietly answers "how deep does this
 * go?" before the visitor thinks to ask.
 *
 * It is a CSS translate on a single element holding two copies of the list, so
 * the loop is seamless and runs entirely on the compositor. It pauses the moment
 * it leaves the screen, and under reduced motion it does not move at all — the
 * list simply sits there, readable.
 */

import { useEffect, useRef } from "react";

import { prefersReducedMotion } from "@/lib/motion";

import { observeOnScreen } from "./screen-observer";

const SKILLS = [
  "Read the Chart",
  "Find the Trend",
  "Support & Resistance",
  "Moving Averages",
  "EMA Crossovers",
  "RSI",
  "MACD",
  "Volume",
  "Breakouts",
  "False Breakouts",
  "Risk / Reward",
  "Build the Setup",
];

export function QRASkillTicker() {
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
    <div ref={ref} className="skill-ticker" data-paused="false">
      <div className="skill-ticker__label" aria-hidden="true">
        What you learn
      </div>

      <div className="skill-ticker__viewport">
        {/* Two identical runs: the track translates by exactly half its width,
            so the second run lands where the first began and the loop has no
            seam. Decorative — the levels section carries the real detail. */}
        <div className="skill-ticker__track" aria-hidden="true">
          {[0, 1].map((copy) => (
            <div className="skill-ticker__run" key={copy}>
              {SKILLS.map((source) => (
                <span className="skill-ticker__item" key={`${copy}-${source}`}>
                  {source}
                  <span className="skill-ticker__dot" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
