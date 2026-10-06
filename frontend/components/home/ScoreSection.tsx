"use client";

import { QRAReveal } from "@/components/motion/QRAReveal";
import { QRASectionTransition } from "@/components/motion/QRASectionTransition";
import { Section, SectionLabel } from "@/components/ui";
import { SCORE } from "@/lib/content";

/**
 * SCORE & PROGRESS — what the product actually measures.
 *
 * This section exists to settle the question the arena raises: "scored on
 * what?" The four categories are the answer, and they are deliberately all
 * about process. Nothing here is denominated in money, because a metric
 * denominated in money would teach people to chase outcomes instead of
 * reasoning — the exact opposite of the product's premise.
 */
export function ScoreSection() {
  const progress = Math.min(1, SCORE.xp / SCORE.xpNext);

  return (
    <Section
      id="score"
      tone="deep"
      labelledBy="score-heading"
      className="relative overflow-hidden"
    >
      <QRASectionTransition label="Measured" />

      <div className="relative z-10">
        <QRAReveal>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <SectionLabel tone="brand">{SCORE.label}</SectionLabel>
              <h2
                id="score-heading"
                className="mt-5 font-display text-[2.1rem] font-semibold leading-[1.08] tracking-tightest text-paper sm:text-5xl sm:leading-[1.05] lg:text-[3.4rem]"
              >
                {SCORE.statement.map((line, index) => (
                  <span key={line} className="block">
                    {line}
                    {index < SCORE.statement.length - 1 ? " " : null}
                  </span>
                ))}
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-paper-mute lg:text-right">
              {SCORE.support}
            </p>
          </div>
        </QRAReveal>

        <div className="mt-14 grid gap-10 lg:mt-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14">
          {/* The four things a decision is scored on. */}
          <QRAReveal variant="fade" stagger step={90}>
            <ul className="space-y-7">
              {SCORE.categories.map((category) => (
                <li key={category.label}>
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="font-display text-base font-semibold tracking-tight text-paper sm:text-lg">
                      {category.label}
                    </p>
                    <span className="font-mono text-sm text-paper-dim">{category.value}</span>
                  </div>
                  <span className="score-bar mt-3 block" aria-hidden="true">
                    <span
                      className="score-bar__fill"
                      style={{ "--score": `${category.value}%` } as React.CSSProperties}
                    />
                  </span>
                  <p className="mt-2.5 text-sm leading-relaxed text-paper-mute">{category.detail}</p>
                </li>
              ))}
            </ul>
          </QRAReveal>

          {/* Where that leaves the player. */}
          <QRAReveal variant="clip" delay={120}>
            <div className="score-panel">
              <div className="flex items-baseline justify-between gap-4 border-b border-line px-6 py-5">
                <span className="micro">Progress</span>
                <span className="font-mono text-xs text-brand-400">LEVEL {SCORE.level}</span>
              </div>

              <div className="px-6 py-6">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="font-mono text-3xl tracking-tight text-paper">
                      {SCORE.xp.toLocaleString("en-IN")}
                      <span className="ml-1.5 text-base text-paper-mute">XP</span>
                    </p>
                    <p className="mt-2 text-xs text-paper-faint">
                      {(SCORE.xpNext - SCORE.xp).toLocaleString("en-IN")} XP to level{" "}
                      {SCORE.level + 1}
                    </p>
                  </div>
                  {/* The level pips: a compact sense of a longer climb. */}
                  <span className="flex gap-1" aria-hidden="true">
                    {Array.from({ length: 12 }, (_, index) => (
                      <span
                        key={index}
                        className={`level-pip ${index < SCORE.level ? "level-pip--on" : ""}`}
                      />
                    ))}
                  </span>
                </div>

                <span className="score-bar score-bar--lg mt-6 block" aria-hidden="true">
                  <span
                    className="score-bar__fill"
                    style={{ "--score": `${progress * 100}%` } as React.CSSProperties}
                  />
                </span>

                <dl className="mt-7 space-y-3.5 border-t border-line-faint pt-6">
                  {[
                    { term: "Scenarios played", detail: "48" },
                    { term: "Decisions made alone", detail: "31" },
                    { term: "Levels unlocked", detail: "7 of 12" },
                  ].map((row) => (
                    <div key={row.term} className="flex items-baseline justify-between gap-4">
                      <dt className="text-sm text-paper-dim">{row.term}</dt>
                      <dd className="font-mono text-sm text-paper">{row.detail}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <p className="border-t border-line bg-ink-850/60 px-6 py-4 text-xs leading-relaxed text-paper-faint">
                {SCORE.note}
              </p>
            </div>
          </QRAReveal>
        </div>
      </div>
    </Section>
  );
}
