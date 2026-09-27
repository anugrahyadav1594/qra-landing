"use client";

import { useRef, useState } from "react";

import { DirectionMark, SectionLabel } from "@/components/ui";
import { CONCEPT_LABEL, ILLUSTRATIVE_LABEL, PRODUCT, type ProductTab } from "@/lib/content";

/**
 * The product experience: ask a question about one company, read the answer,
 * open the source behind it.
 *
 * Implemented as an accessible tab interface (roving tabindex + arrow keys).
 * All values are placeholders and the panel is labelled as a concept
 * interface — it is a preview of the product, not live data.
 */
export function ProductPreview({ className = "" }: { className?: string }) {
  const [activeId, setActiveId] = useState<string>(PRODUCT.tabs[0].id);
  const [sourceOpen, setSourceOpen] = useState(false);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const active: ProductTab = PRODUCT.tabs.find((tab) => tab.id === activeId) ?? PRODUCT.tabs[0];

  function select(id: string) {
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
    <div className={`overflow-hidden rounded-xl border border-line bg-ink-850/90 shadow-panel ${className}`}>
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
                className={`group relative shrink-0 rounded-md px-3.5 py-3 text-left transition-colors duration-200 lg:w-full ${
                  selected
                    ? "bg-brand-500/[0.10] text-paper"
                    : "text-paper-dim hover:bg-ink-800/60 hover:text-paper"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute inset-y-2 left-0 w-px transition-opacity duration-200 ${
                    selected ? "bg-brand-500 opacity-100" : "opacity-0"
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

        {/* Explanation */}
        <div
          key={active.id}
          role="tabpanel"
          id={`product-panel-${active.id}`}
          aria-labelledby={`product-tab-${active.id}`}
          tabIndex={0}
          className="seq p-5 sm:p-6"
        >
          <p className="font-display text-xl font-semibold leading-snug tracking-tight text-paper sm:text-2xl">
            {active.question}
          </p>

          {active.metrics && (
            <div className="mt-5 rounded-lg border border-line bg-ink-900/70 px-4 py-1.5">
              {active.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="flex items-baseline justify-between gap-4 border-b border-line-faint py-2.5 last:border-b-0"
                >
                  <span className="text-sm text-paper-dim">{metric.label}</span>
                  <span className="flex items-center gap-2.5">
                    <span className="value-placeholder font-mono text-sm">{metric.value}</span>
                    <DirectionMark direction={metric.direction} />
                  </span>
                </div>
              ))}
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

          {/* Source — attached to every explanation */}
          <div className="mt-6 border-t border-line pt-4">
            <button
              type="button"
              onClick={() => setSourceOpen((open) => !open)}
              aria-expanded={sourceOpen}
              aria-controls={`product-source-${active.id}`}
              className="inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 text-xs font-semibold text-paper transition-colors hover:border-brand-500/50 hover:bg-brand-500/[0.08]"
            >
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand-400" />
              {sourceOpen ? PRODUCT.sourceClose : PRODUCT.sourceCta}
            </button>

            {/* Always in the DOM so `aria-controls` always resolves */}
            <div
              id={`product-source-${active.id}`}
              hidden={!sourceOpen}
              className={`mt-3 rounded-lg border border-line bg-ink-900/70 p-4 ${
                sourceOpen ? "seq" : ""
              }`}
            >
              {sourceOpen && (
                <>
                  <SectionLabel>Source</SectionLabel>
                  <p className="mt-2 font-mono text-xs text-paper">{active.source.label}</p>
                  <p className="mt-2 text-sm leading-relaxed text-paper-dim">
                    {active.source.detail}
                  </p>
                </>
              )}
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
