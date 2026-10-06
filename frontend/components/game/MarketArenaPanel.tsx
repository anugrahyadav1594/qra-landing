"use client";

import { useEffect, useRef, useState } from "react";

import { CandleChart } from "@/components/game/CandleChart";
import { ARENA_PREVIEW, PREVIEW_LABEL } from "@/lib/content";

/**
 * The hero's product preview: a historical replay, paused at a decision.
 *
 * This is the single most important object on the page, because it has to
 * answer "what is this?" before any copy is read. So it is built as an
 * interface rather than an illustration — asset header, chart, replay timeline,
 * indicator chips, the question, the three decisions, the risk the player set —
 * and the future is visibly withheld at the point the question is asked.
 *
 * It sequences once on entry, in the order a player actually reads it:
 * the session, the chart, the indicators, the question, the decision, the
 * reward. Every figure is a placeholder and the panel says so underneath.
 */
export function MarketArenaPanel() {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

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
      { threshold: 0.2 },
    );
    observer.observe(element);
    const guard = window.setTimeout(show, 2200);
    return () => {
      observer.disconnect();
      window.clearTimeout(guard);
    };
  }, []);

  const riskBlocks = 10;
  const riskFilled = Math.round(ARENA_PREVIEW.risk * riskBlocks);

  return (
    <div ref={ref} data-ready={ready} className="arena-panel relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-6 grid-backdrop opacity-50"
      />

      <div className="panel-float relative overflow-hidden rounded-xl border border-line-strong bg-ink-900/97">
        {/* Session header. */}
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div className="flex items-baseline gap-3">
            <span className="micro !text-brand-400">{ARENA_PREVIEW.title}</span>
            <span aria-hidden="true" className="h-3 w-px bg-line-strong" />
            <span className="font-display text-sm font-semibold tracking-[0.06em] text-paper">
              {ARENA_PREVIEW.asset}
            </span>
          </div>
          <span className="micro">{PREVIEW_LABEL}</span>
        </div>

        <div className="flex items-end justify-between gap-4 border-b border-line-faint px-5 py-4">
          <div>
            <p className="micro">{ARENA_PREVIEW.mode}</p>
            <p className="mt-2 font-mono text-2xl tracking-tight text-paper sm:text-[1.7rem]">
              {ARENA_PREVIEW.price}
            </p>
          </div>
          <span className="arena-badge">
            <span aria-hidden="true" className="arena-badge__dot" />
            Replay paused
          </span>
        </div>

        {/* The chart, with the future withheld. */}
        <div className="px-5 pt-4">
          <CandleChart played={ARENA_PREVIEW.played} className="h-40 sm:h-44" />
        </div>

        {/* The replay timeline: how much of the session has played. */}
        <div className="px-5 pt-4">
          <div className="flex items-center justify-between font-mono text-[0.68rem] text-paper-faint">
            <span>{ARENA_PREVIEW.time.start}</span>
            <span className="text-paper-dim">{ARENA_PREVIEW.time.now}</span>
            <span>{ARENA_PREVIEW.time.end}</span>
          </div>
          <div className="arena-timeline mt-2" role="presentation">
            <span className="arena-timeline__fill" style={{ width: `${ARENA_PREVIEW.played * 100}%` }} />
            <span className="arena-timeline__head" style={{ left: `${ARENA_PREVIEW.played * 100}%` }} />
          </div>
        </div>

        {/* Indicators. */}
        <div className="flex flex-wrap items-center gap-2 px-5 pt-4">
          <span className="micro mr-1">Indicators</span>
          {ARENA_PREVIEW.indicators.map((indicator, index) => (
            <span
              key={indicator}
              className="arena-chip guard-in"
              style={{ "--d": `${620 + index * 90}ms` } as React.CSSProperties}
            >
              {indicator}
            </span>
          ))}
        </div>

        {/* The question. */}
        <div className="px-5 pt-6">
          <p
            className="guard-in font-display text-lg font-semibold tracking-tight text-paper"
            style={{ "--d": "900ms" } as React.CSSProperties}
          >
            {ARENA_PREVIEW.prompt}
          </p>

          <div
            className="guard-in mt-3 grid grid-cols-3 gap-2"
            style={{ "--d": "1020ms" } as React.CSSProperties}
          >
            {ARENA_PREVIEW.decisions.map((decision) => {
              const chosen = decision === ARENA_PREVIEW.chosen;
              return (
                <span
                  key={decision}
                  className={`arena-decision ${chosen ? "arena-decision--chosen" : ""}`}
                  aria-label={chosen ? `${decision} — selected` : decision}
                >
                  {decision}
                </span>
              );
            })}
          </div>
        </div>

        {/* The risk the player set, and the scenario being decided on. */}
        <div className="mt-5 grid gap-4 border-t border-line px-5 py-4 sm:grid-cols-2">
          <div>
            <p className="micro">{ARENA_PREVIEW.riskLabel}</p>
            <div className="mt-2 flex gap-1" aria-hidden="true">
              {Array.from({ length: riskBlocks }, (_, index) => (
                <span
                  key={index}
                  className={`arena-risk__block ${index < riskFilled ? "arena-risk__block--on" : ""}`}
                />
              ))}
            </div>
            <p className="sr-only">Risk set to {Math.round(ARENA_PREVIEW.risk * 100)} percent</p>
          </div>
          <div>
            <p className="micro">Scenario</p>
            <p className="mt-2 text-sm leading-relaxed text-paper-dim">{ARENA_PREVIEW.scenario}</p>
          </div>
        </div>

        {/* The outcome of the demonstration: a decision, and what it earned. */}
        <div
          className="guard-in guard-in--up flex items-center justify-between gap-4 border-t border-line bg-ink-850/60 px-5 py-4"
          style={{ "--d": "1260ms" } as React.CSSProperties}
        >
          <p className="text-sm leading-relaxed text-paper-dim">{ARENA_PREVIEW.decisionNote}</p>
          <span className="arena-xp">{ARENA_PREVIEW.xp}</span>
        </div>
      </div>

      <p className="relative mt-3 text-xs leading-relaxed text-paper-faint">
        {ARENA_PREVIEW.disclaimer}
      </p>
    </div>
  );
}
