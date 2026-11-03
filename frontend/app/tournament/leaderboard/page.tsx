import type { Metadata } from "next";
import Link from "next/link";

import { Leaderboard } from "@/components/tournament/Leaderboard";
import { apiGet } from "@/lib/api";
import { DEFAULT_TOURNAMENT_CONFIG, TOURNAMENT_NAME, type TournamentConfig } from "@/lib/tournament";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: `Standings for ${TOURNAMENT_NAME}. Results are published by the organisers once the competition begins.`,
};

export const revalidate = 60;

export default async function LeaderboardPage() {
  const config = await apiGet<TournamentConfig>("/api/v1/tournament", DEFAULT_TOURNAMENT_CONFIG);

  return (
    <div className="arena-surface arena-grain relative min-h-[70vh] py-14 sm:py-20">
      <div className="arena-technical pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-8">
          <Link
            href="/tournament"
            className="arena-focus rounded font-mono text-[10px] uppercase tracking-[0.24em] text-ash transition hover:text-bone"
          >
            ← Back to the tournament
          </Link>
        </nav>

        <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-flare-300">
          Standings
        </p>
        <h1 className="mt-4 font-display text-3xl font-semibold uppercase tracking-tightest text-bone sm:text-5xl">
          Leaderboard
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ash">
          {config.leaderboard_enabled
            ? "Live standings, published from the tournament system."
            : "Rankings appear as soon as the organisers publish the first results. Nothing is estimated or simulated."}
        </p>

        <div className="mt-10">
          <Leaderboard />
        </div>
      </div>
    </div>
  );
}
