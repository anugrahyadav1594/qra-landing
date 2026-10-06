"use client";

import { useState } from "react";

import { QRAReveal } from "@/components/motion/QRAReveal";
import { QRASectionTransition } from "@/components/motion/QRASectionTransition";
import { Button, Section, SectionLabel } from "@/components/ui";
import { LEARNERS } from "@/lib/content";

/**
 * FOR LEARNERS — three starting points, one loop.
 *
 * The three people are not three personas for decoration; they enter the same
 * progression at different points, and the drawing says so. Pointing at a
 * person moves the marker to the stage they would actually start at — a
 * beginner at "learn", someone who already reads charts at "practise", someone
 * who already trades at "decide".
 *
 * That single interaction carries the section's whole claim: the route is the
 * same for everyone, only the entry point changes. It is a class change on one
 * element, so it costs nothing and works under reduced motion.
 */

/** Which stage of the progression each person enters at. */
const ENTRY_STAGE = [0, 1, 2] as const;

const ENTRY_NOTES = [
  "starts at the beginning, with nothing assumed",
  "skips the basics and goes straight to practice",
  "enters at the decision, to test a process they already have",
] as const;

export function LearnersSection() {
  const [active, setActive] = useState(0);
  const entry = ENTRY_STAGE[active];

  return (
    <Section
      id="for-learners"
      labelledBy="learners-heading"
      className="relative overflow-hidden"
    >
      <QRASectionTransition label="For learners" />

      <div className="relative z-10">
        <QRAReveal>
          <SectionLabel tone="brand">{LEARNERS.label}</SectionLabel>
          <h2
            id="learners-heading"
            className="mt-5 max-w-3xl font-display text-3xl font-semibold tracking-tightest text-paper sm:text-4xl lg:text-[2.6rem] lg:leading-[1.1]"
          >
            {LEARNERS.statement}
          </h2>
        </QRAReveal>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-start lg:gap-16">
          {/* ── The three learners ──────────────────────────────────────── */}
          <div>
            <QRAReveal variant="line" className="border-t border-line" />
            <ol className="divide-y divide-line">
              {LEARNERS.people.map((person, index) => {
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
              <p className="max-w-xs font-display text-xl font-semibold tracking-tight text-paper">
                {LEARNERS.closing}
              </p>
              <Button href="#waitlist" variant="outline" className="btn-lift">
                {LEARNERS.cta}
                <span aria-hidden="true" className="btn-arrow">
                  →
                </span>
              </Button>
            </QRAReveal>
          </div>

          {/* ── The progression, and where this person enters it ────────── */}
          <div className="lg:sticky lg:top-24">
            <QRAReveal variant="clip">
              <div className="figure-frame">
                <p className="micro">The loop</p>

                <ol className="progression mt-6">
                  {LEARNERS.progression.map((stage, index) => {
                    const isEntry = index === entry;
                    const passed = index < entry;
                    return (
                      <li
                        key={stage}
                        className={`progression__step ${isEntry ? "progression__step--entry" : ""} ${
                          passed ? "progression__step--passed" : ""
                        }`}
                      >
                        <span className="progression__node" aria-hidden="true">
                          <span className="progression__node-dot" />
                        </span>
                        <span className="flex flex-1 items-baseline justify-between gap-3">
                          <span className="font-display text-lg font-semibold tracking-tight text-paper">
                            {stage}
                          </span>
                          <span className="font-mono text-[0.68rem] text-paper-faint">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        </span>
                        {isEntry && (
                          <span className="progression__flag" aria-hidden="true">
                            enters here
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ol>

                {/* Which entry point is lit, in words — the drawing is never the
                    only way to read the section. */}
                <div className="mt-6 border-t border-line pt-5">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="micro !tracking-[0.2em] !text-brand-400">Entry point</span>
                    <span className="font-display text-sm font-semibold tracking-tight text-paper">
                      {LEARNERS.people[active].title}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-paper-mute">
                    {ENTRY_NOTES[active]}
                  </p>
                </div>
              </div>
            </QRAReveal>
          </div>
        </div>
      </div>
    </Section>
  );
}
