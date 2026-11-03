"use client";

import Link from "next/link";
import { useRef } from "react";

import {
  CandleTicker,
  ChampionEmblem,
  CornerMarks,
  MeasurementRings,
  MerchandiseStack,
  PodiumPlatform,
  TickRule,
} from "@/components/tournament/motifs";
import {
  CoordNote,
  SectionIntro,
  StatusTag,
  Surface,
  TechLabel,
} from "@/components/tournament/primitives";
import { loadGsap, useIsomorphicLayoutEffect } from "@/lib/gsap";
import { formatINR, type TournamentConfig } from "@/lib/tournament";

/** Champion first on mobile, centre of the podium from sm upwards. */
const ORDER = ["order-first sm:order-2", "sm:order-1", "sm:order-3"];

type Tier = {
  key: string;
  index: string;
  rank: string;
  label: string;
  amount: number;
  note: string;
  accent: boolean;
};

/**
 * SECTION 02 — THE CHAMPIONSHIP PRIZE ARENA
 *
 * Four layers: an arena-inspired technical environment, an editorial
 * introduction with the total-prize panel, a championship podium, and the
 * merit / merchandise allocations. GSAP ScrollTrigger drives four
 * independent, once-only entrance timelines; every value comes from the
 * configured prize pool and the allocation split is derived, never typed.
 *
 * Without JavaScript — or with reduced motion — the section renders in its
 * final state: nothing is hidden by CSS waiting for an animation.
 */
