"use client";

import { useRef, useState } from "react";

import { DirectionMark, SectionLabel } from "@/components/ui";
import { CONCEPT_LABEL, ILLUSTRATIVE_LABEL, PRODUCT, type ProductTab } from "@/lib/content";

/**
 * The product experience: ask a question about one company, read the answer,
 * open the record behind it.
 *
 * This is the centrepiece, so it behaves like an application rather than a set
 * of tabs: changing the question slides the previous answer out and the new one
 * in, a chart draws itself, the explanation follows, and the source opens as a
 * drawer from the bottom of the panel with the page and section it came from.
 *
 * Implemented as an accessible tab interface (roving tabindex + arrow keys).
 * All values are placeholders and the panel is labelled as a concept interface.
 */
export function ProductPreview({ className = "" }: { className?: string }) {
  const [activeId, setActiveId] = useState<string>(PRODUCT.tabs[0].id);
  const [sourceOpen, setSourceOpen] = useState(false);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const active: ProductTab = PRODUCT.tabs.find((tab) => tab.id === activeId) ?? PRODUCT.tabs[0];

  function select(id: string) {
    if (id === activeId) return;
    setActiveId(id);
    setSourceOpen(false);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const index = PRODUCT.tabs.findIndex((tab) => tab.id === activeId);
    const keys = ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();

    let next = index;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      next = (index + 1) % PRODUCT.tabs.length;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      next = (index - 1 + PRODUCT.tabs.length) % PRODUCT.tabs.length;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = PRODUCT.tabs.length - 1;
    }

    const nextId = PRODUCT.tabs[next].id;
    select(nextId);
    tabRefs.current[nextId]?.focus();
  }

  return (
    <div
      className={`overflow-hidden rounded-xl border border-line bg-ink-850/90 shadow-panel ${className}`}
      data-cursor="focus"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
        <div className="flex items-baseline gap-3">
          <span className="micro">{PRODUCT.questionsLabel}</span>
          <span className="font-display text-sm font-semibold tracking-[0.08em] text-paper">
            {PRODUCT.company}
          </span>
        </div>
        <span className="micro">{CONCEPT_LABEL}</span>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,290px)_minmax(0,1fr)]">
        {/* Questions */}
        <div
          role="tablist"
          aria-label="Questions about this company"
          aria-orientation="vertical"
          onKeyDown={onKeyDown}
          className="flex gap-2 overflow-x-auto border-b border-line p-3 lg:flex-col lg:gap-1 lg:overflow-visible lg:border-b-0 lg:border-r lg:p-4"
        >
          {PRODUCT.tabs.map((tab) => {
            const selected = tab.id === activeId;
            return (
              <button
                key={tab.id}
                ref={(element) => {
                  tabRefs.current[tab.id] = element;
                }}
                type="button"
                role="tab"
                id={`product-tab-${tab.id}`}
                aria-selected={selected}
                aria-controls={`product-panel-${tab.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => select(tab.id)}
                className={`group relative shrink-0 overflow-hidden rounded-md px-3.5 py-3 text-left transition-colors duration-300 lg:w-full ${
                  selected
                    ? "bg-brand-500/[0.10] text-paper"
                    : "text-paper-dim hover:bg-ink-800/60 hover:text-paper"
                }`}
              >
                {/* The selection bar grows into place rather than appearing. */}
                <span
                  aria-hidden="true"
                  className={`absolute inset-y-2 left-0 w-px origin-bottom bg-brand-500 transition-transform duration-[400ms] ease-editorial ${
                    selected ? "scale-y-100" : "scale-y-0"
                  }`}
                />
                <span className="block font-display text-sm font-semibold tracking-tight">
                  {tab.label}
                </span>
                <span className="mt-1 hidden text-xs leading-snug text-paper-mute lg:block">
                  {tab.question}
                </span>
              </button>
            );
          })}
        </div>

        {/* Explanation — remounted per question so it sweeps in. */}
        <div
          key={active.id}
          role="tabpanel"
          id={`product-panel-${active.id}`}
          aria-labelledby={`product-tab-${active.id}`}
          tabIndex={0}
          className="sweep-in p-5 sm:p-6"
        >
          <p className="font-display text-xl font-semibold leading-snug tracking-tight text-paper sm:text-2xl">
            {active.question}
          </p>

          {active.metrics && (
            <div className="mt-5 rounded-lg border border-line bg-ink-900/70 px-4 py-1.5">
              {active.metrics.map((metric, index) => (
                <div
                  key={metric.label}
                  className="flex items-baseline justify-between gap-4 border-b border-line-faint py-2.5 last:border-b-0"
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <span className="text-sm text-paper-dim">{metric.label}</span>
                  <span className="flex items-center gap-2.5">
                    <span className="value-placeholder font-mono text-sm">{metric.value}</span>
                    <DirectionMark direction={metric.direction} />
                  </span>
                </div>
              ))}

              {/* The figures are given a shape, drawn rather than shown. */}
              <svg viewBox="0 0 320 40" className="mt-3 h-10 w-full" aria-hidden="true">
                <path
                  d="M2 34 L54 30 L106 31 L158 22 L210 24 L262 14 L318 7"
                  fill="none"
                  stroke="#3F6FFF"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  className="chart-line"
                  style={{ "--len": 350, "--cd": "260ms" } as React.CSSProperties}
                />
              </svg>
            </div>
          )}

          <div className="mt-5">
            <SectionLabel>{PRODUCT.meaningLabel}</SectionLabel>
            <ul className="mt-3 space-y-2.5">
              {active.summary.map((line) => (
                <li key={line} className="flex gap-2.5 text-base leading-relaxed text-paper-dim">
                  <span aria-hidden="true" className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-brand-400" />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          {/* Source — the record behind the explanation. */}
          <div className="mt-6 border-t border-line pt-4">
            <button
              type="button"
              onClick={() => setSourceOpen((open) => !open)}
              aria-expanded={sourceOpen}
              aria-controls={`product-source-${active.id}`}
              className="btn-lift inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 text-xs font-semibold text-paper transition-colors hover:border-brand-500/50 hover:bg-brand-500/[0.08]"
            >
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 rounded-full bg-brand-400 transition-transform duration-300 ${
                  sourceOpen ? "scale-150" : ""
                }`}
              />
              {sourceOpen ? PRODUCT.sourceClose : PRODUCT.sourceCta}
              <span aria-hidden="true" className="btn-arrow">
                {sourceOpen ? "↑" : "→"}
              </span>
            </button>

            {/* Drawer: height and opacity, and always in the DOM so the
                aria-controls reference never dangles. */}
            <div
              id={`product-source-${active.id}`}
              className="source-drawer mt-3"
              data-open={sourceOpen}
            >
              <div className="source-drawer__inner">
                {sourceOpen && (
                  <div className="rounded-lg border border-line bg-ink-900/70 p-4">
                    <SectionLabel>Source</SectionLabel>
                    <p className="mt-2 font-mono text-xs text-paper">{active.source.label}</p>

                    <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                      <div>
                        <dt className="micro !tracking-[0.16em]">Page</dt>
                        <dd className="mt-1 text-sm text-paper-dim">{active.source.page}</dd>
                      </div>
                      <div>
                        <dt className="micro !tracking-[0.16em]">Section</dt>
                        <dd className="mt-1 text-sm text-paper-dim">{active.source.section}</dd>
                      </div>
                    </dl>

                    <div className="mt-4 border-t border-line-faint pt-3">
                      <p className="micro !tracking-[0.16em]">What we used</p>
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {active.source.used.map((item) => (
                          <li
                            key={item}
                            className="rounded border border-line bg-ink-850 px-2.5 py-1 font-mono text-[0.7rem] text-paper-dim"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <p className="mt-4 text-sm leading-relaxed text-paper-mute">
                      {active.source.detail}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-line px-5 py-3 sm:px-6">
        <p className="text-xs leading-relaxed text-paper-faint">
          {ILLUSTRATIVE_LABEL}. Values are placeholders and source references are examples of how
          each explanation is attributed — not real company or market data.
        </p>
      </div>
    </div>
  );
}
