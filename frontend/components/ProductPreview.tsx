"use client";

import { useEffect, useRef, useState } from "react";

import { DirectionMark, SectionLabel } from "@/components/ui";
import { CONCEPT_LABEL, ILLUSTRATIVE_LABEL, PRODUCT, type ProductTab } from "@/lib/content";

/**
 * The product experience: ask a question about one company, read the answer,
 * open the record behind it.
 *
 * This is the centrepiece, so it behaves like an application rather than a set
 * of tabs:
 *
 *   · changing the question is an exchange, not a swap — the answer you were
 *     reading rises out while the next one rises into place, on the same curve
 *     and at the same speed as everything else on the site;
 *   · the figures resolve into position rather than appearing at their value;
 *   · the chart draws its line and then reveals its readings one after another;
 *   · the source opens as a measured accordion, so the evidence behind an
 *     explanation is never a mystery.
 *
 * Implemented as an accessible tab interface (roving tabindex + arrow keys).
 * All values are placeholders and the panel is labelled as a concept interface.
 */

/** How long an answer takes to leave. Matches --dur-standard in globals.css. */
const EXCHANGE_MS = 400;

/** The trend line in the chart, and the readings along it. */
const CHART_PATH = "M2 34 L54 30 L106 31 L158 22 L210 24 L262 14 L318 7";
const CHART_POINTS: Array<[number, number]> = [
  [2, 34],
  [54, 30],
  [106, 31],
  [158, 22],
  [210, 24],
  [262, 14],
  [318, 7],
];
const CHART_LENGTH = 350;

