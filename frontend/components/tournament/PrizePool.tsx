"use client";

import Link from "next/link";
import { useRef } from "react";

import {
  CandleTicker,
  ChampionEmblem,
  LaurelCrest,
  MarketWave,
  MeasurementRings,
  MerchCrest,
  MumbaiHorizon,
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

/** Height of each podium block — the champion's plinth is the tallest. */
const PLINTH: Record<string, string> = {
  "1": "sm:h-24",
  "2": "sm:h-14",
  "3": "sm:h-10",
};

/**
 * SECTION 02 — THE MTT CHAMPIONSHIP ARENA
 *
 * A layered environment: a designed fallback atmosphere, the replaceable
 * artwork layer, a dark readability veil, orange atmospheric lighting and a
 * technical grid — with the content above all of them. The prize display,
 * the three-place podium, the merit set and the merchandise panel form one
 * composition, not six cards.
 *
 * Everything renders in its final state. GSAP only adds entrance motion,
 * and every value comes from the configured prize pool: the split, the
 * percentages and the reconciliation are derived, never typed.
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

  /* ── Motion: five independent, once-only scroll timelines ──────────── */
  useIsomorphicLayoutEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    loadGsap().then((mod) => {
      if (!mod || cancelled || !root.current) return;
      const { gsap } = mod;

      ctx = gsap.context(() => {
        const mm = gsap.matchMedia();

        /* Group A — total prize display (~2.0s) */
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
            /* 1 — panel frame and corner brackets draw in */
            .fromTo(
              panel.querySelectorAll("[data-prize='frame']"),
              { opacity: 0 },
              { opacity: 1, duration: 0.5 },
              0,
            )
            .fromTo(
              panel.querySelectorAll("[data-prize-corner]"),
              { opacity: 0, scale: 0.5 },
              { opacity: 1, scale: 1, duration: 0.32, stagger: 0.09, ease: "power2.out" },
              0,
            )
            /* 2 — laurel crest strokes itself in */
            .fromTo(
              panel.querySelectorAll("[data-prize-draw] path"),
              { strokeDashoffset: 100 },
              { strokeDashoffset: 0, duration: 0.7, stagger: 0.03, ease: "power2.inOut" },
              0.1,
            )
            .fromTo(
              panel.querySelectorAll("[data-prize='rings']"),
              { opacity: 0, scale: 0.94 },
              { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" },
              0.12,
            )
            /* 3 — the amount reveals and counts to exactly ₹1,00,000 */
            .fromTo(numberEl, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.62 }, 0.3)
            .to(
              counter,
              {
                value: total,
                duration: 0.95,
                ease: "power2.out",
                snap: { value: 1000 },
                onUpdate: () => {
                  if (numberEl) numberEl.textContent = formatINR(counter.value);
                },
                onComplete: () => {
                  if (numberEl) numberEl.textContent = formatINR(total);
                },
              },
              0.36,
            )
            /* 4 — allocation bar fills left to right */
            .fromTo(
              panel.querySelector('[data-prize-bar="cash"]'),
              { scaleX: 0 },
              { scaleX: 1, duration: 0.6, transformOrigin: "left center" },
              0.86,
            )
            .fromTo(
              panel.querySelector('[data-prize-bar="goodies"]'),
              { scaleX: 0 },
              { scaleX: 1, duration: 0.45, transformOrigin: "left center" },
              1.16,
            )
            /* 5 — legends, then the percentage values */
            .fromTo(
              panel.querySelectorAll("[data-prize-legend]"),
              { opacity: 0, y: 10 },
              { opacity: 1, y: 0, duration: 0.42, stagger: 0.12 },
              1.26,
            )
            .fromTo(
              panel.querySelectorAll("[data-prize='percent']"),
              { opacity: 0, y: 6 },
              { opacity: 1, y: 0, duration: 0.32, stagger: 0.08 },
              1.5,
            );

          gsap.set(panel.querySelectorAll("[data-anim-target]"), { willChange: "transform" });
        });

        /* Group B — championship podium */
        mm.add("(prefers-reduced-motion: no-preference)", () => {
          const podium = root.current?.querySelector('[data-prize="podium"]');
          if (!podium) return;
          const cards = podium.querySelectorAll("[data-podium-card]");

          const timeline = gsap.timeline({
            defaults: { ease: "power3.out" },
            scrollTrigger: { trigger: podium, start: "top 80%", once: true },
            onComplete: () => {
              gsap.set(cards, { clearProps: "willChange" });
            },
          });

          timeline
            /* 1 — the plinths rise out of the floor, champion last */
            .fromTo(
              podium.querySelectorAll("[data-podium-block]"),
              { scaleY: 0 },
              {
                scaleY: 1,
                duration: 0.5,
                stagger: 0.08,
                transformOrigin: "bottom center",
                ease: "power2.out",
              },
            )
            .fromTo(
              podium.querySelector('[data-podium="baseline"]'),
              { scaleX: 0 },
              { scaleX: 1, duration: 0.45, transformOrigin: "center center" },
              0.15,
            )
            /* 2 — left, right, then champion */
            .fromTo(
              podium.querySelector('[data-podium-card="2"]'),
              { opacity: 0, y: 42 },
              { opacity: 1, y: 0, duration: 0.6 },
              0.22,
            )
            .fromTo(
              podium.querySelector('[data-podium-card="3"]'),
              { opacity: 0, y: 42 },
              { opacity: 1, y: 0, duration: 0.6 },
              0.34,
            )
            .fromTo(
              podium.querySelector('[data-podium-card="1"]'),
              { opacity: 0, y: 58, scale: 0.985 },
              { opacity: 1, y: 0, scale: 1, duration: 0.75 },
              0.46,
            )
            /* 3 — rank identifiers, then the prize values */
            .fromTo(
              podium.querySelectorAll("[data-podium-rank]"),
              { opacity: 0, scale: 0.82 },
              { opacity: 1, scale: 1, duration: 0.3, stagger: 0.06, ease: "power2.out" },
              1.0,
            )
            .fromTo(
              podium.querySelectorAll("[data-podium-amount]"),
              { opacity: 0, y: 14 },
              { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 },
              1.1,
            )
            .fromTo(
              podium.querySelector('[data-podium="champion-edge"]'),
              { opacity: 0, scaleX: 0.35 },
              { opacity: 1, scaleX: 1, duration: 0.5, transformOrigin: "left center" },
              1.3,
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
                delay: 1.5,
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
              { opacity: 0, y: 16, scaleY: 0.55 },
              {
                opacity: 1,
                y: 0,
                scaleY: 1,
                duration: 0.42,
                stagger: 0.08,
                transformOrigin: "bottom center",
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
              1.28,
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
              goods.querySelectorAll("[data-goods-draw] path"),
              { strokeDashoffset: 100 },
              { strokeDashoffset: 0, duration: 0.6, stagger: 0.04 },
              0.35,
            );
        });

        /* Group E — allocation reconciliation */
        mm.add("(prefers-reduced-motion: no-preference)", () => {
          const recon = root.current?.querySelector('[data-prize="recon"]');
          if (!recon) return;
          gsap
            .timeline({
              defaults: { ease: "power3.out" },
              scrollTrigger: { trigger: recon, start: "top 88%", once: true },
            })
            .fromTo(
              recon.querySelector('[data-recon="rule"]'),
              { scaleX: 0 },
              { scaleX: 1, duration: 0.5, transformOrigin: "left center" },
            )
            .fromTo(
              recon.querySelectorAll("[data-recon='line']"),
              { opacity: 0, y: 10 },
              { opacity: 1, y: 0, duration: 0.45 },
              0.25,
            )
            .fromTo(
              recon.querySelector('[data-recon="final"]'),
              { opacity: 0, scale: 0.94 },
              { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" },
              0.55,
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
    <section id="prize-pool" ref={root} className="mtt-prize scroll-mt-20 border-t border-white/[0.06]">
      {/* ── 1 · Designed fallback atmosphere ──────────────────────────── */}
      <div className="mtt-prize-fallback" aria-hidden="true">
        <MeasurementRings
          className="absolute left-1/2 top-[2%] h-[42rem] w-[42rem] -translate-x-1/2 text-flare-400 opacity-[0.16]"
        />
        <MumbaiHorizon className="absolute inset-x-0 bottom-0 h-[54%] w-full text-white/[0.32]" />
        <MarketWave className="absolute inset-x-0 bottom-[3%] h-44 w-full text-flare-500 opacity-90" />
      </div>

      {/* ── 2 · Replaceable artwork (auto-detected; see globals.css) ──── */}
      <div className="mtt-prize-artwork" aria-hidden="true" />

      {/* ── 3 · Dark readability veil ─────────────────────────────────── */}
      <div className="mtt-prize-veil" aria-hidden="true" />

      {/* ── 4 · Orange atmospheric lighting ───────────────────────────── */}
      <div className="mtt-prize-light" aria-hidden="true" />

      {/* ── 5 · Technical grid ────────────────────────────────────────── */}
      <div className="mtt-prize-grid" aria-hidden="true" />

      {/* ── 6 · Content ───────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:py-28">
        <span className="mtt-coord absolute left-4 top-8 hidden lg:block">19.0760° N</span>
        <span className="mtt-coord absolute right-4 top-8 hidden lg:block">
          MTT / Prize allocation
        </span>

        {/* Top region — editorial intro + the total prize display */}
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-6">
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
              titleClassName="text-[2.6rem] sm:text-[3.4rem] lg:text-[4rem]"
              meta={
                <div className="flex flex-wrap items-center gap-3">
                  <StatusTag state="confirmed">Distribution confirmed</StatusTag>
                  <CoordNote>MTT / Prize structure</CoordNote>
                </div>
              }
            />
          </div>

          <div className="lg:col-span-6">
            <PrizeDisplay total={total} cash={cash} goodies={goodies} cashShare={cashShare} goodiesShare={goodiesShare} />
          </div>
        </div>

        {/* Middle region — the championship podium */}
        <div data-prize="podium" className="mt-16 sm:mt-20 lg:mt-24">
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

          {/* Podium plinths: champion tallest, ground line shared */}
          <div className="relative mt-4 hidden h-24 items-end sm:grid sm:grid-cols-3 sm:gap-5">
            {[
              { rank: "2", label: "02" },
              { rank: "1", label: "01" },
              { rank: "3", label: "03" },
            ].map(({ rank, label }) => (
              <div
                key={rank}
                data-podium-block={rank}
                data-rank={rank}
                className={`mtt-podium-block flex items-start justify-center pt-2 ${PLINTH[rank]}`}
              >
                <span className="mtt-podium-plate">{label}</span>
              </div>
            ))}
            <span
              data-podium="baseline"
              aria-hidden="true"
              className="mtt-platform absolute inset-x-0 bottom-0 h-px"
            />
          </div>

          {/* Mobile plinth strips — the stacked podium reads as one base */}
          <div className="mt-3 grid gap-4 sm:hidden">
            <span aria-hidden="true" className="h-px w-full bg-white/10" />
          </div>
        </div>

        {/* Bottom region — merit + merchandise */}
        <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <MeritPanel
            total={config.merit_prize_total}
            count={config.merit_prize_count}
            amount={config.merit_prize_amount}
          />
          <GoodsPanel goodies={goodies} />
        </div>

        {/* Final region — allocation reconciliation + disclaimer */}
        <Reconciliation cash={cash} goodies={goodies} total={total} />
      </div>
    </section>
  );
}

/* ── The total prize display ─────────────────────────────────────────── */

function PrizeDisplay({
  total,
  cash,
  goodies,
  cashShare,
  goodiesShare,
}: {
  total: number;
  cash: number;
  goodies: number;
  cashShare: number;
  goodiesShare: number;
}) {
  return (
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
        {/* Warm light behind the amount */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[42%] h-64 w-[118%] -translate-x-1/2 -translate-y-1/2"
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(255,121,47,0.22), transparent 72%)",
          }}
        />
        <MeasurementRings
          data-prize="rings"
          className="pointer-events-none absolute right-[-6%] top-[-12%] h-64 w-64 text-flare-400 opacity-25"
        />

        <div className="relative flex items-start justify-between gap-4">
          <TechLabel>Total prize pool</TechLabel>
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-flare-300/80">
            INR
          </span>
        </div>

        {/* Laurel crest */}
        <div className="relative mt-5 flex justify-center">
          <LaurelCrest data-prize-draw className="h-14 w-24 text-flare-500/80 sm:h-16 sm:w-28" />
        </div>

        <p
          data-prize="number"
          className="mtt-figure mtt-prize-amount relative mt-3 bg-gradient-to-b from-[#FFE9DA] via-[#FF974E] to-[#FF6A16] bg-clip-text text-center font-display text-[clamp(3.4rem,9vw,6rem)] font-semibold text-transparent"
        >
          {formatINR(total)}
        </p>

        <div className="relative mt-7">
          <TickRule className="text-white/25" ticks={20} />
        </div>

        {/* Allocation bar — exact 60 : 40 */}
        <div className="relative mt-5">
          <div className="mtt-alloc-track flex h-3.5 w-full">
            <div
              data-prize-bar="cash"
              className="mtt-alloc-seg"
              style={{ width: `${cashShare}%` }}
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-r from-[#FF5F0A] to-[#FFA25C]"
              />
              <span aria-hidden="true" className="mtt-alloc-hatch" />
            </div>
            <div
              data-prize-bar="goodies"
              className="mtt-alloc-seg"
              style={{ width: `${goodiesShare}%` }}
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-r from-arena-700 to-arena-600"
              />
              <span aria-hidden="true" className="mtt-alloc-hatch" />
            </div>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-4">
            <div data-prize-legend>
              <dt className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ash">
                <span className="h-2 w-2 bg-flare-500" aria-hidden="true" />
                Cash prizes
              </dt>
              <dd className="mt-1.5 font-display text-xl font-semibold text-bone">
                {formatINR(cash)}
                <span
                  data-prize="percent"
                  className="ml-2 font-mono text-[11px] font-normal tracking-[0.16em] text-flare-300"
                >
                  {cashShare}%
                </span>
              </dd>
            </div>
            <div data-prize-legend>
              <dt className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ash">
                <span className="h-2 w-2 bg-arena-600" aria-hidden="true" />
                Goodies
              </dt>
              <dd className="mt-1.5 font-display text-xl font-semibold text-bone">
                {formatINR(goodies)}
                <span
                  data-prize="percent"
                  className="ml-2 font-mono text-[11px] font-normal tracking-[0.16em] text-ash"
                >
                  {goodiesShare}%
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

/* ── Podium cards ────────────────────────────────────────────────────── */

function PodiumCard({ tier }: { tier: Tier }) {
  const champion = tier.accent;
  return (
    <>
      <Surface
        tone={champion ? "flare" : "default"}
        hover
        className={`relative h-full overflow-hidden ${
          champion ? "p-6 sm:-translate-y-5 sm:p-8 sm:pb-9" : "p-5 sm:p-6"
        }`}
      >
        {champion && (
          <>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 opacity-75"
              style={{
                background: "radial-gradient(circle, rgba(255,121,47,0.32), transparent 68%)",
              }}
            />
            <ChampionEmblem className="pointer-events-none absolute -bottom-10 -left-8 h-36 w-36 text-flare-500/25" />
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
                champion ? "text-lg text-flare-200 sm:text-xl" : "text-sm text-ash sm:text-base"
              }`}
            >
              {tier.label}
            </p>
            <p
              data-podium-amount
              className={`mtt-figure mt-3 font-display font-semibold ${
                champion
                  ? "bg-gradient-to-b from-[#FFE3CB] to-[#FF7A2E] bg-clip-text text-[2.5rem] text-transparent sm:text-[3.25rem] lg:text-[3.5rem]"
                  : tier.rank === "02"
                    ? "bg-gradient-to-b from-[#F0F0F2] to-[#9A9BA0] bg-clip-text text-[1.875rem] text-transparent sm:text-[2.25rem]"
                    : "text-[1.875rem] text-bone/90 sm:text-[2.25rem]"
              }`}
            >
              {formatINR(tier.amount)}
            </p>
          </div>

          {/* Rank marker */}
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
            champion ? "text-bone/75" : "text-muted"
          }`}
        >
          {tier.note}
        </p>

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
              ? "bg-gradient-to-r from-flare-500 to-[#FFC18C] shadow-[0_0_24px_-2px_rgba(255,121,47,0.9)]"
              : "bg-white/10"
          }`}
        />
      </Surface>

      {/* Mobile plinth strip */}
      <span
        aria-hidden="true"
        className={`mtt-podium-block mt-0 block h-1.5 w-full sm:hidden ${
          champion ? "opacity-100" : "opacity-70"
        }`}
        data-rank={tier.rank}
      />
    </>
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
            <p
              data-merit="total"
              className="mtt-figure mt-4 font-display text-3xl font-semibold text-bone sm:text-4xl"
            >
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
        <div className="mt-7 grid grid-cols-10 gap-1.5 sm:gap-2">
          {Array.from({ length: markers }).map((_, index) => (
            <span
              key={index}
              data-merit-marker
              className="mtt-merit-marker h-16 w-full sm:h-20"
            >
              <span className="mtt-merit-index">{String(index + 1).padStart(2, "0")}</span>
            </span>
          ))}
        </div>

        <p className="mt-6 text-xs leading-relaxed text-muted">
          Merit prizes recognise strong performances beyond the podium. The selection criteria for
          merit winners will be published with the tournament rules.
        </p>
      </Surface>
    </div>
  );
}

/* ── Goodies and merchandise ─────────────────────────────────────────── */

function GoodsPanel({ goodies }: { goodies: number }) {
  return (
    <div data-prize="goods" className="h-full">
      <Surface className="relative h-full overflow-hidden p-6 sm:p-8">
        <div className="relative">
          <TechLabel>Goodies &amp; merchandise · P-05</TechLabel>

          <div className="mt-5 flex flex-col gap-5 sm:grid sm:grid-cols-[1fr_auto] sm:items-start sm:gap-4">
            <div data-goods-shape>
              <p className="mtt-figure font-display text-4xl font-semibold text-bone sm:text-5xl">
                {formatINR(goodies)}
              </p>
              <p data-goods-shape className="mt-4 text-sm leading-relaxed text-ash">
                Participant kits, tournament merchandise and partner goodies distributed across the
                event. The final composition is announced closer to the tournament.
              </p>
            </div>
            <MerchCrest
              data-goods-draw
              className="mtt-draw h-20 w-32 self-start text-flare-500/80 sm:h-28 sm:w-44"
            />
          </div>

          <div className="mt-7 flex items-center gap-3 border-t border-white/[0.08] pt-5">
            <span className="mtt-coord">Illustrative composition</span>
            <span className="h-px flex-1 bg-white/10" aria-hidden="true" />
            <span className="mtt-coord">P-05</span>
          </div>
        </div>
      </Surface>
    </div>
  );
}

/* ── Allocation reconciliation ───────────────────────────────────────── */

function Reconciliation({
  cash,
  goodies,
  total,
}: {
  cash: number;
  goodies: number;
  total: number;
}) {
  return (
    <div data-prize="recon" className="mtt-recon mt-5 p-5 sm:mt-6 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <span className="mtt-coord">Allocation reconciliation</span>
        <span className="mtt-coord inline-flex items-center gap-1.5 text-flare-300/80">
          <span className="h-1.5 w-1.5 rounded-full bg-flare-500" aria-hidden="true" />
          Verified
        </span>
      </div>

      <span
        data-recon="rule"
        aria-hidden="true"
        className="mt-4 block h-px w-full bg-gradient-to-r from-flare-500/70 via-flare-500/25 to-transparent"
      />

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <p
          data-recon="line"
          className="font-mono text-[11px] uppercase leading-relaxed tracking-[0.16em] text-ash sm:text-xs"
        >
          {formatINR(cash)} cash + {formatINR(goodies)} goodies ={" "}
          <span
            data-recon="final"
            className="mtt-figure ml-1 inline-block bg-gradient-to-b from-[#FFE9DA] to-[#FF8A3D] bg-clip-text font-display text-2xl font-semibold text-transparent sm:text-3xl"
          >
            {formatINR(total)}
          </span>
        </p>

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <p className="max-w-md text-xs leading-relaxed text-muted">
            Prize amounts are those published by the organisers. Payment, tax treatment and
            distribution timelines are communicated to winners directly after the results.
          </p>
          <Link
            href="/tournament/rules"
            className="arena-focus shrink-0 rounded font-mono text-[10px] uppercase tracking-[0.24em] text-flare-300 underline decoration-flare-500/40 underline-offset-4 transition hover:text-flare-200"
          >
            Tournament rules
          </Link>
        </div>
      </div>
    </div>
  );
}