export function PrizePool({ config }: { config: TournamentConfig }) {
  const root = useRef<HTMLElement | null>(null);

  const cash = config.cash_prize_pool;
  const goodies = config.goodies_and_merchandise;
  const total = config.prize_pool_total || cash + goodies;
  const cashShare = total > 0 ? Math.round((cash / total) * 100) : 0;
  const goodiesShare = total > 0 ? 100 - cashShare : 0;

  const tiers: Tier[] = [
    {
      key: "champion",
      index: "P-01",
      rank: "01",
      label: "Champion",
      amount: config.champion_prize,
      note: "The highest honour of the tournament",
      accent: true,
    },
    {
      key: "first",
      index: "P-02",
      rank: "02",
      label: "First Runner-up",
      amount: config.first_runner_up_prize,
      note: "Second place on the podium",
      accent: false,
    },
    {
      key: "second",
      index: "P-03",
      rank: "03",
      label: "Second Runner-up",
      amount: config.second_runner_up_prize,
      note: "Third place on the podium",
      accent: false,
    },
  ];

  /* ── Animation: four independent, once-only scroll timelines ───────── */
  useIsomorphicLayoutEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    loadGsap().then((mod) => {
      if (!mod || cancelled || !root.current) return;
      const { gsap } = mod;

      ctx = gsap.context(() => {
        const mm = gsap.matchMedia();

        /* Group A — total allocation panel (~2.0s) */
        mm.add("(prefers-reduced-motion: no-preference)", () => {
          const panel = root.current?.querySelector('[data-prize="panel"]');
          if (!panel) return;
          const numberEl = panel.querySelector<HTMLElement>('[data-prize="number"]');
          const counter = { value: 0 };

          const timeline = gsap.timeline({
            defaults: { ease: "power3.out" },
            scrollTrigger: { trigger: panel, start: "top 82%", once: true },
            onComplete: () => {
              gsap.set(panel.querySelectorAll("[data-anim-target]"), { clearProps: "willChange" });
            },
          });

          timeline
            .fromTo(
              panel.querySelectorAll("[data-prize-corner]"),
              { opacity: 0, scale: 0.55 },
              { opacity: 1, scale: 1, duration: 0.3, stagger: 0.09, ease: "power2.out" },
            )
            .fromTo(
              panel.querySelectorAll("[data-prize='frame']"),
              { opacity: 0 },
              { opacity: 1, duration: 0.5 },
              0,
            )
            .fromTo(
              numberEl,
              { opacity: 0, y: 26 },
              { opacity: 1, y: 0, duration: 0.6 },
              0.26,
            )
            .to(
              counter,
              {
                value: total,
                duration: 0.9,
                ease: "power2.out",
                snap: { value: 1000 },
                onUpdate: () => {
                  if (numberEl) numberEl.textContent = formatINR(counter.value);
                },
                onComplete: () => {
                  if (numberEl) numberEl.textContent = formatINR(total);
                },
              },
              0.32,
            )
            .fromTo(
              panel.querySelector('[data-prize-bar="cash"]'),
              { scaleX: 0 },
              { scaleX: 1, duration: 0.55, transformOrigin: "left center" },
              0.78,
            )
            .fromTo(
              panel.querySelector('[data-prize-bar="goodies"]'),
              { scaleX: 0 },
              { scaleX: 1, duration: 0.45, transformOrigin: "left center" },
              1.08,
            )
            .fromTo(
              panel.querySelectorAll("[data-prize-legend]"),
              { opacity: 0, y: 10 },
              { opacity: 1, y: 0, duration: 0.42, stagger: 0.12 },
              1.18,
            );

          gsap.set(panel.querySelectorAll("[data-anim-target]"), { willChange: "transform" });
        });

        /* Group B — championship podium */
        mm.add("(prefers-reduced-motion: no-preference)", () => {
          const podium = root.current?.querySelector('[data-prize="podium"]');
          if (!podium) return;
          const cards = podium.querySelectorAll("[data-podium-card]");
          const champion = podium.querySelector('[data-podium-card="1"]');

          const timeline = gsap.timeline({
            defaults: { ease: "power3.out" },
            scrollTrigger: { trigger: podium, start: "top 80%", once: true },
            onComplete: () => {
              gsap.set(cards, { clearProps: "willChange" });
            },
          });

          timeline
            .fromTo(
              podium.querySelector('[data-podium="baseline"]'),
              { scaleX: 0 },
              { scaleX: 1, duration: 0.4, transformOrigin: "center center" },
            )
            .fromTo(
              podium.querySelector('[data-podium-card="2"]'),
              { opacity: 0, y: 40 },
              { opacity: 1, y: 0, duration: 0.6 },
              0.14,
            )
            .fromTo(
              podium.querySelector('[data-podium-card="3"]'),
              { opacity: 0, y: 40 },
              { opacity: 1, y: 0, duration: 0.6 },
              0.26,
            )
            .fromTo(
              champion,
              { opacity: 0, y: 54, scale: 0.985 },
              { opacity: 1, y: 0, scale: 1, duration: 0.75 },
              0.38,
            )
            .fromTo(
              podium.querySelectorAll("[data-podium-rank]"),
              { opacity: 0, scale: 0.82 },
              { opacity: 1, scale: 1, duration: 0.3, stagger: 0.06, ease: "power2.out" },
              0.95,
            )
            .fromTo(
              podium.querySelectorAll("[data-podium-amount]"),
              { opacity: 0, y: 14 },
              { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 },
              1.05,
            )
            .fromTo(
              podium.querySelector('[data-podium="champion-edge"]'),
              { opacity: 0, scaleX: 0.35 },
              { opacity: 1, scaleX: 1, duration: 0.5, transformOrigin: "left center" },
              1.22,
            );

          gsap.set(cards, { willChange: "transform" });

          /* One restrained light sweep across the champion — desktop only */
          mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
            const sweep = podium.querySelector('[data-podium="sweep"]');
            if (!sweep) return;
            gsap.fromTo(
              sweep,
              { xPercent: -140 },
              {
                xPercent: 140,
                duration: 0.7,
                ease: "power2.inOut",
                delay: 1.45,
                scrollTrigger: { trigger: podium, start: "top 80%", once: true },
              },
            );
          });
        });

        /* Group C — merit prizes */
        mm.add("(prefers-reduced-motion: no-preference)", () => {
          const merit = root.current?.querySelector('[data-prize="merit"]');
          if (!merit) return;
          gsap
            .timeline({
              defaults: { ease: "power3.out" },
              scrollTrigger: { trigger: merit, start: "top 85%", once: true },
            })
            .fromTo(merit, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.55 })
            .fromTo(
              merit.querySelectorAll("[data-merit-marker]"),
              { opacity: 0, y: 14, scaleY: 0.5 },
              {
                opacity: 1,
                y: 0,
                scaleY: 1,
                duration: 0.42,
                stagger: 0.085,
                transformOrigin: "bottom center",
                clearProps: "willChange",
              },
              0.18,
            )
            .fromTo(
              merit.querySelectorAll("[data-merit='total']"),
              { opacity: 0, y: 12 },
              { opacity: 1, y: 0, duration: 0.45 },
              1.0,
            )
            .fromTo(
              merit.querySelectorAll("[data-merit='per']"),
              { opacity: 0, y: 12 },
              { opacity: 1, y: 0, duration: 0.45 },
              1.12,
            )
            .fromTo(
              merit.querySelectorAll("[data-merit='criteria']"),
              { opacity: 0 },
              { opacity: 1, duration: 0.4 },
              1.3,
            );
        });

        /* Group D — goodies and merchandise */
        mm.add("(prefers-reduced-motion: no-preference)", () => {
          const goods = root.current?.querySelector('[data-prize="goods"]');
          if (!goods) return;
          gsap
            .timeline({
              defaults: { ease: "power3.out" },
              scrollTrigger: { trigger: goods, start: "top 85%", once: true },
            })
            .fromTo(goods, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.55 })
            .fromTo(
              goods.querySelectorAll("[data-goods-shape]"),
              { opacity: 0, y: 18, scale: 0.97 },
              { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.09 },
              0.15,
            )
            .fromTo(
              goods.querySelector('[data-goods="recon"]'),
              { scaleX: 0 },
              { scaleX: 1, duration: 0.5, transformOrigin: "left center" },
              0.7,
            )
            .fromTo(
              goods.querySelector('[data-goods="final"]'),
              { opacity: 0, scale: 0.94 },
              { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" },
              1.05,
            );
        });

        // Fonts can shift layout after hydration; recalculate start positions once.
        if (typeof document !== "undefined" && "fonts" in document) {
          void (document as Document & { fonts: FontFaceSet }).fonts.ready.then(() => {
            mod.ScrollTrigger.refresh();
          });
        }
      }, root);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [total, cash, goodies, config.merit_prize_count]);

  return (
    <section
      id="prize-pool"
      ref={root}
      className="mtt-section mtt-grid mtt-prize relative scroll-mt-20 overflow-hidden bg-[#08090B]"
    >
      {/* ── LAYER 1 — environment ─────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[38rem]"
        style={{
          background:
            "radial-gradient(58% 52% at 50% 16%, rgba(255,121,47,0.15), rgba(255,121,47,0.04) 45%, transparent 72%)",
        }}
      />
      <MeasurementRings
        className="pointer-events-none absolute left-1/2 top-[6%] h-[44rem] w-[44rem] -translate-x-1/2 text-flare-500 opacity-[0.14]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-64"
        style={{ background: "linear-gradient(180deg, transparent, rgba(255,121,47,0.05))" }}
      />
      <span className="mtt-coord absolute left-4 top-5 hidden lg:block">19.0760° N</span>
      <span className="mtt-coord absolute right-4 top-5 hidden lg:block">
        MTT / Prize allocation
      </span>

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6">
        {/* ── LAYER 2 — introduction + total panel ───────────────────── */}
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-7">
            <SectionIntro
              index="02"
              eyebrow="Prize pool"
              title={
                <>
                  One lakh
                  <br />
                  on the line.
                </>
              }
              description="The full prize allocation is confirmed. Cash prizes are awarded to the podium and merit winners; the remaining allocation goes to participant goodies and tournament merchandise."
              titleClassName="text-[2.4rem] sm:text-[3.1rem] lg:text-[3.6rem]"
              meta={
                <div className="flex flex-wrap items-center gap-3">
                  <StatusTag state="confirmed">Distribution confirmed</StatusTag>
                  <CoordNote>MTT / Prize structure</CoordNote>
                </div>
              }
            />
          </div>

          {/* The championship allocation display */}
          <div className="lg:col-span-5">
            <div data-prize="panel" data-anim-target className="mtt-allocation">
              <span data-prize="frame" className="mtt-allocation-frame" aria-hidden="true" />
              {(
                [
                  "left-0 top-0 border-l border-t",
                  "right-0 top-0 border-r border-t",
                  "left-0 bottom-0 border-l border-b",
                  "right-0 bottom-0 border-r border-b",
                ] as const
              ).map((position) => (
                <span
                  key={position}
                  data-prize-corner
                  aria-hidden="true"
                  className={`mtt-allocation-corner ${position}`}
                />
              ))}

              <div className="relative p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <TechLabel>Total prize pool</TechLabel>
                  <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-flare-300/70">
                    INR
                  </span>
                </div>

                <p
                  data-prize="number"
                  className="mtt-figure mt-5 bg-gradient-to-b from-[#FFD7B4] via-[#FF914A] to-[#FF6A16] bg-clip-text font-display text-[3.6rem] font-semibold text-transparent sm:text-[4.4rem] lg:text-[4.6rem]"
                >
                  {formatINR(total)}
                </p>

                <div className="mt-6">
                  <TickRule className="text-white/25" ticks={18} />
                </div>

                <div className="mt-5">
                  <div className="flex h-2.5 w-full overflow-hidden bg-white/[0.05]">
                    <div
                      data-prize-bar="cash"
                      className="mtt-bar bg-gradient-to-r from-[#FF5F0A] to-[#FFA25C]"
                      style={{ width: `${cashShare}%` }}
                    />
                    <div
                      data-prize-bar="goodies"
                      className="mtt-bar bg-gradient-to-r from-arena-700 to-arena-600"
                      style={{ width: `${goodiesShare}%` }}
                    />
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-4">
                    <div data-prize-legend>
                      <dt className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.22em] text-ash">
                        <span className="h-2 w-2 bg-flare-500" aria-hidden="true" />
                        Cash prizes
                      </dt>
                      <dd className="mt-1.5 font-display text-lg font-semibold text-bone">
                        {formatINR(cash)}
                        <span className="ml-2 font-mono text-[10px] font-normal tracking-[0.16em] text-muted">
                          {cashShare}%
                        </span>
                      </dd>
                    </div>
                    <div data-prize-legend>
                      <dt className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.22em] text-ash">
                        <span className="h-2 w-2 bg-arena-600" aria-hidden="true" />
                        Goodies
                      </dt>
                      <dd className="mt-1.5 font-display text-lg font-semibold text-bone">
                        {formatINR(goodies)}
                        <span className="ml-2 font-mono text-[10px] font-normal tracking-[0.16em] text-muted">
                          {goodiesShare}%
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── LAYER 3 — championship podium ──────────────────────────── */}
        <div data-prize="podium" className="mt-16 sm:mt-20">
          <div className="flex items-end justify-between gap-6">
            <TechLabel>Cash podium — 03 places</TechLabel>
            <CandleTicker className="hidden h-8 w-32 text-flare-500/70 sm:block" />
          </div>
          <div className="mt-3 h-px w-full bg-white/[0.08]" />

          <ol className="mt-8 grid items-end gap-4 sm:grid-cols-3 sm:gap-5">
            {tiers.map((tier, position) => (
              <li
                key={tier.key}
                data-podium-card={String(position + 1)}
                className={ORDER[position]}
              >
                <PodiumCard tier={tier} />
              </li>
            ))}
          </ol>

          {/* Championship baseline + platform */}
          <div className="relative mt-5">
            <span
              data-podium="baseline"
              aria-hidden="true"
              className="mtt-platform absolute left-0 top-0 h-px w-full"
            />
            <PodiumPlatform className="relative mt-2 h-8 w-full text-white/[0.12] sm:h-10" />
          </div>
        </div>

        {/* ── LAYER 4 — merit + merchandise allocations ──────────────── */}
        <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <MeritPanel
            total={config.merit_prize_total}
            count={config.merit_prize_count}
            amount={config.merit_prize_amount}
          />
          <GoodsPanel cash={cash} goodies={goodies} total={total} />
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-white/[0.06] pt-6 sm:flex-row sm:items-center">
          <p className="max-w-xl text-xs leading-relaxed text-muted">
            Prize amounts are those published by the organisers. Payment, tax treatment and
            distribution timelines are communicated to winners directly after the results.
          </p>
          <Link
            href="/tournament/rules"
            className="arena-focus rounded font-mono text-[10px] uppercase tracking-[0.24em] text-flare-300 underline decoration-flare-500/40 underline-offset-4 transition hover:text-flare-200"
          >
            Read the tournament rules
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Podium cards ────────────────────────────────────────────────────── */