export function ProductPreview({ className = "" }: { className?: string }) {
  const [activeId, setActiveId] = useState<string>(PRODUCT.tabs[0].id);
  /** The answer currently on screen, and the one leaving it. */
  const [displayId, setDisplayId] = useState<string>(PRODUCT.tabs[0].id);
  const [leavingId, setLeavingId] = useState<string | null>(null);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [drawerHeight, setDrawerHeight] = useState(0);

  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const drawerRef = useRef<HTMLDivElement>(null);

  const active: ProductTab = PRODUCT.tabs.find((tab) => tab.id === displayId) ?? PRODUCT.tabs[0];
  const leaving: ProductTab | null =
    leavingId && leavingId !== displayId
      ? (PRODUCT.tabs.find((tab) => tab.id === leavingId) ?? null)
      : null;
  const exchanging = leaving !== null;

  /** Select a question: the current answer leaves as the next one arrives. */
  function select(id: string) {
    if (id === activeId) return;
    setSourceOpen(false);
    setLeavingId(displayId);
    setDisplayId(id);
    setActiveId(id);
  }

  // Clear the outgoing copy once it has finished leaving.
  useEffect(() => {
    if (!leavingId) return;
    const timer = window.setTimeout(() => setLeavingId(null), EXCHANGE_MS + 60);
    return () => window.clearTimeout(timer);
  }, [leavingId, displayId]);

  // The drawer opens to its real height, and stays right if the content
  // reflows (a font swapping in, a resize, a longer source line).
  useEffect(() => {
    const element = drawerRef.current;
    if (!element) return;

    const measure = () => setDrawerHeight(element.scrollHeight);
    measure();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [sourceOpen, displayId]);

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

  /** The answer: question, figures, chart, meaning, source. */
  function Answer({ tab, decorative }: { tab: ProductTab; decorative?: boolean }) {
    return (
      <>
        <p className="font-display text-xl font-semibold leading-snug tracking-tight text-paper sm:text-2xl">
          {tab.question}
        </p>

        {tab.metrics && (
          <div key={tab.id} className="mt-5 rounded-lg border border-line bg-ink-900/70 px-4 py-1.5">
            {tab.metrics.map((metric, index) => (
              <div
                key={metric.label}
                className="flex items-baseline justify-between gap-4 border-b border-line-faint py-2.5 last:border-b-0"
              >
                <span className="text-sm text-paper-dim">{metric.label}</span>
                <span
                  className="metric-resolve flex items-center gap-2.5"
                  style={{ "--d": `${index * 70}ms` } as React.CSSProperties}
                >
                  <span className="value-placeholder font-mono text-sm">{metric.value}</span>
                  <DirectionMark direction={metric.direction} />
                </span>
              </div>
            ))}

            {/* The figures are given a shape: drawn, then read off one by one. */}
            <svg viewBox="0 0 320 40" className="mt-3 h-10 w-full" aria-hidden="true">
              <path
                d={CHART_PATH}
                fill="none"
                stroke="#3F6FFF"
                strokeWidth="1.25"
                strokeLinecap="round"
                className="chart-line"
                style={{ "--len": CHART_LENGTH, "--cd": "260ms" } as React.CSSProperties}
              />
              {CHART_POINTS.map(([x, y], index) => (
                <circle
                  key={`${x}-${y}`}
                  className="chart-point"
                  cx={x}
                  cy={y}
                  r="2"
                  fill="#6F94FF"
                  style={{
                    animationDelay: `${300 + Math.round((CHART_LENGTH * index) / CHART_POINTS.length)}ms`,
                  }}
                />
              ))}
            </svg>
          </div>
        )}

        <div className="mt-5">
          <SectionLabel>{PRODUCT.meaningLabel}</SectionLabel>
          <ul className="mt-3 space-y-2.5">
            {tab.summary.map((line) => (
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
            aria-controls={`product-source-${tab.id}`}
            tabIndex={decorative ? -1 : undefined}
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

          {/* Drawer: measured height and opacity, always in the DOM so the
              aria-controls reference never dangles. */}
          <div
            id={`product-source-${tab.id}`}
            ref={decorative ? undefined : drawerRef}
            className="source-drawer mt-3"
            data-open={sourceOpen}
            style={{ height: sourceOpen ? drawerHeight : 0, opacity: sourceOpen ? 1 : 0 }}
          >
            {sourceOpen && (
              <div className="rounded-lg border border-line bg-ink-900/70 p-4">
                <SectionLabel>Source</SectionLabel>
                <p className="mt-2 font-mono text-xs text-paper">{tab.source.label}</p>

                <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                  <div>
                    <dt className="micro !tracking-[0.16em]">Page</dt>
                    <dd className="mt-1 text-sm text-paper-dim">{tab.source.page}</dd>
                  </div>
                  <div>
                    <dt className="micro !tracking-[0.16em]">Section</dt>
                    <dd className="mt-1 text-sm text-paper-dim">{tab.source.section}</dd>
                  </div>
                </dl>

                <div className="mt-4 border-t border-line-faint pt-3">
                  <p className="micro !tracking-[0.16em]">What we used</p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {tab.source.used.map((item) => (
                      <li
                        key={item}
                        className="rounded border border-line bg-ink-850 px-2.5 py-1 font-mono text-[0.7rem] text-paper-dim"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-paper-mute">{tab.source.detail}</p>
              </div>
            )}
          </div>
        </div>
      </>
    );
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

        {/* The answer. During an exchange the outgoing copy is stacked behind
            the incoming one and hidden from assistive technology. */}
        <div className="relative overflow-hidden">
          {leaving && (
            <div
              key={`leave-${leaving.id}`}
              aria-hidden="true"
              className="product-panel--leave pointer-events-none absolute inset-0 p-5 sm:p-6"
            >
              <Answer tab={leaving} decorative />
            </div>
          )}

          <div
            key={active.id}
            role="tabpanel"
            id={`product-panel-${active.id}`}
            aria-labelledby={`product-tab-${active.id}`}
            tabIndex={0}
            className={`p-5 sm:p-6 ${exchanging ? "product-panel--enter" : ""}`}
          >
            <Answer tab={active} />
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
