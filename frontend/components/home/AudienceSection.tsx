"use client";

/**
 * THREE PATHS.
 *
 * The three investors are not three quotes — they are three routes through the
 * same structure, and the drawing says so. Each route is hand-authored SVG: a
 * different starting point, a different amount of the structure lit, a different
 * arrival.
 *
 *   beginner   starts at the outside and takes the long way in
 *   curious    comes in second, and stops at one company in detail
 *   busy       arrives almost directly, and lands on the summary
 *
 * Moving the pointer (or the keyboard) across the three rows lights that route
 * and dims the others — one element, class-driven, no per-frame work. The
 * paths are drawn once on arrival and then hold.
 *
 * Under reduced motion the whole drawing is simply present, and the hover state
 * still works because it is only a change of stroke colour.
 */

import { useEffect, useRef, useState } from "react";

import { QRAAtmosphere } from "@/components/motion/QRAAtmosphere";
import { QRAReveal } from "@/components/motion/QRAReveal";
import { QRASectionTransition } from "@/components/motion/QRASectionTransition";
import { Button, Section, SectionLabel } from "@/components/ui";
import { prefersReducedMotion } from "@/lib/motion";
import { AUDIENCE } from "@/lib/content";

import { observeAhead } from "@/components/motion/screen-observer";
import { useScrollScene } from "@/components/motion/useScrollScene";

/** The structure every route crosses: four nodes and the links between them. */
const NODES: Array<[number, number, string]> = [
  [86, 150, "Sources"],
  [280, 74, "One company"],
  [474, 150, "Plain language"],
  [668, 74, "Your decision"],
];

const LINKS: Array<[number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [0, 2],
];

/**
 * Each route: the node it enters by, the nodes it visits, and what it stops on.
 * The `d` strings are authored rather than generated, because a curve that
 * reads well is drawn, not computed.
 */
const ROUTES = [
  {
    key: "beginner",
    // Enters low-left, arcs up through the structure, arrives at the end.
    d: "M 20 208 C 60 208 60 184 86 150 C 132 96 210 74 280 74 C 360 74 420 118 474 150 C 540 186 600 96 668 74",
  },
  {
    key: "curious",
    // Comes in at the first node, stays on the company branch, then out.
    d: "M 20 108 C 52 88 62 150 86 150 C 160 150 220 76 280 74 C 330 92 400 128 474 150",
  },
  {
    key: "busy",
    // A direct line: sources, straight to the plain-language layer, then the
    // decision — the shortest route that still touches the structure.
    d: "M 20 150 L 86 150 C 200 150 360 132 474 150 C 560 164 620 96 668 74",
  },
] as const;

export function AudienceSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [prepared, setPrepared] = useState(false);
  /**
   * The finished state, for when no scene will draw the routes: reduced motion,
   * or a GSAP chunk that never arrived. It is only a CSS declaration, so a
   * running scene (which writes inline styles) always wins over it.
   */
  const [staticPaths, setStaticPaths] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setStaticPaths(true);
      return;
    }
    // If nothing has taken over by now, nothing is going to.
    const timer = window.setTimeout(() => setStaticPaths(true), 3500);
    return () => window.clearTimeout(timer);
  }, []);

  // The drawing is only prepared when the section is close.
  useEffect(() => {
    const element = ref.current;
    if (!element || prepared) return;
    return observeAhead(element, () => setPrepared(true));
  }, [prepared]);

  useScrollScene(ref, ({ gsap }) => {
    const scope = ref.current;
    if (!scope) return;

    const timeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: "[data-figure]",
        start: "top 78%",
        end: "bottom 52%",
        scrub: 0.6,
      },
    });

    // The structure first, then the three routes over it.
    timeline.fromTo(
      "[data-structure]",
      { opacity: 0 },
      { opacity: 1, duration: 0.8 },
      0,
    );
    timeline.fromTo(
      "[data-route-path]",
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 1.6, stagger: 0.35 },
      0.2,
    );
    timeline.fromTo(
      "[data-figure-node]",
      { opacity: 0, scale: 0.7 },
      { opacity: 1, scale: 1, transformOrigin: "center", duration: 0.5, stagger: 0.1 },
      0.5,
    );
  });

  return (
    <Section id="for-investors" labelledBy="audience-heading" className="relative overflow-hidden">
      <QRASectionTransition label="Understood" />

      {/* The room they stand in: a rendered mesh, not a photograph. */}
      <QRAAtmosphere variant="investor" />

      <div className="relative z-10" ref={ref} data-static={staticPaths ? "true" : "false"}>
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

            <QRAReveal delay={140} className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
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
          <div data-figure className="lg:sticky lg:top-24">
            <div className="figure-frame">
              <svg
                viewBox="0 0 760 260"
                className="qra-paths h-auto w-full"
                role="img"
                aria-label="Three routes through the same structure: from the sources, to one company, into plain language, and out to a decision"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* The structure: always present, never the subject. */}
                <g data-structure className="qra-paths__structure">
                  {LINKS.map(([from, to], index) => (
                    <line
                      key={index}
                      x1={NODES[from][0]}
                      y1={NODES[from][1]}
                      x2={NODES[to][0]}
                      y2={NODES[to][1]}
                      className="qra-paths__link"
                    />
                  ))}
                  {NODES.map(([x, y], index) => (
                    <g key={index}>
                      <circle cx={x} cy={y} r="16" className="qra-paths__halo" />
                      <circle data-figure-node cx={x} cy={y} r="3.6" className="qra-paths__node" />
                    </g>
                  ))}
                </g>

                {/* The three routes. */}
                <g className="qra-paths__routes">
                  {ROUTES.map((route, index) => (
                    <path
                      key={route.key}
                      data-route-path
                      data-route={route.key}
                      d={route.d}
                      pathLength={1}
                      className="qra-paths__route"
                      data-active={index === active ? "true" : "false"}
                    />
                  ))}
                </g>

                {/* The labels only exist once a route is picked. */}
                <g className="qra-paths__labels">
                  {NODES.map(([x, y, label], index) => (
                    <text
                      key={label}
                      x={x}
                      y={y < 100 ? y - 30 : y + 38}
                      textAnchor="middle"
                      className="qra-paths__label"
                      style={{ "--i": index } as React.CSSProperties}
                    >
                      {label}
                    </text>
                  ))}
                </g>
              </svg>

              {/* Which route is lit, in words, for anyone not using a pointer. */}
              <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="micro !tracking-[0.2em] !text-brand-400">Route</span>
                <span className="font-display text-sm font-semibold tracking-tight text-paper">
                  {AUDIENCE.people[active].title}
                </span>
                <span className="text-xs text-paper-mute">
                  — {ROUTES[active].key === "beginner" ? "the long way in" : ROUTES[active].key === "curious" ? "one company, in detail" : "the shortest route that still works"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
