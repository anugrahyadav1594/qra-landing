import type { Metadata } from "next";
import Link from "next/link";

import { SectionHeader } from "@/components/tournament/ui";
import { TournamentFAQ } from "@/components/tournament/TournamentFAQ";
import { apiGet } from "@/lib/api";
import { DEFAULT_TOURNAMENT_CONFIG, TOURNAMENT_NAME, type TournamentConfig } from "@/lib/tournament";

export const metadata: Metadata = {
  title: "Frequently asked questions",
  description: `Answers about entries, college selection, prizes and qualifying rounds for ${TOURNAMENT_NAME}.`,
};

export const revalidate = 120;

export default async function FaqPage() {
  const config = await apiGet<TournamentConfig>("/api/v1/tournament", DEFAULT_TOURNAMENT_CONFIG);

  return (
    <div className="arena-surface arena-grain relative py-14 sm:py-20">
      <div className="arena-technical pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-8">
          <Link
            href="/tournament"
            className="arena-focus rounded font-mono text-[10px] uppercase tracking-[0.24em] text-ash transition hover:text-bone"
          >
            ← Back to the tournament
          </Link>
        </nav>

        <SectionHeader
          eyebrow="Frequently asked questions"
          title={
            <>
              Everything
              <br />
              before you enter.
            </>
          }
          description="Participation, colleges, prizes and qualifying rounds — answered with the confirmed facts only. Anything the organisers have not published yet says so explicitly."
        />

        <div className="mt-12">
          <TournamentFAQ config={config} layout="stacked" />
        </div>

        <div className="mt-14 flex flex-wrap items-center gap-4 border-t border-white/8 pt-8">
          <Link href="/tournament/register" className="btn-flare arena-focus rounded-full px-6 py-3 text-sm">
            Register now
          </Link>
          <Link
            href="/contact"
            className="arena-focus rounded font-mono text-[11px] uppercase tracking-[0.22em] text-ash underline underline-offset-4 hover:text-bone"
          >
            Still stuck? Contact the organisers
          </Link>
        </div>
      </div>
    </div>
  );
}
