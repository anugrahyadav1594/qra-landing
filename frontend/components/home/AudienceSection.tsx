"use client";

import { useEffect, useRef, useState } from "react";

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

        <div className="mt-14">
          <div>
            {/* The rule that opens the list draws from its left edge first. */}
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
        </div>
      </div>
    </Section>
  );
}
