"use client";

import { useEffect, useMemo, useState } from "react";

import { Reveal } from "@/components/Reveal";
import { BriefingMotif, CornerMarks, TickRule } from "@/components/tournament/motifs";
import {
  CoordNote,
  SectionIntro,
  StatusTag,
  Surface,
  TechLabel,
} from "@/components/tournament/primitives";
import { countdownParts, formatDateTime, type TournamentConfig } from "@/lib/tournament";

type Row = { label: string; value: string | null };

/**
 * SECTION E — Tournament Briefing Board.
 *
 * A technical information sheet rather than a table: an indexed left rail,
 * a status panel that states plainly whether registrations are open and
 * how much of the briefing is confirmed, and a countdown that only exists
 * once a real event date is configured.
 *
 * Every unconfirmed field renders an explicit "To be announced" state — the
 * section stays complete with an empty configuration.
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
      className="mtt-section mtt-grid scroll-mt-20 overflow-hidden bg-arena-950"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-24 h-[26rem] w-[26rem] opacity-70"
        style={{
          background: "radial-gradient(circle, rgba(255,121,47,0.09), transparent 68%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-12">
            <div className="lg:col-span-8">
              <SectionIntro
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
            </div>

            <div className="lg:col-span-4">
              <div className="border-t border-white/10 pt-5">
                <div className="flex items-baseline justify-between gap-4">
                  <TechLabel>Briefing confirmed</TechLabel>
                  <span className="mtt-figure font-display text-2xl font-semibold text-bone">
                    {String(announcedCount).padStart(2, "0")}
                    <span className="text-muted">/{String(rows.length).padStart(2, "0")}</span>
                  </span>
                </div>
                <TickRule className="mt-4 text-white/20" ticks={14} />
                <p className="mt-4 text-xs leading-relaxed text-muted">
                  {announcedCount === rows.length
                    ? "Every field on this sheet has been confirmed by the organisers."
                    : "Remaining fields are published here the moment they are confirmed."}
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:mt-14 lg:grid-cols-12 lg:gap-6">
          {/* ── Status panel ─────────────────────────────────────────── */}
          <Reveal className="lg:col-span-5">
            <Countdown target={config.event_starts_at} />

            <Surface className="relative mt-5 overflow-hidden p-6 sm:p-7">
              <BriefingMotif className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 text-flare-500/25" />
              <div className="relative">
                <div className="flex items-center justify-between gap-4">
                  <TechLabel>Status</TechLabel>
                  <StatusTag state={config.registrations_open ? "live" : "closed"}>
                    {config.registrations_open ? "Registrations open" : "Registrations closed"}
                  </StatusTag>
                </div>

                <dl className="mt-5 space-y-3.5">
                  {[
                    { label: "Participation", value: config.participation_type },
                    { label: "Qualifiers", value: config.qualifying_format },
                    { label: "Location", value: config.location_context },
                    { label: "Prize pool", value: `₹${config.prize_pool_total.toLocaleString("en-IN")}` },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-baseline justify-between gap-4 border-b border-white/[0.06] pb-3 last:border-0 last:pb-0"
                    >
                      <dt className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted">
                        {row.label}
                      </dt>
                      <dd className="text-right text-sm text-bone">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Surface>
          </Reveal>

          {/* ── The information sheet ────────────────────────────────── */}
          <Reveal className="lg:col-span-7">
            <Surface marks className="relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-4 sm:px-7">
                <div className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 bg-flare-500" aria-hidden="true" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-ash">
                    Tournament sheet
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CoordNote>MTT / Briefing</CoordNote>
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-flare-300/80">
                    {announcedCount}/{rows.length} confirmed
                  </span>
                </div>
              </div>

              <dl className="divide-y divide-white/[0.06]">
                {rows.map((row, index) => (
                  <div
                    key={row.label}
                    className="grid gap-2 px-5 py-4 transition-colors duration-300 hover:bg-white/[0.015] sm:grid-cols-[2rem_10rem_1fr] sm:items-baseline sm:gap-5 sm:px-7"
                  >
                    <span
                      className="mtt-figure font-mono text-[11px] tracking-[0.12em] text-flare-500/70"
                      aria-hidden="true"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-ash">
                      {row.label}
                    </dt>
                    <dd className="sm:text-right">
                      {row.value ? (
                        <span className="text-sm leading-relaxed text-bone">{row.value}</span>
                      ) : (
                        <span className="inline-flex items-center gap-2">
                          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                            To be announced
                          </span>
                          <span
                            aria-hidden="true"
                            className="h-px w-6 border-t border-dashed border-white/20"
                          />
                        </span>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="flex flex-col gap-2 border-t border-white/[0.07] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                <p className="text-xs leading-relaxed text-muted">
                  Questions about the tournament? Reach the organisers at{" "}
                  {config.contact_email ? (
                    <a
                      href={`mailto:${config.contact_email}`}
                      className="arena-focus rounded text-flare-300 underline decoration-flare-500/40 underline-offset-4"
                    >
                      {config.contact_email}
                    </a>
                  ) : (
                    <a
                      href="/contact"
                      className="arena-focus rounded text-flare-300 underline decoration-flare-500/40 underline-offset-4"
                    >
                      the Quant Relic contact page
                    </a>
                  )}
                  .
                </p>
                <CoordNote className="sm:text-right">
                  Last updated{" "}
                  {config.updated_at ? formatDateTime(config.updated_at) : "—"}
                </CoordNote>
              </div>
            </Surface>
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
      <Surface tone="flare" className="relative overflow-hidden p-7 sm:p-9">
        <CornerMarks className="text-flare-400/50" />
        <div className="relative">
          <div className="flex items-center justify-between gap-4">
            <TechLabel className="text-flare-300/70">Event date</TechLabel>
            <StatusTag state="pending">Date not set</StatusTag>
          </div>
          <p className="mt-6 max-w-sm font-display text-2xl font-semibold leading-snug text-bone sm:text-[1.75rem]">
            The date is not set yet.
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-ash">
            We do not run a countdown to a date that has not been announced. As soon as the
            organisers confirm the event date it appears here automatically.
          </p>
          <div className="mt-7 flex items-end gap-1.5" aria-hidden="true">
            {["--", "--", "--", "--"].map((cell, index) => (
              <div key={index} className="flex-1">
                <div className="border border-dashed border-white/12 py-3 text-center font-display text-xl text-white/15">
                  {cell}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between">
            <TechLabel>Days</TechLabel>
            <TechLabel>Hours</TechLabel>
            <TechLabel>Minutes</TechLabel>
            <TechLabel>Seconds</TechLabel>
          </div>
        </div>
      </Surface>
    );
  }

  if (parts.elapsed) {
    return (
      <Surface tone="flare" className="relative overflow-hidden p-7 sm:p-9">
        <div className="relative">
          <div className="flex items-center justify-between gap-4">
            <TechLabel className="text-flare-300/70">Event date</TechLabel>
            <StatusTag state="live">Scheduled</StatusTag>
          </div>
          <p className="mtt-figure mt-6 font-display text-3xl font-semibold leading-tight text-bone sm:text-4xl">
            {formatDateTime(target)}
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-ash">
            Follow the announcements for the latest schedule updates.
          </p>
        </div>
      </Surface>
    );
  }

  const cells = [
    { label: "Days", value: parts.days },
    { label: "Hours", value: parts.hours },
    { label: "Minutes", value: parts.minutes },
    { label: "Seconds", value: parts.seconds },
  ];

  return (
    <Surface tone="flare" className="relative overflow-hidden p-7 sm:p-9">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 opacity-70"
        style={{
          background: "radial-gradient(circle, rgba(255,121,47,0.3), transparent 68%)",
        }}
      />
      <div className="relative">
        <div className="flex items-center justify-between gap-4">
          <TechLabel className="text-flare-300/70">Countdown to the arena</TechLabel>
          <StatusTag state="live">Live</StatusTag>
        </div>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ash">
          {formatDateTime(target)}
        </p>
        <div className="mt-7 grid grid-cols-4 gap-2 sm:gap-3">
          {cells.map((cell) => (
            <div
              key={cell.label}
              className="border border-white/10 bg-arena-950/40 px-2 py-3 text-center"
            >
              <p className="mtt-figure font-display text-2xl font-semibold text-bone sm:text-3xl">
                {String(cell.value).padStart(2, "0")}
              </p>
              <p className="mt-1.5 font-mono text-[8px] uppercase tracking-[0.2em] text-muted">
                {cell.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Surface>
  );
}
