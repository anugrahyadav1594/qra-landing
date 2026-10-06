"use client";

import { QRAAtmosphere } from "@/components/motion/QRAAtmosphere";
import { QRAReveal } from "@/components/motion/QRAReveal";
import { QRASectionTransition } from "@/components/motion/QRASectionTransition";
import { QRATilt } from "@/components/motion/QRATilt";
import { Button, Section, SectionLabel } from "@/components/ui";
import { EXPERIENCE, PREVIEW_LABEL } from "@/lib/content";

/**
 * THE EXPERIENCE — the whole product, on the landing page, in one screen.
 *
 * The landing page shows the product once and moves on: a single, confident
 * look at the game, beside two short doors (level mode, market arena) and four
 * facts that settle the shape of it. The detail — the level list, the arena
 * interface, the scoring, the board — lives on the product page, linked twice
 * over. This keeps the landing page a pitch and the product page the tour.
 *
 * The generated concept screen is the centrepiece. It leans toward the
 * pointer like the rest of the site's interfaces, and it carries the one thing
 * no amount of copy can: the future, visibly withheld.
 */
export function ExperienceSection() {
  return (
    <Section
      id="experience"
      tone="raised"
      labelledBy="experience-heading"
      className="relative overflow-hidden"
    >
      <QRASectionTransition label="The experience" />
      <QRAAtmosphere variant="product" />

      <div className="relative z-10">
        <QRAReveal>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <SectionLabel tone="brand">{EXPERIENCE.label}</SectionLabel>
              <h2
                id="experience-heading"
                className="mt-5 font-display text-[2.1rem] font-semibold leading-[1.08] tracking-tightest text-paper sm:text-5xl sm:leading-[1.05] lg:text-[3.4rem]"
              >
                {EXPERIENCE.statement.map((line, index) => (
                  <span key={line} className="block">
                    {line}
                    {index < EXPERIENCE.statement.length - 1 ? " " : null}
                  </span>
                ))}
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-paper-mute lg:text-right">
              {EXPERIENCE.support}
            </p>
          </div>
        </QRAReveal>

        <div className="mt-14 grid gap-10 lg:mt-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center lg:gap-14">
          {/* The concept screen. */}
          <QRAReveal variant="clip">
            <QRATilt>
              <div className="experience-frame relative overflow-hidden rounded-xl border border-line-strong bg-ink-900/95">
                <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
                  <span className="micro !text-brand-400">{EXPERIENCE.screenLabel}</span>
                  <span className="micro">{PREVIEW_LABEL}</span>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/screen-replay.jpg"
                  alt="A QRA market-replay session paused at a decision: candlestick chart with the future withheld, buy, sell and wait choices, a risk meter and an experience reward."
                  width={1280}
                  height={800}
                  loading="lazy"
                  decoding="async"
                  className="block h-auto w-full"
                />
              </div>
            </QRATilt>
            <p className="mt-3 text-xs leading-relaxed text-paper-faint">{EXPERIENCE.screenNote}</p>
          </QRAReveal>

          {/* The two doors, and the facts. */}
          <div>
            <QRAReveal variant="fade" stagger step={90}>
              <div className="flex flex-col gap-4">
                {EXPERIENCE.modes.map((mode) => (
                  <a key={mode.n} href={mode.href} className="exp-mode">
                    <span className="exp-mode__num">{mode.n}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline gap-3">
                        <span className="font-display text-xl font-semibold tracking-tight text-paper">
                          {mode.title}
                        </span>
                        <span aria-hidden="true" className="exp-mode__arrow">
                          →
                        </span>
                      </span>
                      <span className="mt-2 block text-sm leading-relaxed text-paper-dim">
                        {mode.body}
                      </span>
                    </span>
                  </a>
                ))}
              </div>
            </QRAReveal>

            <QRAReveal delay={110}>
              <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-4">
                {EXPERIENCE.facts.map((fact) => (
                  <div key={fact.label} className="exp-fact">
                    <dt className="order-2 mt-1.5 block text-[0.66rem] uppercase tracking-[0.12em] text-paper-faint">
                      {fact.label}
                    </dt>
                    <dd className="order-1 font-mono text-2xl tracking-tight text-brand-300">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </QRAReveal>

            <QRAReveal delay={150}>
              <div className="mt-8">
                <Button href="/product" size="lg" className="btn-lift">
                  {EXPERIENCE.cta}
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
