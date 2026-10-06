"use client";

import { QRAReveal } from "@/components/motion/QRAReveal";
import { QRASectionTransition } from "@/components/motion/QRASectionTransition";
import { Button, Section, SectionLabel } from "@/components/ui";
import { LEADERBOARD, PREVIEW_LABEL } from "@/lib/content";

/**
 * LEADERBOARD — competition, kept secondary to learning.
 *
 * The table is the familiar shape, because familiarity is what makes the rank
 * legible at a glance, and the player's own row is pulled out of sequence and
 * pinned so the comparison is immediate. But the section states twice, in
 * different words, that the ranking is about decision quality rather than
 * money — a leaderboard measured in profit would quietly undo everything the
 * rest of the page argues.
 */
export function LeaderboardSection() {
  return (
    <Section id="leaderboard" labelledBy="leaderboard-heading" className="relative overflow-hidden">
      <QRASectionTransition label="Standing" />

      <div className="relative z-10">
        <QRAReveal>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <SectionLabel tone="brand">{LEADERBOARD.label}</SectionLabel>
              <h2
                id="leaderboard-heading"
                className="mt-5 font-display text-[2.1rem] font-semibold leading-[1.08] tracking-tightest text-paper sm:text-5xl sm:leading-[1.05] lg:text-[3.4rem]"
              >
                {LEADERBOARD.statement.map((line, index) => (
                  <span key={line} className="block">
                    {line}
                    {index < LEADERBOARD.statement.length - 1 ? " " : null}
                  </span>
                ))}
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-paper-mute lg:text-right">
              {LEADERBOARD.support}
            </p>
          </div>
        </QRAReveal>

        <div className="mt-14 grid gap-10 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start lg:gap-14">
          <div>
            <QRAReveal variant="clip">
              <div className="overflow-hidden rounded-xl border border-line-strong bg-ink-900/95">
                <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
                  <span className="micro !text-brand-400">{LEADERBOARD.week}</span>
                  <span className="micro">{PREVIEW_LABEL}</span>
                </div>

                <table className="w-full border-collapse text-left">
                  <caption className="sr-only">
                    Weekly leaderboard, ranked on decision quality in experience points
                  </caption>
                  <thead>
                    <tr className="border-b border-line-faint">
                      <th scope="col" className="micro px-5 py-3 font-semibold">
                        Rank
                      </th>
                      <th scope="col" className="micro px-3 py-3 font-semibold">
                        Player
                      </th>
                      <th scope="col" className="micro px-5 py-3 text-right font-semibold">
                        XP
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {LEADERBOARD.rows.map((row) => (
                      <tr key={row.rank} className="board-row border-b border-line-faint">
                        <th scope="row" className="px-5 py-3.5 font-mono text-xs font-normal text-paper-mute">
                          {row.rank}
                        </th>
                        <td className="px-3 py-3.5 text-sm text-paper">{row.name}</td>
                        <td className="px-5 py-3.5 text-right font-mono text-sm text-paper-dim">
                          {row.xp}
                        </td>
                      </tr>
                    ))}

                    {/* The gap, then the player — the comparison is the point. */}
                    <tr aria-hidden="true">
                      <td colSpan={3} className="board-gap px-5 py-3 text-center font-mono text-[0.68rem] text-paper-faint">
                        ⋮
                      </td>
                    </tr>
                    <tr className="board-row board-row--you">
                      <th scope="row" className="px-5 py-4 font-mono text-xs font-normal text-brand-300">
                        {LEADERBOARD.you.rank}
                      </th>
                      <td className="px-3 py-4 font-display text-sm font-semibold tracking-tight text-paper">
                        {LEADERBOARD.you.name}
                      </td>
                      <td className="px-5 py-4 text-right font-mono text-sm text-paper">
                        {LEADERBOARD.you.xp}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <p className="border-t border-line bg-ink-850/60 px-5 py-4 text-sm text-paper-dim">
                  {LEADERBOARD.percentile}
                </p>
              </div>
            </QRAReveal>

            <p className="mt-3 text-xs leading-relaxed text-paper-faint">
              {PREVIEW_LABEL}. Ranks and scores are placeholders, not real players.
            </p>
          </div>

          <div className="lg:pt-4">
            <QRAReveal>
              <p className="micro">What the ranking measures</p>
              <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {["Decision quality", "Risk management", "Timing", "Consistency"].map((item) => (
                  <li key={item} className="flex items-baseline gap-3 border-b border-line-faint py-2.5">
                    <span aria-hidden="true" className="h-1 w-1 shrink-0 rounded-full bg-brand-400" />
                    <span className="text-sm text-paper-dim">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs leading-relaxed text-paper-faint">
                Profit is not one of them. A lucky outcome scores lower than a sound decision that
                happened to lose.
              </p>
            </QRAReveal>

            <QRAReveal delay={110}>
              <div className="mt-10 border-t border-line pt-8">
                {LEADERBOARD.closing.map((line, index) => (
                  <p
                    key={line}
                    className={`font-display text-xl font-semibold tracking-tight sm:text-2xl ${
                      index === 1 ? "mt-2 text-brand-300" : "text-paper"
                    }`}
                  >
                    {line}
                  </p>
                ))}
                <div className="mt-8">
                  <Button href="#waitlist" variant="outline" className="btn-lift">
                    Join the waitlist
                    <span aria-hidden="true" className="btn-arrow">
                      →
                    </span>
                  </Button>
                </div>
              </div>
            </QRAReveal>
          </div>
        </div>
      </div>
    </Section>
  );
}
