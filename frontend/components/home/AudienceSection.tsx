"use client";

import { useEffect, useRef, useState } from "react";

import { QRADataField } from "@/components/motion/QRADataField";
import { QRAAtmosphere } from "@/components/motion/QRAAtmosphere";
import { QRASectionTransition } from "@/components/motion/QRASectionTransition";
import { QRAReveal } from "@/components/motion/QRAReveal";
import { Button, Section, SectionLabel } from "@/components/ui";
import { AUDIENCE } from "@/lib/content";
import { useScrollScene } from "@/components/motion/useScrollScene";

/**
 * For investors.
 *
 * There is no photograph here: the figure is drawn from the same thin lines and
 * nodes as the rest of the site, and it assembles itself as the section arrives.
 * The three readers are not a list of quotes but three paths through the same
 * structure — choosing one changes which part of the drawing is lit.
 */
export function AudienceSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setReady(true);
  }, []);

  useScrollScene(ref, ({ gsap }) => {
    const timeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: ref.current,
        start: "top 75%",
        end: "bottom 55%",
        scrub: 0.5,
      },
    });
    timeline.to("[data-draw]", { strokeDashoffset: 0, duration: 1.6, stagger: 0.08 });
    timeline.from("[data-node-line]", { opacity: 0, duration: 0.8, stagger: 0.05 }, "<0.3");
  });

  return (
    <Section id="for-investors" labelledBy="audience-heading" className="relative overflow-hidden">
      <QRASectionTransition label="Understood" />

      {/* The room the three readers sit in. */}
      <QRAAtmosphere variant="investor" />

      <QRADataField
        variant="organize"
        intensity={0.6}
        density={0.7}
        className="opacity-40"
      />

      <div className="relative z-10" ref={ref} data-ready={ready || undefined}>
        <QRAReveal>
          <SectionLabel tone="brand">{AUDIENCE.label}</SectionLabel>
          <h2
            id="audience-heading"
            className="mt-5 max-w-3xl font-display text-3xl font-semibold tracking-tightest text-paper sm:text-4xl lg:text-[2.6rem] lg:leading-[1.1]"
          >
            {AUDIENCE.statement}
          </h2>
        </QRAReveal>

        <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-16">
          {/* The figure: a profile built only from lines and nodes. */}
          <div className="relative">
            <svg
              viewBox="0 0 300 400"
              className="h-auto w-full"
              role="img"
              aria-label="A figure assembled from thin lines and data nodes, with three paths running through it"
            >
              <defs>
                <linearGradient id="qra-figure" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(245,247,250,0.34)" />
                  <stop offset="100%" stopColor="rgba(245,247,250,0.08)" />
                </linearGradient>
              </defs>

              {/* Head and shoulders, as coordinates rather than a portrait. */}
              <g fill="none" stroke="url(#qra-figure)" strokeWidth="1">
                <path
                  data-draw
                  strokeDasharray="220"
                  strokeDashoffset="220"
                  d="M150 44a34 34 0 1 1 0 68 34 34 0 0 1 0-68Z"
                />
                <path
                  data-draw
                  strokeDasharray="420"
                  strokeDashoffset="420"
                  d="M96 214c0-30 24-54 54-54s54 24 54 54"
                />
                <path
                  data-draw
                  strokeDasharray="460"
                  strokeDashoffset="460"
                  d="M62 264c22-22 54-34 88-34s66 12 88 34"
                />
                <path
                  data-draw
                  strokeDasharray="520"
                  strokeDashoffset="520"
                  d="M44 330c26-30 64-48 106-48s80 18 106 48"
                />
              </g>

              {/* The three paths through the structure. */}
              {AUDIENCE.people.map((person, index) => {
                const y = 130 + index * 92;
                const on = index === active;
                return (
                  <g key={person.n} opacity={on ? 1 : 0.28}>
                    <line
                      data-node-line
                      x1="20"
                      y1={y}
                      x2="280"
                      y2={y}
                      stroke={on ? "#3F6FFF" : "rgba(245,247,250,0.35)"}
                      strokeWidth="1"
                    />
                    {[0, 1, 2, 3, 4].map((slot) => (
                      <circle
                        key={slot}
                        data-node-line
                        cx={40 + slot * 55}
                        cy={y}
                        r={on && slot === 2 ? 3.4 : 1.6}
                        fill={on ? "#3F6FFF" : "rgba(245,247,250,0.5)"}
                      />
                    ))}
                    <text
                      x="20"
                      y={y - 12}
                      fill={on ? "rgba(245,247,250,0.85)" : "rgba(154,168,186,0.55)"}
                      fontSize="9"
                      letterSpacing="2"
                      fontFamily="ui-monospace, monospace"
                    >
                      {person.n}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div>
            <ol className="divide-y divide-line border-t border-line">
              {AUDIENCE.people.map((person, index) => {
                const on = index === active;
                return (
                  <li key={person.n}>
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
                  </li>
                );
              })}
            </ol>

            <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-display text-xl font-semibold tracking-tight text-paper">
                {AUDIENCE.closing}
              </p>
              <Button href="#waitlist" variant="outline" className="btn-lift">
                {AUDIENCE.cta}
                <span aria-hidden="true" className="btn-arrow">
                  →
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
