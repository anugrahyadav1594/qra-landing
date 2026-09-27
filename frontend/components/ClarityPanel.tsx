"use client";

import { useRef } from "react";

import { DirectionMark } from "@/components/ui";
import { useScrollPhase } from "@/components/useScrollPhase";
import { HERO_PANEL, ILLUSTRATIVE_LABEL } from "@/lib/content";

/**
 * The hero's "financial clarity" object: raw numbers, then what they mean,
 * then where they came from — with the source marker appearing last.
 *
 * Everything is a placeholder (₹ X,XXX Cr) and the panel is labelled
 * ILLUSTRATIVE: this is a concept interface, never live market data.
 *
 * Scrolling past it advances three CSS phases: scattered → sorted → explained.
 */
export function ClarityPanel() {
  const ref = useRef<HTMLDivElement>(null);
  const phase = useScrollPhase(ref, 3);

  return (
    <div ref={ref} data-phase={phase} className="relative">
      {/* Financial grid backdrop, extremely restrained */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-6 grid-backdrop opacity-70"
      />

      <div className="relative overflow-hidden rounded-xl border border-line bg-ink-850/90 shadow-panel backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-sm font-semibold tracking-[0.08em] text-paper">
              {HERO_PANEL.company}
            </span>
          </div>
          <span className="micro">{ILLUSTRATIVE_LABEL}</span>
        </div>

        {/* Raw numbers — colour-coded by direction only where it means something */}
        <div className="px-5 py-3">
          {HERO_PANEL.metrics.map((metric, index) => (
            <div
              key={metric.label}
              className="panel-metric seq flex items-baseline justify-between gap-4 border-b border-line-faint py-2.5 last:border-b-0"
              style={{ "--d": `${80 + index * 90}ms` } as React.CSSProperties}
            >
              <span className="text-sm text-paper-dim">{metric.label}</span>
              <span className="flex items-center gap-2.5">
                <span className="value-placeholder font-mono text-sm">{metric.value}</span>
                <DirectionMark direction={metric.direction} />
              </span>
            </div>
          ))}
        </div>

        {/* Precision line: the numbers are connected to their explanation */}
        <div className="px-5" aria-hidden="true">
          <div
            className="seq h-6 w-px bg-line-strong"
            style={{ "--d": "620ms" } as React.CSSProperties}
          />
        </div>

        {/* The explanation — the reason the panel exists */}
        <div className="px-5 pb-5">
          <div
            className="panel-meaning seq rounded-lg border border-line bg-ink-900/70 p-4"
            style={{ "--d": "700ms" } as React.CSSProperties}
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

          {/* Source marker appears last — the numbers can always be checked */}
          <div
            className="seq mt-4 flex items-center gap-2.5"
            style={{ "--d": "960ms" } as React.CSSProperties}
          >
            <span className="micro !tracking-[0.16em]">{HERO_PANEL.source.label}</span>
            <span className="h-px flex-1 bg-line" aria-hidden="true" />
            <span className="rounded border border-line bg-ink-900 px-2.5 py-1 font-mono text-[0.7rem] text-paper-dim">
              {HERO_PANEL.source.value}
            </span>
          </div>
        </div>
      </div>

      <p className="relative mt-3 text-xs leading-relaxed text-paper-faint">
        {HERO_PANEL.disclaimer}
      </p>
    </div>
  );
}
