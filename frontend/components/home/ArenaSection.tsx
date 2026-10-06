"use client";

import { useState } from "react";

import { CandleChart } from "@/components/game/CandleChart";
import { QRAAtmosphere } from "@/components/motion/QRAAtmosphere";
import { QRAReveal } from "@/components/motion/QRAReveal";
import { QRASectionTransition } from "@/components/motion/QRASectionTransition";
import { Button, Section, SectionLabel } from "@/components/ui";
import { MARKET_ARENA, PREVIEW_LABEL } from "@/lib/content";

/**
 * MARKET ARENA — free play, once the levels have taught something.
 *
 * The interface makes one thing unmistakable: the future is withheld. The chart
 * stops, the remaining session is shown as concealed rather than merely absent,
 * and the panel says so in words as well. That constraint is the entire reason
 * the practice is worth anything, so it is the loudest thing in the section.
 *
 * Asset selection is live (it is the one control a visitor would try first);
 * everything else is a faithful mock. Practice capital only — no real money is
 * referenced anywhere in this section.
 */
export function ArenaSection() {
  const [asset, setAsset] = useState(0);

  return (
    <Section id="arena" labelledBy="arena-heading" className="relative overflow-hidden">
      <QRASectionTransition label="Free play" />
      <QRAAtmosphere variant="investor" />

      <div className="relative z-10">
        <QRAReveal>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <SectionLabel tone="brand">{MARKET_ARENA.label}</SectionLabel>
              <h2
                id="arena-heading"
                className="mt-5 font-display text-[2.1rem] font-semibold leading-[1.08] tracking-tightest text-paper sm:text-5xl sm:leading-[1.05] lg:text-[3.4rem]"
              >
                {MARKET_ARENA.statement.map((line, index) => (
                  <span key={line} className="block">
                    {line}
                    {index < MARKET_ARENA.statement.length - 1 ? " " : null}
                  </span>
                ))}
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-paper-mute lg:text-right">
              {MARKET_ARENA.support}
            </p>
          </div>
        </QRAReveal>

        <div className="mt-14 grid gap-10 lg:mt-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-start lg:gap-14">
          {/* The arena interface. */}
          <QRAReveal variant="clip">
            <div className="overflow-hidden rounded-xl border border-line-strong bg-ink-900/95">
              <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
                <span className="micro !text-brand-400">{MARKET_ARENA.label}</span>
                <span className="micro">{PREVIEW_LABEL}</span>
              </div>

              {/* Asset selection. */}
              <div className="border-b border-line-faint px-5 py-5">
                <p className="micro">{MARKET_ARENA.chooseLabel}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {MARKET_ARENA.assets.map((name, index) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setAsset(index)}
                      aria-pressed={index === asset}
                      className={`arena-asset ${index === asset ? "arena-asset--on" : ""}`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              {/* The session, with most of it withheld. */}
              <div className="px-5 py-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="micro">Historical session</p>
                    <p className="mt-2 font-display text-lg font-semibold tracking-tight text-paper">
                      {MARKET_ARENA.assets[asset]}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="micro">{MARKET_ARENA.capitalLabel}</p>
                    <p className="mt-2 font-mono text-sm text-paper">{MARKET_ARENA.capital}</p>
                  </div>
                </div>

                <CandleChart played={0.42} className="mt-5 h-44 sm:h-52" />
              </div>

              {/* The constraint, stated where it cannot be missed. */}
              <div className="flex items-center justify-between gap-4 border-y border-line bg-ink-850/70 px-5 py-4">
                <span className="micro">{MARKET_ARENA.hiddenLabel}</span>
                <span className="arena-hidden">
                  <span aria-hidden="true" className="arena-hidden__lock">
                    ▨
                  </span>
                  {MARKET_ARENA.hiddenValue}
                </span>
              </div>

              {/* The three decisions. Nothing else is offered. */}
              <div className="px-5 py-5">
                <p className="font-display text-base font-semibold tracking-tight text-paper">
                  What would you do?
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {MARKET_ARENA.decisions.map((decision) => (
                    <span key={decision} className="arena-decision">
                      {decision}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-paper-faint">
              {MARKET_ARENA.disclaimer}
            </p>
          </QRAReveal>

          {/* What the arena is for, in three short movements. */}
          <div className="lg:pt-4">
            <QRAReveal variant="fade" stagger step={110}>
              <ol className="space-y-8">
                {[
                  {
                    n: "01",
                    title: "A real session, stopped",
                    body: "A historical market is played forward and paused. Everything after this point is concealed.",
                  },
                  {
                    n: "02",
                    title: "You decide, alone",
                    body: "No hint, no signal, no suggested answer. Buy, sell or wait — and set the risk you are willing to take.",
                  },
                  {
                    n: "03",
                    title: "History answers",
                    body: "The session plays on. Your decision is scored on its reasoning and its risk, not on whether it happened to pay.",
                  },
                ].map((step) => (
                  <li key={step.n} className="arena-note">
                    <span className="font-mono text-xs text-brand-400">{step.n}</span>
                    <p className="mt-2.5 font-display text-xl font-semibold tracking-tight text-paper">
                      {step.title}
                    </p>
                    <p className="mt-2.5 text-sm leading-relaxed text-paper-dim">{step.body}</p>
                  </li>
                ))}
              </ol>
            </QRAReveal>

            <QRAReveal delay={100}>
              <p className="mt-10 border-l border-brand-500/60 pl-4 font-display text-lg font-medium tracking-tight text-paper">
                {MARKET_ARENA.note}
              </p>
              <div className="mt-8">
                <Button href="#score" variant="outline" className="btn-lift">
                  How scoring works
                  <span aria-hidden="true" className="btn-arrow">
                    →
                  </span>
                </Button>
              </div>
            </QRAReveal>
          </div>
        </div>
      </div>
    </Section>
  );
}
