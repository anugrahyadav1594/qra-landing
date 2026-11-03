import Link from "next/link";

import { Reveal } from "@/components/Reveal";
import { CandleTicker, CornerMarks, PrizeCrest, PodiumSilhouette, TickRule } from "@/components/tournament/motifs";
import {
  CoordNote,
  SectionIntro,
  StatusTag,
  Surface,
  TechLabel,
} from "@/components/tournament/primitives";
import { formatINR, type TournamentConfig } from "@/lib/tournament";

/**
 * SECTION B — Championship Prize Experience.
 *
 * The declared ₹1,00,000 pool is the centrepiece: an oversized figure on a
 * technical prize plate, a 60/40 allocation bar, a podium of the three cash
 * places, ten merit markers and a separate goodies allocation panel.
 *
 * Every number is read from the configured prize pool — the composition
 * recomputes itself if an administrator changes the distribution, and the
 * ratios in the allocation bar are derived, never hard-coded.
 */
/** Champion first on mobile, centre of the podium from sm upwards. */
const ORDER = ["order-first sm:order-2", "sm:order-1", "sm:order-3"];

export function PrizePool({ config }: { config: TournamentConfig }) {
  const cash = config.cash_prize_pool;
  const goodies = config.goodies_and_merchandise;
  const total = config.prize_pool_total || cash + goodies;
  const cashShare = total > 0 ? Math.round((cash / total) * 100) : 0;
  const goodiesShare = total > 0 ? 100 - cashShare : 0;

  const tiers = [
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

  return (
    <section
      id="prize-pool"
      className="mtt-section mtt-grid mtt-grid-flare scroll-mt-20 overflow-hidden bg-arena-950"
    >
      {/* Ambient light: one restrained warm pool, no floating particles */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-[-10%] h-[32rem] w-[42rem] opacity-70"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,121,47,0.13), rgba(255,121,47,0.04) 45%, transparent 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 h-64 w-full opacity-40"
        style={{
          background: "linear-gradient(180deg, transparent, rgba(255,121,47,0.05))",
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6">
        {/* ── Header band + prize plate ──────────────────────────────── */}
        <Reveal>
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
                meta={
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusTag state="confirmed">Distribution confirmed</StatusTag>
                    <CoordNote>MTT / Prize structure</CoordNote>
                  </div>
                }
              />
            </div>

            {/* The centrepiece: oversized total on a technical plate */}
            <div className="lg:col-span-5">
              <Surface marks tone="flare" className="px-6 py-7 sm:px-8 sm:py-9">
                <div className="relative flex items-start justify-between gap-4">
                  <TechLabel>Total prize pool</TechLabel>
                  <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-flare-300/70">
                    INR
                  </span>
                </div>

                <p className="mtt-figure mt-5 bg-gradient-to-b from-flare-300 via-flare-400 to-flare-600 bg-clip-text font-display text-[3.4rem] font-semibold text-transparent sm:text-[4.2rem] lg:text-[4.6rem]">
                  {formatINR(total)}
                </p>

                <div className="mt-6">
                  <TickRule className="text-white/25" ticks={18} />
                </div>

                {/* Allocation bar — derived from the configured split */}
                <div className="mt-5">
                  <div className="flex h-2 w-full overflow-hidden bg-white/6">
                    <div
                      className="mtt-bar bg-gradient-to-r from-flare-500 to-flare-300"
                      style={{ width: `${cashShare}%` }}
                    />
                    <div
                      className="mtt-bar bg-gradient-to-r from-arena-700 to-arena-600"
                      style={{ width: `${goodiesShare}%` }}
                    />
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-4">
                    <div>
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
                    <div>
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
              </Surface>
            </div>
          </div>
        </Reveal>

        {/* ── Podium ─────────────────────────────────────────────────── */}
        <Reveal>
          <div className="mt-14 sm:mt-16">
            <div className="flex items-end justify-between gap-6">
              <TechLabel>Cash podium — 03 places</TechLabel>
              <CandleTicker
                className="hidden h-8 w-32 text-flare-500/70 sm:block"
              />
            </div>
            <div className="mt-3 h-px w-full bg-white/8" />

            <ol className="mt-8 grid items-end gap-4 sm:grid-cols-3 sm:gap-5">
              {tiers.map((tier, position) => (
                <li
                  key={tier.key}
                  data-podium={String(position + 1)}
                  className={`mtt-podium ${ORDER[position] ?? ""}`}
                >
                  <PodiumBlock tier={tier} />
                </li>
              ))}
            </ol>

            {/* Illuminated baseline the podium stands on */}
            <div aria-hidden="true" className="mtt-platform mt-5 w-full" />
            <PodiumSilhouette
              className="mt-2 h-8 w-full text-white/12 sm:h-10"
            />
          </div>
        </Reveal>

        {/* ── Merit + goodies allocations ────────────────────────────── */}
        <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal>
            <Surface className="h-full p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <TechLabel>Merit prizes · P-04</TechLabel>
                  <p className="mtt-figure mt-4 font-display text-3xl font-semibold text-bone sm:text-4xl">
                    {formatINR(config.merit_prize_total)}
                  </p>
                  <p className="mt-2 text-sm text-ash">
                    {config.merit_prize_count} winners × {formatINR(config.merit_prize_amount)}
                  </p>
                </div>
                <StatusTag state="pending">Criteria to be announced</StatusTag>
              </div>

              {/* Ten markers — one per merit prize */}
              <div
                className="mt-7 flex items-end gap-1.5 sm:gap-2"
                aria-hidden="true"
              >
                {Array.from({ length: Math.max(config.merit_prize_count, 1) }).map((_, index) => (
                  <span key={index} className="relative flex-1">
                    <span
                      className="block w-full rounded-sm bg-gradient-to-t from-flare-600/60 to-flare-300"
                      style={{ height: `${26 + index * 3}px`, opacity: 0.4 + index * 0.06 }}
                    />
                    <span className="mt-1 block h-px w-full bg-white/10" />
                  </span>
                ))}
              </div>
              <div className="mt-3 flex justify-between">
                <TechLabel>01</TechLabel>
                <TechLabel className="text-bone/20">
                  {String(config.merit_prize_count).padStart(2, "0")} places
                </TechLabel>
              </div>

              <p className="mt-6 max-w-lg text-sm leading-relaxed text-ash">
                Merit prizes recognise strong performances beyond the podium. The selection
                criteria for merit winners will be published with the tournament rules.
              </p>
            </Surface>
          </Reveal>

          <Reveal>
            <Surface className="relative h-full overflow-hidden p-6 sm:p-8">
              <PrizeCrest
                className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 text-flare-500/25"
              />
              <div className="relative">
                <TechLabel>Goodies &amp; merchandise · P-05</TechLabel>
                <p className="mtt-figure mt-4 font-display text-3xl font-semibold text-bone sm:text-4xl">
                  {formatINR(goodies)}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-ash">
                  Participant kits, tournament merchandise and partner goodies distributed across the
                  event. The final composition is announced closer to the tournament.
                </p>

                <div className="mt-7 border-t border-white/8 pt-5">
                  <div className="flex items-baseline justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                    <span>Reconciliation</span>
                    <span className="text-flare-300/80">Verified</span>
                  </div>
                  <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ash">
                    {formatINR(cash)} cash + {formatINR(goodies)} goodies ={" "}
                    <span className="text-flare-300">{formatINR(total)}</span>
                  </p>
                </div>
              </div>
            </Surface>
          </Reveal>
        </div>

        <Reveal>
          <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-white/6 pt-6 sm:flex-row sm:items-center">
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
        </Reveal>
      </div>
    </section>
  );
}

function PodiumBlock({
  tier,
}: {
  tier: {
    key: string;
    index: string;
    rank: string;
    label: string;
    amount: number;
    note: string;
    accent: boolean;
  };
}) {
  return (
    <Surface
      tone={tier.accent ? "flare" : "default"}
      hover
      className={`relative h-full overflow-hidden ${
        tier.accent ? "p-6 sm:p-8 sm:pb-10" : "p-5 sm:p-6"
      }`}
    >
      {tier.accent ? (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 opacity-60"
            style={{
              background: "radial-gradient(circle, rgba(255,121,47,0.28), transparent 68%)",
            }}
          />
          <CornerMarks className="text-flare-400/60" />
        </>
      ) : null}

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`font-mono text-[9px] uppercase tracking-[0.22em] ${
                tier.accent ? "text-flare-300/80" : "text-muted"
              }`}
            >
              {tier.index}
            </span>
            <span className="h-px w-4 bg-white/12" aria-hidden="true" />
            <span
              className={`font-mono text-[9px] uppercase tracking-[0.22em] ${
                tier.accent ? "text-flare-300/80" : "text-muted"
              }`}
            >
              Rank {tier.rank}
            </span>
          </div>
          <p
            className={`mt-4 font-display font-semibold uppercase tracking-tight ${
              tier.accent ? "text-base text-flare-200 sm:text-lg" : "text-sm text-ash sm:text-base"
            }`}
          >
            {tier.label}
          </p>
          <p
            className={`mtt-figure mt-3 font-display font-semibold ${
              tier.accent
                ? "bg-gradient-to-b from-flare-200 to-flare-500 bg-clip-text text-4xl text-transparent sm:text-5xl"
                : "text-3xl text-bone sm:text-4xl"
            }`}
          >
            {formatINR(tier.amount)}
          </p>
        </div>

        <span
          className={`mtt-figure grid h-10 w-10 shrink-0 place-items-center border font-mono text-sm ${
            tier.accent
              ? "border-flare-500/60 bg-flare-500/15 text-flare-300"
              : "border-white/12 bg-white/4 text-bone/55"
          }`}
          aria-hidden="true"
        >
          {tier.rank}
        </span>
      </div>

      <p
        className={`relative mt-5 text-sm leading-relaxed ${
          tier.accent ? "text-bone/70" : "text-muted"
        }`}
      >
        {tier.note}
      </p>

      <div
        aria-hidden="true"
        className={`relative mt-6 h-1.5 w-full ${
          tier.accent
            ? "bg-gradient-to-r from-flare-500 to-flare-300 shadow-[0_0_18px_-2px_rgba(255,121,47,0.7)]"
            : "bg-white/10"
        }`}
      />
    </Surface>
  );
}
