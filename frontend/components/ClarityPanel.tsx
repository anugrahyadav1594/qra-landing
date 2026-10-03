"use client";

import { useEffect, useRef, useState } from "react";

import { CountUp } from "@/components/motion/CountUp";
import { DirectionMark } from "@/components/ui";
import { useScrollPhase } from "@/components/useScrollPhase";
import { HERO_PANEL, ILLUSTRATIVE_LABEL } from "@/lib/content";

/** The readings along the hero chart, in the order the line reaches them. */
const HERO_PANEL_CHART_POINTS: Array<[number, number]> = [
  [2, 28],
  [46, 25],
  [92, 26],
  [138, 19],
  [184, 21],
  [230, 13],
  [276, 10],
  [318, 5],
];

/**
 * The hero's concept interface: the numbers, what they mean, and where they
 * came from.
 *
 * The sequencing is the point — the same order a person actually reads in:
 *
 *   1  the label and the company
 *   2  each figure steps up to its value, and its direction marker resolves
 *   3  a trend line draws itself across the figures
 *   4  "WHAT DOES THIS MEAN?" arrives
 *   5  the source closes the loop
 *
 * Steps 1–4 happen once, when the panel enters. Step 5 (the four phase labels)
 * is scroll-driven: scattered → organized → explained → understood.
 *
 * Everything is a placeholder and the panel says so: this is a concept
 * interface, never live market data.
 */
export function ClarityPanel() {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const stage = useScrollPhase(ref, HERO_PANEL.phases.length);

  // The sequence starts when the panel is on screen, and always ends in the
  // readable state — the timer is a ceiling, not a dependency.
  useEffect(() => {
    const element = ref.current;
    const show = () => setReady(true);
    if (!element || typeof IntersectionObserver === "undefined") {
      show();
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      show();
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            show();
            observer.disconnect();
          }
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(element);
    const guard = window.setTimeout(show, 2200);
    return () => {
      observer.disconnect();
      window.clearTimeout(guard);
    };
  }, []);

  return (
    <div ref={ref} data-stage={stage} data-ready={ready} className="relative">
      <div aria-hidden="true" className="pointer-events-none absolute -inset-6 grid-backdrop opacity-50" />

      <div className="panel-float relative overflow-hidden rounded-xl border border-line-strong bg-ink-900/92 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <span className="font-display text-sm font-semibold tracking-[0.08em] text-paper">
            {HERO_PANEL.company}
          </span>
          <span className="micro">{ILLUSTRATIVE_LABEL}</span>
        </div>

        {/* Step 2: the figures resolve, one after another. */}
        <div className="px-5 py-3">
          {HERO_PANEL.metrics.map((metric, index) => (
            <div
              key={metric.label}
              className="panel-metric flex items-baseline justify-between gap-4 border-b border-line-faint py-2.5 last:border-b-0"
            >
              <span className="text-sm text-paper-dim">{metric.label}</span>
              <span className="flex items-center gap-2.5">
                <span
                  className="panel-value guard-in value-placeholder font-mono text-sm"
                  style={{ "--d": `${200 + index * 140}ms` } as React.CSSProperties}
                >
                  <CountUp
                    to={metric.figure}
                    prefix="₹"
                    suffix=" Cr"
                    duration={900 + index * 90}
                  />
                </span>
                <span
                  className="panel-trend guard-in"
                  style={{ "--d": `${320 + index * 140}ms` } as React.CSSProperties}
                >
                  <DirectionMark direction={metric.direction} />
                </span>
              </span>
            </div>
          ))}
        </div>

        {/* Step 3: the trend line draws itself across the figures. */}
        <div className="px-5" aria-hidden="true">
          <svg viewBox="0 0 320 34" className="h-9 w-full" preserveAspectRatio="none">
            <path
              d="M2 28 L46 25 L92 26 L138 19 L184 21 L230 13 L276 10 L318 5"
              fill="none"
              stroke="#3F6FFF"
              strokeWidth="1.25"
              strokeLinecap="round"
              className="chart-line"
              style={{ "--len": 340, "--cd": "620ms" } as React.CSSProperties}
            />
            {/* The readings arrive along the line as it finishes drawing. */}
            {HERO_PANEL_CHART_POINTS.map(([x, y], index) => (
              <circle
                key={`${x}-${y}`}
                className="chart-point"
                cx={x}
                cy={y}
                r="2"
                fill="#6F94FF"
                style={{
                  animationDelay: `${760 + Math.round((340 * index) / HERO_PANEL_CHART_POINTS.length)}ms`,
                }}
              />
            ))}
            <path
              d="M2 32 L318 32"
              fill="none"
              stroke="rgba(245,247,250,0.12)"
              strokeWidth="1"
            />
          </svg>
        </div>

        {/* Step 4: the explanation. */}
        <div className="px-5 pb-5">
          <div
            className="panel-meaning guard-in guard-in--up rounded-lg border border-line bg-ink-850/70 p-4"
            style={{ "--d": "960ms" } as React.CSSProperties}
          >
            <p className="micro !text-brand-400">{HERO_PANEL.meaningLabel}</p>
            <ul className="mt-3 space-y-2">
              {HERO_PANEL.meaning.map((line) => (
                <li key={line} className="flex gap-2.5 text-sm leading-relaxed text-paper-dim">
                  <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-400" />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          {/* Step 5: the source. */}
          <div
            className="panel-settled guard-in mt-4 flex items-center gap-2.5"
            style={{ "--d": "1200ms" } as React.CSSProperties}
          >
            <span className="micro !tracking-[0.16em]">{HERO_PANEL.source.label}</span>
            <span className="h-px flex-1 bg-line" aria-hidden="true" />
            <span className="rounded border border-line bg-ink-900 px-2.5 py-1 font-mono text-[0.7rem] text-paper-dim">
              {HERO_PANEL.source.value}
            </span>
          </div>
        </div>

        {/* The signature interaction, named. */}
        <div className="border-t border-line px-5 py-4">
          <ol className="grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-4 sm:gap-x-3">
            {HERO_PANEL.phases.map((phase, index) => {
              const reached = index <= stage;
              const active = index === stage;
              return (
                <li
                  key={phase}
                  className={`phase-mark ${reached ? "phase-mark--reached" : ""} ${
                    active ? "phase-mark--active" : ""
                  }`}
                >
                  <span className="relative block h-px w-full bg-line-strong">
                    <span
                      aria-hidden="true"
                      className="phase-mark__tick absolute inset-0 block bg-brand-500"
                    />
                  </span>
                  <span className="mt-2 block text-[0.62rem] font-semibold uppercase leading-tight tracking-[0.11em] text-paper-faint">
                    {phase}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <p className="relative mt-3 text-xs leading-relaxed text-paper-faint">{HERO_PANEL.disclaimer}</p>
    </div>
  );
}
