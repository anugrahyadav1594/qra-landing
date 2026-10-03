"use client";

/**
 * THREE PATHS.
 *
 * The three investors are not three quotes — they are three routes through the
 * same structure, and the drawing says so. Every layer is a pre-rendered SVG
 * file (`scripts/render-svgs.py`): one structure, three routes, all authored on
 * the same canvas so they stack exactly.
 *
 * Pointing at a row changes one class on one element, and CSS crossfades the
 * routes. That is the whole interaction: no scroll timeline, no per-frame
 * `stroke-dashoffset`, nothing repainting the SVG. The drawing each route
 * arrives with is animated inside its own file, on the browser's own schedule.
 *
 * Under reduced motion the routes are simply present, and the highlight still
 * works, because it is only a change of opacity.
 */

import { useState } from "react";

import { QRAAtmosphere } from "@/components/motion/QRAAtmosphere";
import { QRAReveal } from "@/components/motion/QRAReveal";
import { QRASectionTransition } from "@/components/motion/QRASectionTransition";
import { Button, Section, SectionLabel } from "@/components/ui";
import { AUDIENCE } from "@/lib/content";

/**
 * Node positions as percentages of the drawing's canvas (760 × 260), so the
 * labels are HTML — selectable, translatable, and readable to a screen reader —
 * while the geometry stays in the image.
 */
const NODE_LABELS = [
  { label: "Sources", x: 11.3, y: 47.7 },
  { label: "One company", x: 36.8, y: 10.8 },
  { label: "Plain language", x: 62.4, y: 47.7 },
  { label: "Your decision", x: 87.9, y: 10.8 },
];

const ROUTE_KEYS = ["beginner", "curious", "busy"] as const;

const ROUTE_NOTES: Record<(typeof ROUTE_KEYS)[number], string> = {
  beginner: "enters furthest out, and takes the long way in",
  curious: "comes in through one company, and stays with it",
  busy: "takes the shortest route that still explains itself",
};

export function AudienceSection() {
  const [active, setActive] = useState(0);

  return (
    <Section id="for-investors" labelledBy="audience-heading" className="relative overflow-hidden">
      <QRASectionTransition label="Understood" />

      {/* The room they stand in: a rendered mesh, not a photograph. */}
      <QRAAtmosphere variant="investor" />

      <div className="relative z-10">
        <QRAReveal>
          <SectionLabel tone="brand">{AUDIENCE.label}</SectionLabel>
          <h2
            id="audience-heading"
            className="mt-5 max-w-3xl font-display text-3xl font-semibold tracking-tightest text-paper sm:text-4xl lg:text-[2.6rem] lg:leading-[1.1]"
          >
            {AUDIENCE.statement}
          </h2>
        </QRAReveal>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-start lg:gap-16">
          {/* ── The three readers ───────────────────────────────────────── */}
          <div>
            <QRAReveal variant="line" className="border-t border-line" />
            <ol className="divide-y divide-line">
              {AUDIENCE.people.map((person, index) => {
                const on = index === active;
                return (
                  <QRAReveal as="li" key={person.n} delay={120 + index * 90}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(index)}
                      onFocus={() => setActive(index)}
                      onClick={() => setActive(index)}
                      aria-pressed={on}
                      className={`group flex w-full flex-col gap-3 py-7 text-left transition-colors duration-300 sm:flex-row sm:items-baseline sm:gap-8 ${
                        on ? "text-paper" : "text-paper-dim hover:text-paper"
                      }`}
                    >
                      <span className="flex items-center gap-3 sm:w-10 sm:shrink-0">
                        <span className="font-mono text-xs text-brand-400">{person.n}</span>
                        <span
                          aria-hidden="true"
                          className={`h-px transition-all duration-500 ease-editorial ${
                            on ? "w-6 bg-brand-500" : "w-2 bg-line-strong"
                          }`}
                        />
                      </span>
                      <span>
                        <span className="micro block !tracking-[0.18em]">{person.title}</span>
                        <span className="mt-3 block font-display text-xl font-medium leading-snug tracking-tight sm:text-2xl">
                          “{person.quote}”
                        </span>
                      </span>
                    </button>
                  </QRAReveal>
                );
              })}
            </ol>

            <QRAReveal
              delay={140}
              className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="font-display text-xl font-semibold tracking-tight text-paper">
                {AUDIENCE.closing}
              </p>
              <Button href="#waitlist" variant="outline" className="btn-lift">
                {AUDIENCE.cta}
                <span aria-hidden="true" className="btn-arrow">
                  →
                </span>
              </Button>
            </QRAReveal>
          </div>

          {/* ── The drawing ────────────────────────────────────────────── */}
          <div className="lg:sticky lg:top-24">
            <div className="figure-frame">
              <div className="qra-paths">
                {/* Layer one: the structure, always present. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/graphics/investors-structure.svg"
                  alt=""
                  aria-hidden="true"
                  width={760}
                  height={260}
                  loading="lazy"
                  decoding="async"
                  className="qra-paths__layer qra-paths__layer--structure"
                />

                {/* Layers two to four: one route each, crossfaded by CSS. */}
                {ROUTE_KEYS.map((key, index) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={key}
                    src={`/graphics/investor-${key}.svg`}
                    alt={
                      index === active
                        ? `The route taken by ${AUDIENCE.people[index].title}: ${ROUTE_NOTES[key]}`
                        : ""
                    }
                    aria-hidden={index === active ? undefined : "true"}
                    width={760}
                    height={260}
                    loading="lazy"
                    decoding="async"
                    data-active={index === active ? "true" : "false"}
                    className="qra-paths__layer qra-paths__layer--route"
                  />
                ))}

                {/* The node names, in HTML. */}
                {NODE_LABELS.map((node) => (
                  <span
                    key={node.label}
                    className="qra-paths__label"
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  >
                    {node.label}
                  </span>
                ))}
              </div>

              {/* Which route is lit, in words, so the drawing is never the only
                  way to read the section. */}
              <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="micro !tracking-[0.2em] !text-brand-400">Route</span>
                <span className="font-display text-sm font-semibold tracking-tight text-paper">
                  {AUDIENCE.people[active].title}
                </span>
                <span className="text-xs text-paper-mute">
                  — {ROUTE_NOTES[ROUTE_KEYS[active]]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
