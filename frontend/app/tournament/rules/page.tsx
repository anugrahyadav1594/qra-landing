import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/Reveal";
import { Markdown } from "@/components/Markdown";
import { SectionHeader } from "@/components/tournament/ui";
import { apiGet } from "@/lib/api";
import { DEFAULT_TOURNAMENT_CONFIG, TOURNAMENT_NAME, type TournamentConfig } from "@/lib/tournament";

export const metadata: Metadata = {
  title: "Rules & regulations",
  description: `Rules, eligibility and competition regulations for ${TOURNAMENT_NAME}.`,
};

export const revalidate = 120;

const CONFIRMED_RULES = [
  {
    title: "Individual participation",
    body: "Every participant enters and competes individually. There are no teams to form, no invitations to send and no team management.",
  },
  {
    title: "College selection from the onboarded list",
    body: "Each participant selects one college from the list onboarded by the organisers. Free-text college names are not accepted, so every entry is attributable to a verified campus.",
  },
  {
    title: "College-level qualifying rounds",
    body: "Registrations are grouped by college and college-level qualifying rounds are conducted. The detailed qualifying-round guidelines are published by the organisers.",
  },
  {
    title: "One entry per participant",
    body: "Duplicate registrations for the same email address are prevented by the platform. If you need to correct a detail, edit your entry from your dashboard while it is under review.",
  },
  {
    title: "Registration is not a confirmed slot",
    body: "Submitting an entry records your intent and details. Depending on the configured review process, entries are reviewed before they are approved.",
  },
  {
    title: "Educational competition",
    body: "The tournament is an educational competition. It is not investment advice and does not involve real client capital or any payment during registration.",
  },
];

export default async function RulesPage() {
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

        <Reveal>
          <SectionHeader
            eyebrow="Rules & regulations"
            title={
              <>
                How the
                <br />
                tournament is run.
              </>
            }
            description="These are the confirmed rules. Anything the organisers have not published yet — scoring, round durations, qualification quotas, dates and venue — is marked as to be announced rather than invented."
          />
        </Reveal>

        {config.rules_md && (
          <Reveal delay={60}>
            <div className="arena-panel arena-panel-sm mt-12 p-6 sm:p-8">
              <Markdown source={config.rules_md} />
            </div>
          </Reveal>
        )}

        <ol className="mt-12 space-y-px">
          {CONFIRMED_RULES.map((rule, index) => (
            <li key={rule.title} className="timeline-node">
              <div className="grid gap-3 border-t border-white/8 py-6 sm:grid-cols-[3.5rem_1fr] sm:gap-8">
                <span className="font-mono text-xs tracking-[0.24em] text-flare-500/80">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2 className="font-display text-lg font-semibold text-bone">{rule.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-ash">{rule.body}</p>
                </div>
              </div>
            </li>
          ))}
          <li className="border-t border-white/8" />
        </ol>

        <Reveal delay={80}>
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            <FactCard label="Eligibility" value={config.eligibility} />
            <FactCard label="Qualifying rounds" value={config.qualifying_round_info} />
            <FactCard label="Competition format" value={config.competition_format} />
            <FactCard label="Venue" value={config.venue} />
          </div>
        </Reveal>

        <p className="mt-10 text-xs leading-relaxed text-ash/80">
          Rules may be updated by the organisers; every update is announced and the current version
          always lives on this page. Questions?{" "}
          <Link href="/contact" className="arena-focus rounded text-flare-300 underline underline-offset-4">
            Contact Quant Relic
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

function FactCard({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="arena-panel arena-panel-sm p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-ash">{label}</p>
      <p
        className={`mt-3 text-sm leading-relaxed ${
          value ? "text-bone" : "font-mono text-[11px] uppercase tracking-[0.2em] text-ash/60"
        }`}
      >
        {value ?? "To be announced"}
      </p>
    </div>
  );
}
