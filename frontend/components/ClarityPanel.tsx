"use client";

import { useRef } from "react";

import { DirectionMark } from "@/components/ui";
import { useScrollPhase } from "@/components/useScrollPhase";
import { HERO_PANEL, ILLUSTRATIVE_LABEL } from "@/lib/content";

/**
 * The hero's concept interface: the numbers, what they mean, and where they
 * came from — labelled, in that order, so the product explains itself.
 *
 * Everything is a placeholder (₹XX,XXX Cr) and the panel says ILLUSTRATIVE
 * EXAMPLE: this is a preview of the product, never live market data.
 *
 * The panel also carries the site's signature interaction as a stepper:
 *   scattered → organized → explained → understood.
 * Scrolling advances the stage; only the stage changes on scroll, the movement
 * itself is CSS.
 */
export function ClarityPanel() {
  const ref = useRef<HTMLDivElement>(null);
  const stage = useScrollPhase(ref, HERO_PANEL.phases.length);

  return (
    <div ref={ref} data-stage={stage} className="relative">
      {/* Financial grid backdrop, extremely restrained */}
      <div aria-hidden="true" className="pointer-events-none absolute -inset-6 grid-backdrop opacity-60" />

      <div className="relative overflow-hidden rounded-xl border border-line bg-ink-900/90 shadow-panel backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <span className="font-display text-sm font-semibold tracking-[0.08em] text-paper">
            {HERO_PANEL.company}
          </span>
          <span className="micro">{ILLUSTRATIVE_LABEL}</span>
        </div>

        {/* The numbers */}
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
          <div className="seq h-6 w-px bg-line-strong" style={{ "--d": "620ms" } as React.CSSProperties} />
        </div>

        {/* What it means, then where it came from */}
        <div className="px-5 pb-5">
          <div
            className="panel-meaning seq rounded-lg border border-line bg-ink-850/70 p-4"
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

        {/* The signature interaction, named: complexity → clarity */}
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
                    <span aria-hidden="true" className="phase-mark__tick absolute inset-0 block bg-brand-500" />
                  </span>
                  <span className="mt-2 block text-[0.56rem] font-semibold uppercase leading-tight tracking-[0.12em] text-paper-faint">
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