function PodiumCard({ tier }: { tier: Tier }) {
  const champion = tier.accent;
  return (
    <Surface
      tone={champion ? "flare" : "default"}
      hover
      className={`relative h-full overflow-hidden ${
        champion ? "p-6 sm:p-8 sm:pb-10" : "p-5 sm:p-6"
      }`}
    >
      {champion && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-14 -top-14 h-48 w-48 opacity-70"
            style={{
              background: "radial-gradient(circle, rgba(255,121,47,0.3), transparent 68%)",
            }}
          />
          <ChampionEmblem className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 text-flare-500/25" />
          <CornerMarks className="text-flare-400/60" />
          {/* One restrained light sweep, desktop only */}
          <span
            data-podium="sweep"
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/[0.14] to-transparent opacity-0 md:opacity-100"
          />
        </>
      )}

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`font-mono text-[9px] uppercase tracking-[0.22em] ${
                champion ? "text-flare-300/80" : "text-muted"
              }`}
            >
              {tier.index}
            </span>
            <span className="h-px w-4 bg-white/12" aria-hidden="true" />
            <span
              className={`font-mono text-[9px] uppercase tracking-[0.22em] ${
                champion ? "text-flare-300/80" : "text-muted"
              }`}
            >
              Rank {tier.rank}
            </span>
          </div>
          <p
            className={`mt-4 font-display font-semibold uppercase tracking-tight ${
              champion ? "text-base text-flare-200 sm:text-lg" : "text-sm text-ash sm:text-base"
            }`}
          >
            {tier.label}
          </p>
          <p
            data-podium-amount
            className={`mtt-figure mt-3 font-display font-semibold ${
              champion
                ? "bg-gradient-to-b from-[#FFD7B4] to-[#FF7A2E] bg-clip-text text-4xl text-transparent sm:text-[3.25rem]"
                : tier.rank === "02"
                  ? "bg-gradient-to-b from-[#EDEDF0] to-[#9A9BA0] bg-clip-text text-3xl text-transparent sm:text-4xl"
                  : "text-3xl text-bone/90 sm:text-4xl"
            }`}
          >
            {formatINR(tier.amount)}
          </p>
        </div>

        {/* Rank emblem / marker */}
        <span
          data-podium-rank
          aria-hidden="true"
          className={`mtt-figure grid shrink-0 place-items-center border font-mono ${
            champion
              ? "h-12 w-12 border-flare-500/60 bg-flare-500/15 text-sm text-flare-300"
              : "h-10 w-10 border-white/12 bg-white/[0.04] text-[13px] text-bone/55"
          }`}
        >
          {tier.rank}
        </span>
      </div>

      <p
        className={`relative mt-5 text-sm leading-relaxed ${
          champion ? "text-bone/70" : "text-muted"
        }`}
      >
        {tier.note}
      </p>

      {/* Precision championship marker on the champion card */}
      {champion && (
        <div className="relative mt-6 flex items-center gap-3">
          <span className="mtt-coord text-flare-300/70">Championship place</span>
          <span className="h-px flex-1 bg-white/10" aria-hidden="true" />
          <span className="mtt-coord">P-01</span>
        </div>
      )}

      {/* Lower edge — illuminated on the champion */}
      <div
        aria-hidden="true"
        data-podium={champion ? "champion-edge" : undefined}
        className={`relative mt-6 h-1.5 w-full ${
          champion
            ? "bg-gradient-to-r from-flare-500 to-[#FFB27A] shadow-[0_0_20px_-2px_rgba(255,121,47,0.85)]"
            : "bg-white/10"
        }`}
      />
    </Surface>
  );
}

