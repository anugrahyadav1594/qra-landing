import Link from "next/link";

import { AnimatedNumber } from "@/components/tournament/AnimatedNumber";
import { ArenaCanvas } from "@/components/tournament/ArenaCanvas";
import { formatINR, type TournamentConfig } from "@/lib/tournament";

/**
 * The first viewport: an asymmetric editorial split — the arena on the
 * right is the brand's signature, the message sits left. The 3D scene is
 * client-only and lazy; the SVG arena is server-rendered underneath, so the
 * hero is complete before any JavaScript runs.
 */
export function ArenaHero({ config }: { config: TournamentConfig }) {
  return (
    <section className="arena-surface arena-grain relative overflow-hidden">
      <div className="arena-technical pointer-events-none absolute inset-0" aria-hidden="true" />

      {/* Asymmetric glow anchored to the arena */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-[-10%] h-[42rem] w-[42rem] opacity-70"
        style={{
          background:
            "radial-gradient(circle at center, rgba(244,124,53,0.20), rgba(244,124,53,0.05) 45%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:gap-8 lg:pb-24 lg:pt-20">
        {/* ── Message ─────────────────────────────────────────────── */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-flare-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-flare-500" />
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-flare-300">
              {config.status_label}
            </span>
          </div>

          <h1 className="mt-6 font-display text-[2.6rem] font-semibold uppercase leading-[0.92] tracking-tightest text-bone sm:text-6xl lg:text-[4.4rem]">
            {config.hero_headline.split(" ").slice(0, 2).join(" ")}
            <br />
            <span className="text-flare-500">
              {config.hero_headline.split(" ").slice(2).join(" ")}
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-ash sm:text-base">
            {config.hero_subhead}
          </p>

          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.28em] text-bone/45">
            {config.name}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/tournament/register"
              className="btn-flare arena-focus group rounded-full px-7 py-3.5 text-[15px]"
            >
              Register now
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
            <Link
              href="#competition"
              className="btn-ghost arena-focus rounded-full px-7 py-3.5 text-[15px]"
            >
              Explore the arena
            </Link>
          </div>

          <div className="mt-10 flex items-end gap-5 border-l border-flare-500/40 pl-5">
            <div>
              <AnimatedNumber
                value={config.prize_pool_total}
                className="block font-display text-4xl font-semibold text-bone sm:text-5xl"
              />
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.28em] text-ash">
                Total prize pool
              </p>
            </div>
            <p className="pb-1 font-mono text-[10px] uppercase leading-relaxed tracking-[0.2em] text-flare-300/70">
              Cash prizes
              <br />
              {formatINR(config.cash_prize_pool)}
              <span className="text-bone/25"> + </span>
              <br />
              Goodies {formatINR(config.goodies_and_merchandise)}
            </p>
          </div>
        </div>

        {/* ── Arena ───────────────────────────────────────────────── */}
        <div className="relative">
          <div className="relative mx-auto aspect-square w-full max-w-[34rem]">
            <ArenaCanvas mode="ambient" className="h-full w-full" />

            {/* Floating instrumentation */}
            <div className="pointer-events-none absolute inset-0">
              <DataChip
                className="left-0 top-[14%] animate-[ticker-up_0.6s_ease-out_both]"
                label="Prize pool"
                value={formatINR(config.prize_pool_total)}
              />
              <DataChip
                className="right-0 top-[32%] animate-[ticker-up_0.6s_ease-out_0.12s_both]"
                label="Format"
                value={config.participation_type}
              />
              <DataChip
                className="bottom-[16%] left-[6%] animate-[ticker-up_0.6s_ease-out_0.24s_both]"
                label="Qualifiers"
                value="College-level"
              />
              <p className="absolute bottom-1 right-1 font-mono text-[10px] uppercase tracking-[0.28em] text-ash/60">
                Fig. 01 — The arena
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat strip ─────────────────────────────────────────────── */}
      <div className="relative border-t border-white/8">
        <dl className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-white/8 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <Stat
            value={formatINR(config.prize_pool_total)}
            label="Total prize pool"
            note={`${formatINR(config.cash_prize_pool)} cash · ${formatINR(config.goodies_and_merchandise)} goodies`}
          />
          <Stat value={config.participation_type} label="Participation" note="One entry per participant" />
          <Stat
            value="Qualifiers"
            label="College-level qualifying rounds"
            note={config.location_context}
          />
        </dl>
      </div>
    </section>
  );
}

function Stat({ value, label, note }: { value: string; label: string; note: string }) {
  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8">
      <dt className="font-mono text-[10px] uppercase tracking-[0.28em] text-ash">{label}</dt>
      <dd className="mt-2 font-display text-2xl font-semibold uppercase tracking-tight text-bone sm:text-3xl">
        {value}
      </dd>
      <p className="mt-1 text-xs text-ash/70">{note}</p>
    </div>
  );
}

function DataChip({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={`absolute rounded-md border border-white/10 bg-arena-900/70 px-3 py-2 backdrop-blur-md ${className}`}
    >
      <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-ash">{label}</p>
      <p className="font-mono text-xs font-semibold tracking-[0.08em] text-flare-300">{value}</p>
    </div>
  );
}
