import type { Metadata } from "next";
import Link from "next/link";

import { AdminConsole } from "@/components/tournament/admin/AdminConsole";
import { ToastProvider } from "@/components/tournament/ui";
import { apiGet } from "@/lib/api";
import { DEFAULT_TOURNAMENT_CONFIG, TOURNAMENT_NAME, type TournamentConfig } from "@/lib/tournament";

export const metadata: Metadata = {
  title: "Tournament admin",
  description: `Administration console for ${TOURNAMENT_NAME}: registrations, colleges, sponsors, configuration and announcements.`,
  robots: { index: false, follow: false },
};

export const revalidate = 0;

export default async function AdminTournamentPage() {
  const config = await apiGet<TournamentConfig>("/api/v1/tournament", DEFAULT_TOURNAMENT_CONFIG);

  return (
    <div className="arena-surface arena-grain relative min-h-[80vh] py-10 sm:py-14">
      <div className="arena-technical pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-6">
          <Link
            href="/tournament"
            className="arena-focus rounded font-mono text-[10px] uppercase tracking-[0.24em] text-ash transition hover:text-bone"
          >
            ← Back to the tournament
          </Link>
        </nav>

        <p className="mb-6 rounded-md border border-white/8 bg-white/[0.02] px-4 py-3 text-xs leading-relaxed text-ash">
          This console is protected on the server: every admin endpoint verifies the session and
          administrator role before reading or writing anything, and each privileged action is
          written to the audit log.
        </p>

        <ToastProvider>
          <AdminConsole initialConfig={config} />
        </ToastProvider>
      </div>
    </div>
  );
}
