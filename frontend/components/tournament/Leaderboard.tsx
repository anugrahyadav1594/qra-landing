"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { EmptyState, ErrorState, Skeleton } from "@/components/tournament/ui";
import { RingGlyph } from "@/components/tournament/ui";
import { fetchLeaderboard } from "@/lib/tournamentApi";
import { formatDateTime, type LeaderboardPayload } from "@/lib/tournament";

/**
 * Standings are real or absent — there is no client-side demo data and no
 * fabricated ranks. Before the competition begins the section shows the
 * pre-event state.
 */
export function Leaderboard() {
  const [board, setBoard] = useState<LeaderboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchLeaderboard();
        if (!cancelled) setBoard(data);
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Could not load the leaderboard.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    );
  }

  if (error) return <ErrorState message={error} />;

  if (!board || !board.enabled || board.entries.length === 0) {
    return (
      <div className="arena-panel arena-panel-sm relative overflow-hidden px-6 py-16 text-center">
        <div className="mx-auto mb-6 h-24 w-24 opacity-80">
          <RingGlyph className="h-full w-full" />
        </div>
        <h2 className="font-display text-2xl font-semibold uppercase tracking-tightest text-bone sm:text-4xl">
          The arena is waiting.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-ash">
          Leaderboard standings will appear once the competition begins. Results are published by
          the organisers directly from the tournament system — nothing here is estimated,
          simulated or filled in ahead of time.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/tournament/register" className="btn-flare arena-focus rounded-full px-5 py-2.5 text-sm">
            Register now
          </Link>
          <Link href="/tournament/rules" className="btn-ghost arena-focus rounded-full px-5 py-2.5 text-sm">
            Read the rules
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="arena-panel arena-panel-sm overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 px-5 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-ash">
          Live standings · {board.entries.length} entries
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-flare-300/80">
          Updated {formatDateTime(board.updated_at) ?? "—"}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[38rem] text-left">
          <thead>
            <tr className="border-b border-white/8 font-mono text-[10px] uppercase tracking-[0.2em] text-ash">
              <th scope="col" className="px-5 py-3 font-normal">Rank</th>
              <th scope="col" className="px-5 py-3 font-normal">Participant</th>
              <th scope="col" className="px-5 py-3 font-normal">College</th>
              <th scope="col" className="px-5 py-3 text-right font-normal">Score</th>
              <th scope="col" className="px-5 py-3 text-right font-normal">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/6">
            {board.entries.map((entry, index) => {
              const podium = index < 3;
              return (
                <tr key={entry.id ?? index} className={podium ? "bg-flare-500/[0.06]" : ""}>
                  <td className="px-5 py-4">
                    <span
                      className={`font-display text-lg font-semibold ${
                        podium ? "text-flare-300" : "text-bone/80"
                      }`}
                    >
                      {String(entry.rank ?? index + 1).padStart(2, "0")}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-bone">{entry.display_name}</td>
                  <td className="px-5 py-4 text-sm text-ash">{entry.college_name ?? "—"}</td>
                  <td className="px-5 py-4 text-right font-mono text-sm tabular-nums text-bone">
                    {entry.score === null || entry.score === undefined
                      ? "—"
                      : entry.score.toLocaleString("en-IN")}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ash">
                      {entry.qualification_status ?? "—"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {board.entries.length === 0 && (
        <div className="px-5 py-8">
          <EmptyState
            title="No standings published"
            description="Entries appear as soon as the organisers publish results from the tournament system."
          />
        </div>
      )}
    </div>
  );
}