/* ── Merit prizes ────────────────────────────────────────────────────── */

function MeritPanel({
  total,
  count,
  amount,
}: {
  total: number;
  count: number;
  amount: number;
}) {
  const markers = Math.max(count, 1);
  return (
    <div data-prize="merit" className="h-full">
      <Surface className="h-full p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <TechLabel>Merit prizes · P-04</TechLabel>
            <p data-merit="total" className="mtt-figure mt-4 font-display text-3xl font-semibold text-bone sm:text-4xl">
              {formatINR(total)}
            </p>
            <p data-merit="per" className="mt-2 text-sm text-ash">
              {count} winners × {formatINR(amount)}
            </p>
          </div>
          <span data-merit="criteria" className="inline-block">
            <StatusTag state="pending">Criteria to be announced</StatusTag>
          </span>
        </div>

        {/* Ten equal merit units — an indexed set, not a ranking */}
        <div className="mt-7 flex items-end gap-1.5 sm:gap-2">
          {Array.from({ length: markers }).map((_, index) => (
            <div key={index} className="flex-1">
              <span
                data-merit-marker
                aria-hidden="true"
                className="block h-9 w-full rounded-[2px] bg-gradient-to-t from-[#8A3A0B] via-[#FF792F] to-[#FFC08E]"
                style={{ opacity: 0.45 + (index / Math.max(markers - 1, 1)) * 0.55 }}
              />
              <span className="mt-1.5 block text-center font-mono text-[8px] tracking-[0.08em] text-muted">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-5 text-xs leading-relaxed text-muted">
          Merit prizes recognise strong performances beyond the podium. The selection criteria for
          merit winners will be published with the tournament rules.
        </p>
      </Surface>
    </div>
  );
}

/* ── Goodies and merchandise ─────────────────────────────────────────── */

function GoodsPanel({
  cash,
  goodies,
  total,
}: {
  cash: number;
  goodies: number;
  total: number;
}) {
  return (
    <div data-prize="goods" className="h-full">
      <Surface className="relative h-full overflow-hidden p-6 sm:p-8">
      <div className="relative">
        <TechLabel>Goodies &amp; merchandise · P-05</TechLabel>

        <div className="mt-4 flex items-start justify-between gap-4">
          <p className="mtt-figure font-display text-3xl font-semibold text-bone sm:text-4xl">
            {formatINR(goodies)}
          </p>
          <span data-goods-shape className="block shrink-0">
            <MerchandiseStack className="h-20 w-28 text-flare-500/70 sm:h-24 sm:w-32" />
          </span>
        </div>

        <p data-goods-shape className="mt-4 text-sm leading-relaxed text-ash">
          Participant kits, tournament merchandise and partner goodies distributed across the event.
          The final composition is announced closer to the tournament.
        </p>

        <div className="mt-7 border-t border-white/[0.08] pt-5">
          <div className="flex items-baseline justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            <span>Reconciliation</span>
            <span className="inline-flex items-center gap-1.5 text-flare-300/80">
              <span className="h-1.5 w-1.5 rounded-full bg-flare-500" aria-hidden="true" />
              Verified
            </span>
          </div>
          <span
            data-goods="recon"
            aria-hidden="true"
            className="mt-3 block h-px w-full bg-gradient-to-r from-flare-500/70 via-flare-500/30 to-transparent"
          />
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ash">
            {formatINR(cash)} cash + {formatINR(goodies)} goodies ={" "}
            <span
              data-goods="final"
              className="inline-block bg-gradient-to-b from-[#FFD7B4] to-[#FF8A3D] bg-clip-text font-display text-base font-semibold text-transparent"
            >
              {formatINR(total)}
            </span>
          </p>
        </div>
      </div>
      </Surface>
    </div>
  );
}
