import type { Metadata } from "next";

import { ParticipantDashboard } from "@/components/tournament/ParticipantDashboard";
import { ToastProvider } from "@/components/tournament/ui";
import { apiGet } from "@/lib/api";
import { DEFAULT_TOURNAMENT_CONFIG, TOURNAMENT_NAME, type TournamentConfig } from "@/lib/tournament";

export const metadata: Metadata = {
  title: "My dashboard",
  description: `Your ${TOURNAMENT_NAME} registration status, announcements and next steps.`,
  robots: { index: false, follow: false },
};

export const revalidate = 0;

export default async function DashboardPage() {
  const config = await apiGet<TournamentConfig>("/api/v1/tournament", DEFAULT_TOURNAMENT_CONFIG);

  return (
    <div className="arena-surface arena-grain relative min-h-[70vh] py-14 sm:py-20">
      <div className="arena-technical pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-flare-300">
          Participant control centre
        </p>
        <h1 className="mt-4 font-display text-3xl font-semibold uppercase tracking-tightest text-bone sm:text-5xl">
          My arena
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ash">
          Only your own registration is shown here — never another participant&apos;s data.
        </p>

        <div className="mt-10">
          <ToastProvider>
            <ParticipantDashboard config={config} />
          </ToastProvider>
        </div>
      </div>
    </div>
  );
}
