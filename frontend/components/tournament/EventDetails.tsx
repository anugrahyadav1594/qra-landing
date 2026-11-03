"use client";

import { useEffect, useMemo, useState } from "react";

import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/tournament/ui";
import { countdownParts, formatDateTime, type TournamentConfig } from "@/lib/tournament";

type Row = { label: string; value: string | null; note?: string };

/**
 * Event details sheet. Every unconfirmed field renders an explicit
 * "To be announced" state — the section stays complete and polished with an
 * empty configuration, and the countdown only exists when a real date is set.
 */
export function EventDetails({ config }: { config: TournamentConfig }) {
  const rows: Row[] = [
    { label: "Event date", value: formatDateTime(config.event_starts_at) },
    { label: "Registrations open", value: formatDateTime(config.registration_opens_at) },
    { label: "Registrations close", value: formatDateTime(config.registration_closes_at) },
    { label: "Venue", value: config.venue },
    { label: "Eligibility", value: config.eligibility },
    { label: "Competition format", value: config.competition_format },
    { label: "Qualifying rounds", value: config.qualifying_round_info },
    { label: "Final round", value: config.final_round_info },
  ];

  const announcedCount = rows.filter((row) => row.value).length;

  return (
    <section
      id="event-details"
      className="relative scroll-mt-20 border-t border-white/8 bg-arena-950 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHeader
            index="05"
            eyebrow="Event details"
            title={
              <>
                The brief.
                <br />
                Updated as it is confirmed.
              </>
            }
            description="Dates, venue, eligibility and round structure are published by the organisers as soon as they are locked. Anything still open is marked clearly instead of being guessed."
          />
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal delay={60}>
            <Countdown target={config.event_starts_at} />
          </Reveal>

          <Reveal delay={120}>
            <div className="arena-panel arena-panel-sm overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/8 px-5 py-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-ash">
                  Tournament sheet
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-flare-300/80">
                  {announcedCount}/{rows.length} confirmed
                </p>
              </div>
              <dl className="divide-y divide-white/6">
                {rows.map((row) => (
                  <div
                    key={row.label}
                    className="grid gap-1 px-5 py-4 sm:grid-cols-[11rem_1fr] sm:items-baseline sm:gap-6"
                  >
                    <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-ash">
                      {row.label}
                    </dt>
                    <dd
                      className={
                        row.value
                          ? "text-sm leading-relaxed text-bone"
                          : "font-mono text-[11px] uppercase tracking-[0.2em] text-ash/60"
                      }
                    >
                      {row.value ?? "To be announced"}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="border-t border-white/8 px-5 py-4">
                <p className="text-xs leading-relaxed text-ash">
                  Questions about the tournament? Reach the organisers at{" "}
                  {config.contact_email ? (
                    <a
                      href={`mailto:${config.contact_email}`}
                      className="arena-focus rounded text-flare-300 underline underline-offset-4"
                    >
                      {config.contact_email}
                    </a>
                  ) : (
                    <a href="/contact" className="arena-focus rounded text-flare-300 underline underline-offset-4">
                      the Quant Relic contact page
                    </a>
                  )}
                  .
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/** Countdown rendered only when a real event date has been configured. */
export function Countdown({ target }: { target: string | null }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!target) return;
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, [target]);

  const parts = useMemo(() => countdownParts(target, now), [target, now]);

  if (!parts) {
    return (
      <div className="arena-panel arena-panel-sm relative overflow-hidden p-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-flare-300">
          Countdown
        </p>
        <p className="mt-4 font-display text-2xl font-semibold leading-snug text-bone">
          The date is not set yet.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ash">
          We do not run a countdown to a date that has not been announced. As soon as the
          organisers confirm the event date it appears here automatically.
        </p>
      </div>
    );
  }

  if (parts.elapsed) {
    return (
      <div className="arena-panel arena-panel-sm relative overflow-hidden p-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-flare-300">
          Event date
        </p>
        <p className="mt-4 font-display text-2xl font-semibold leading-snug text-bone">
          {formatDateTime(target)}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ash">
          Follow the announcements for the latest schedule updates.
        </p>
      </div>
    );
  }

  const cells = [
    { label: "Days", value: parts.days },
    { label: "Hours", value: parts.hours },
    { label: "Minutes", value: parts.minutes },
    { label: "Seconds", value: parts.seconds },
  ];

  return (
    <div className="arena-panel arena-panel-sm relative overflow-hidden p-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, rgba(244,124,53,0.6), transparent 65%)" }}
      />
      <p className="relative font-mono text-[10px] uppercase tracking-[0.28em] text-flare-300">
        Countdown to the arena
      </p>
      <p className="relative mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ash">
        {formatDateTime(target)}
      </p>
      <div className="relative mt-7 grid grid-cols-4 gap-2 sm:gap-3">
        {cells.map((cell) => (
          <div
            key={cell.label}
            className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-3 text-center"
          >
            <p className="font-display text-2xl font-semibold tabular-nums text-bone sm:text-3xl">
              {String(cell.value).padStart(2, "0")}
            </p>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-ash">
              {cell.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
