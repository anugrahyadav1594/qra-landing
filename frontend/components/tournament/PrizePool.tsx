import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/tournament/ui";
import { formatINR, type TournamentConfig } from "@/lib/tournament";

/**
 * The rewards section: a podium, not a spreadsheet.
 *
 * Champion sits highest and strongest, runners-up flank it, merit prizes and
 * the goodies pool are separate strips so the ₹1,00,000 total reads at a
 * glance. Every figure comes from the configured prize pool.
 */
export function PrizePool({ config }: { config: TournamentConfig }) {
  const tiers = [
    {
      key: "champion",
      label: "Champion",
      amount: config.champion_prize,
      note: "The highest honour of the tournament",
    },
    {
      key: "first",
      label: "First Runner-up",
      amount: config.first_runner_up_prize,
      note: null as string | null,
    },
    {
      key: "second",
      label: "Second Runner-up",
      amount: config.second_runner_up_prize,
      note: null as string | null,
    },
  ];

  return (
    <section id="prize-pool" className="relative scroll-mt-20 border-t border-white/8 bg-arena-950 py-20 sm:py-28">
      <div className="arena-halftone pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <SectionHeader
              index="02"
              eyebrow="Prize pool"
              title={
                <>
                  One lakh
                  <br />
                  on the line.
                </>
              }
            />
            <div className="lg:pb-2 lg:text-right">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ash">
                Total prize pool
              </p>
              <p className="mt-2 font-display text-5xl font-semibold text-flare-500 sm:text-6xl">
                {formatINR(config.prize_pool_total)}
              </p>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-bone/45">
                {formatINR(config.cash_prize_pool)} cash · {formatINR(config.goodies_and_merchandise)} goodies
              </p>
            </div>
          </div>
        </Reveal>

        {/* ── Podium ───────────────────────────────────────────────── */}
        <Reveal delay={80}>
          <div className="mt-14 grid items-end gap-5 sm:grid-cols-3">
            <PodiumStep rank="02" tier={tiers[1]} elevation="sm:translate-y-8" accent={false} />
            <PodiumStep rank="01" tier={tiers[0]} elevation="sm:-translate-y-2" accent />
            <PodiumStep rank="03" tier={tiers[2]} elevation="sm:translate-y-12" accent={false} />
          </div>
        </Reveal>

        {/* ── Merit + goodies ──────────────────────────────────────── */}
        <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal delay={140}>
            <div className="arena-panel arena-panel-sm relative overflow-hidden p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-flare-300">
                    Merit prizes
                  </p>
                  <p className="mt-3 font-display text-3xl font-semibold text-bone">
                    {formatINR(config.merit_prize_total)}
                  </p>
                  <p className="mt-1 text-sm text-ash">
                    {config.merit_prize_count} winners × {formatINR(config.merit_prize_amount)}
                  </p>
                </div>
                <div className="flex gap-1.5" aria-hidden="true">
                  {Array.from({ length: Math.min(config.merit_prize_count, 10) }).map((_, index) => (
                    <span
                      key={index}
                      className="h-9 w-2 rounded-sm bg-gradient-to-b from-flare-300 to-flare-600 opacity-80"
                      style={{ opacity: 0.35 + (index / Math.max(config.merit_prize_count - 1, 1)) * 0.65 }}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-6 max-w-lg text-sm leading-relaxed text-ash">
                Merit prizes recognise strong performances beyond the podium. The selection
                criteria for merit winners will be published with the tournament rules.
              </p>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="arena-panel arena-panel-sm relative overflow-hidden p-6 sm:p-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-flare-300">
                Goodies &amp; merchandise
              </p>
              <p className="mt-3 font-display text-3xl font-semibold text-bone">
                {formatINR(config.goodies_and_merchandise)}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-ash">
                Participant kits, tournament merchandise and partner goodies distributed across the
                event. The final composition is announced closer to the tournament.
              </p>
              <div className="mt-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-bone/40">
                <span className="h-px flex-1 bg-white/10" />
                {formatINR(config.cash_prize_pool)} + {formatINR(config.goodies_and_merchandise)} ={" "}
                <span className="text-flare-300">{formatINR(config.prize_pool_total)}</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function PodiumStep({
  rank,
  tier,
  elevation,
  accent,
}: {
  rank: string;
  tier: { key: string; label: string; amount: number; note: string | null };
  elevation: string;
  accent: boolean;
}) {
  return (
    <div className={`podium-step ${elevation}`}>
      <div
        className={`arena-panel relative overflow-hidden p-6 sm:p-7 ${
          accent ? "border-flare-500/45 bg-gradient-to-b from-flare-500/12 to-transparent" : ""
        }`}
      >
        {accent && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-40"
            style={{ background: "radial-gradient(circle, rgba(244,124,53,0.55), transparent 65%)" }}
          />
        )}
        <div className="relative flex items-start justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-ash">{tier.label}</p>
            <p
              className={`mt-3 font-display font-semibold tracking-tight ${
                accent ? "text-4xl text-flare-300 sm:text-5xl" : "text-3xl text-bone sm:text-4xl"
              }`}
            >
              {formatINR(tier.amount)}
            </p>
          </div>
          <span
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border font-mono text-xs ${
              accent
                ? "border-flare-500/60 bg-flare-500/15 text-flare-300"
                : "border-white/12 bg-white/5 text-bone/60"
            }`}
          >
            {rank}
          </span>
        </div>
        {tier.note && <p className="relative mt-4 text-sm text-ash">{tier.note}</p>}
        <div
          aria-hidden="true"
          className={`relative mt-6 h-1 w-full ${accent ? "bg-flare-500/60" : "bg-white/10"}`}
        />
      </div>
    </div>
  );
}
