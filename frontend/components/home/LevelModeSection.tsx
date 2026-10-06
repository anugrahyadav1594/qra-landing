"use client";

import { useState } from "react";

import { QRAAtmosphere } from "@/components/motion/QRAAtmosphere";
import { QRAReveal } from "@/components/motion/QRAReveal";
import { QRASectionTransition } from "@/components/motion/QRASectionTransition";
import { Button, Section, SectionLabel } from "@/components/ui";
import { LEVEL_MODE, type Level, type LevelStatus } from "@/lib/content";

/**
 * LEVEL MODE — one market skill at a time.
 *
 * The section is laid out as a progression rather than as a grid, because a
 * progression is the thing being described: five levels stacked on a spine,
 * each carrying its own state (complete, in progress, locked), and a detail
 * panel beside them that answers the only question a visitor actually has —
 * "what happens inside one of these?"
 *
 * The detail is driven by selection, not by hover alone, so it works on a
 * touchscreen and with a keyboard. The first unlocked level is selected on
 * load, which is where a new player would actually be.
 */

const STATUS_LABEL: Record<LevelStatus, string> = {
  complete: "Complete",
  available: "Available",
  locked: "Locked",
};

/** The default selection: the furthest level the player has reached. */
function initialSelection(levels: readonly Level[]): number {
  const lastAvailable = levels.reduce(
    (best, level, index) => (level.status !== "locked" ? index : best),
    0,
  );
  return lastAvailable;
}

export function LevelModeSection() {
  const [selected, setSelected] = useState(() => initialSelection(LEVEL_MODE.levels));
  const level = LEVEL_MODE.levels[selected];

  return (
    <Section
      id="level-mode"
      tone="raised"
      labelledBy="level-mode-heading"
      className="relative overflow-hidden"
    >
      <QRASectionTransition label="Level mode" />
      <QRAAtmosphere variant="product" />

      <div className="relative z-10">
        <QRAReveal>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <SectionLabel tone="brand">{LEVEL_MODE.label}</SectionLabel>
              <h2
                id="level-mode-heading"
                className="mt-5 font-display text-[2.1rem] font-semibold leading-[1.08] tracking-tightest text-paper sm:text-5xl sm:leading-[1.05] lg:text-[3.4rem]"
              >
                {LEVEL_MODE.statement.map((line, index) => (
                  <span key={line} className="block">
                    {line}
                    {index < LEVEL_MODE.statement.length - 1 ? " " : null}
                  </span>
                ))}
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-paper-mute lg:text-right">
              {LEVEL_MODE.support}
            </p>
          </div>
        </QRAReveal>

        <div className="mt-14 grid gap-10 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14">
          {/* The progression. A spine runs behind the cards so the five read as
              one route with a position on it, not as five separate features. */}
          <div className="relative">
            <span aria-hidden="true" className="level-spine" />
            <QRAReveal variant="fade" stagger step={80}>
              <ol className="space-y-3">
                {LEVEL_MODE.levels.map((item, index) => {
                  const active = index === selected;
                  return (
                    <li key={item.n}>
                      <button
                        type="button"
                        onClick={() => setSelected(index)}
                        aria-pressed={active}
                        aria-label={`Level ${item.n}, ${item.title}, ${STATUS_LABEL[item.status]}`}
                        className={`level-card ${active ? "level-card--active" : ""} ${
                          item.status === "locked" ? "level-card--locked" : ""
                        }`}
                      >
                        <span className="level-card__node" aria-hidden="true">
                          <span className="level-card__node-dot" />
                        </span>

                        <span className="flex min-w-0 flex-1 flex-col gap-2.5">
                          <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <span className="font-mono text-[0.68rem] tracking-[0.16em] text-brand-400">
                              LEVEL {item.n}
                            </span>
                            <span
                              className={`level-status level-status--${item.status}`}
                            >
                              {STATUS_LABEL[item.status]}
                            </span>
                          </span>

                          <span className="font-display text-lg font-semibold tracking-tight text-paper sm:text-xl">
                            {item.title}
                          </span>

                          <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
                            {/* Progress pips — the game's smallest unit of state. */}
                            <span className="flex gap-1" aria-hidden="true">
                              {Array.from({ length: item.total }, (_, pip) => (
                                <span
                                  key={pip}
                                  className={`level-pip ${pip < item.done ? "level-pip--on" : ""}`}
                                />
                              ))}
                            </span>
                            <span className="font-mono text-[0.7rem] text-paper-mute">
                              {item.done} / {item.total} challenges
                            </span>
                            <span className="level-xp">{item.xp}</span>
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </QRAReveal>

            <p className="mt-5 pl-9 text-xs leading-relaxed text-paper-faint">{LEVEL_MODE.more}</p>
          </div>

          {/* What one level actually contains. */}
          <QRAReveal variant="clip" delay={120}>
            <div className="level-detail h-full">
              <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
                <div>
                  <p className="font-mono text-[0.68rem] tracking-[0.16em] text-brand-400">
                    LEVEL {level.n}
                  </p>
                  <p className="mt-2 font-display text-2xl font-semibold tracking-tight text-paper">
                    {level.title}
                  </p>
                </div>
                <span className={`level-status level-status--${level.status}`}>
                  {STATUS_LABEL[level.status]}
                </span>
              </div>

              <dl className="divide-y divide-[rgba(245,247,250,0.06)]">
                {[
                  { term: "Learn", detail: level.learn },
                  { term: "Practice", detail: level.practice },
                  { term: "Challenge", detail: level.challenge },
                ].map((row) => (
                  <div key={row.term} className="px-6 py-5">
                    <dt className="micro">{row.term}</dt>
                    <dd className="mt-2 text-sm leading-relaxed text-paper-dim">{row.detail}</dd>
                  </div>
                ))}
              </dl>

              <div className="flex items-center justify-between gap-4 border-t border-line bg-ink-850/60 px-6 py-5">
                <div>
                  <p className="micro">Reward</p>
                  <p className="mt-1.5 font-mono text-sm text-paper">{level.xp}</p>
                </div>
                <p className="max-w-[15rem] text-right text-xs leading-relaxed text-paper-faint">
                  The guided steps are withdrawn before the challenge. That is the point of the
                  level.
                </p>
              </div>
            </div>
          </QRAReveal>
        </div>

        {/* The loop inside a level, stated once, in order. */}
        <QRAReveal delay={80}>
          <div className="mt-14 border-t border-line pt-8">
            <p className="micro">Inside every level</p>
            <ol className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-3">
              {LEVEL_MODE.flow.map((step, index) => (
                <li key={step} className="flex items-center gap-3">
                  <span className="level-flow__step">{step}</span>
                  {index < LEVEL_MODE.flow.length - 1 && (
                    <span aria-hidden="true" className="level-flow__arrow">
                      →
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </QRAReveal>

        <QRAReveal delay={120}>
          <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-md font-display text-xl font-semibold tracking-tight text-paper sm:text-2xl">
              {LEVEL_MODE.statement[1]}
            </p>
            <Button href="#arena" variant="outline" className="btn-lift">
              See the arena
              <span aria-hidden="true" className="btn-arrow">
                →
              </span>
            </Button>
          </div>
        </QRAReveal>
      </div>
    </Section>
  );
}
