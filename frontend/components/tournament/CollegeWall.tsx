"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Reveal } from "@/components/Reveal";
import { NetworkLattice, TickRule } from "@/components/tournament/motifs";
import {
  CoordNote,
  EmptyStage,
  SectionIntro,
  StatusTag,
  Surface,
  TechLabel,
} from "@/components/tournament/primitives";
import type { College } from "@/lib/tournament";

const INITIAL_VISIBLE = 12;

/**
 * SECTION C — Campus Network.
 *
 * Participating institutions are presented as a network: a lattice of
 * connected nodes around the arena. With no confirmed colleges the lattice
 * is the hero of a designed empty state — open slots, dashed links, no
 * invented names or counts. Once colleges are onboarded the same lattice
 * sits behind the real listing, so the transition is continuous.
 *
 * Only active, registration-accepting colleges appear, and only logos an
 * administrator uploaded are shown — when a college has no logo we render a
 * typographic monogram rather than inventing a crest.
 */
export function CollegeWall({ colleges }: { colleges: College[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = useMemo(
    () => (expanded ? colleges : colleges.slice(0, INITIAL_VISIBLE)),
    [colleges, expanded],
  );
  const onboarded = colleges.length;
  const openSlots = Math.max(8 - onboarded, 0);

  return (
    <section
      id="colleges"
      className="mtt-section mtt-grid scroll-mt-20 overflow-hidden bg-arena-950"
    >
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-12">
            <div className="lg:col-span-8">
              <SectionIntro
                index="03"
                eyebrow="Participating colleges"
                title={
                  <>
                    Campuses
                    <br />
                    in the arena.
                  </>
                }
                description="Participants represent their own institution. Colleges are onboarded and verified by the organisers; the network grows as institutions complete onboarding."
              />
            </div>

            <div className="lg:col-span-4">
              <div className="border-t border-white/10 pt-5">
                <div className="flex items-baseline justify-between gap-4">
                  <TechLabel>{onboarded > 0 ? "Onboarded" : "Network status"}</TechLabel>
                  <span className="mtt-figure font-display text-2xl font-semibold text-bone">
                    {String(onboarded).padStart(2, "0")}
                  </span>
                </div>
                <TickRule className="mt-4 text-white/20" ticks={14} />
                <p className="mt-4 text-xs leading-relaxed text-muted">
                  {onboarded > 0
                    ? `${onboarded} ${onboarded === 1 ? "college" : "colleges"} onboarded — more institutions are being verified.`
                    : "Onboarding is open. Institutions are verified before they appear here."}
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="mt-12 sm:mt-14">
            {colleges.length === 0 ? (
              <EmptyStage
                label="03 / Campus network"
                motif={<NetworkLattice className="h-auto w-full" />}
                title="The arena is expanding"
                description="College onboarding is in progress — institutions are being verified by the organisers and slots in the network are filling up. Nothing is listed here until an institution is confirmed, so every name you see is real."
                action={
                  <>
                    <Link
                      href="/contact"
                      className="btn-flare arena-focus rounded-full px-6 py-3 text-sm"
                    >
                      Are you a college? Talk to us
                    </Link>
                    <Link
                      href="/tournament/register"
                      className="btn-ghost arena-focus rounded-full px-6 py-3 text-sm"
                    >
                      Register as a participant
                    </Link>
                  </>
                }
                footnote={
                  <>
                    Institution enquiries are handled by the organisers:{" "}
                    <span className="text-ash">
                      onboarding requests are reviewed before a college is added to the network.
                    </span>
                  </>
                }
              />
            ) : (
              <Surface className="relative overflow-hidden p-5 sm:p-8">
                {/* The lattice sits behind the real listing */}
                <NetworkLattice
                  className="pointer-events-none absolute -right-10 -top-6 h-full max-h-[26rem] w-auto text-flare-500/25 opacity-40"
                />
                <div className="relative flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] pb-5">
                  <div className="flex items-center gap-3">
                    <TechLabel>Campus network</TechLabel>
                    <span className="h-px w-8 bg-white/12" aria-hidden="true" />
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ash">
                      {onboarded} {onboarded === 1 ? "college" : "colleges"} onboarded
                    </span>
                  </div>
                  <StatusTag state="confirmed">Verified institutions</StatusTag>
                </div>

                <ul className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {visible.map((college, index) => (
                    <li key={college.id}>
                      <CollegeTile college={college} node={index + 1} />
                    </li>
                  ))}
                  {/* Open slots — clearly marked as unfilled, never as members */}
                  {Array.from({ length: Math.min(openSlots, 4) }).map((_, index) => (
                    <li key={`slot-${index}`} aria-hidden="true">
                      <div className="flex h-full min-h-[8.5rem] flex-col items-center justify-center gap-2 rounded-none border border-dashed border-white/10 bg-white/[0.012] p-4">
                        <span className="h-8 w-8 rotate-45 border border-dashed border-white/15" />
                        <span className="mtt-coord text-[8px]">Open slot</span>
                      </div>
                    </li>
                  ))}
                </ul>

                {colleges.length > INITIAL_VISIBLE && (
                  <div className="relative mt-8 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setExpanded((value) => !value)}
                      aria-expanded={expanded}
                      className="btn-ghost arena-focus rounded-full px-6 py-3 text-sm"
                    >
                      {expanded
                        ? "Show fewer colleges"
                        : `View all colleges (${colleges.length})`}
                    </button>
                  </div>
                )}
              </Surface>
            )}
          </div>
        </Reveal>

        {colleges.length > 0 && (
          <Reveal>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-xl text-xs leading-relaxed text-muted">
                Missing your institution? College onboarding is handled by the organisers — write to
                us and we will route the request to the onboarding team.
              </p>
              <Link
                href="/contact"
                className="arena-focus rounded font-mono text-[10px] uppercase tracking-[0.24em] text-flare-300 underline decoration-flare-500/40 underline-offset-4 transition hover:text-flare-200"
              >
                Institution enquiry
              </Link>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

function CollegeTile({ college, node }: { college: College; node: number }) {
  return (
    <Surface hover className="group flex h-full flex-col gap-4 p-4">
      <div className="grid h-16 place-items-center">
        {college.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={college.logo_url}
            alt={`${college.name} logo`}
            className="max-h-14 w-auto max-w-[80%] object-contain opacity-80 transition duration-300 [filter:grayscale(1)] group-hover:[filter:grayscale(0)]"
            loading="lazy"
          />
        ) : (
          <Monogram name={college.name} />
        )}
      </div>
      <div className="mt-auto">
        <p className="line-clamp-2 text-[13px] font-medium leading-snug text-bone">{college.name}</p>
        {college.location && (
          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
            {college.location}
          </p>
        )}
      </div>
      <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
        <CoordNote>Node {String(node).padStart(2, "0")}</CoordNote>
        <span className="mtt-tag mtt-tag-confirmed !px-2 !py-1 !text-[8px]">
          <span className="mtt-dot" />
          Onboarded
        </span>
      </div>
    </Surface>
  );
}

export function Monogram({ name, className = "" }: { name: string; className?: string }) {
  const initials = name
    .replace(/[^A-Za-z0-9 &]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 || /^[A-Z]/.test(word))
    .slice(0, 3)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <span
      aria-hidden="true"
      className={`grid h-12 w-12 place-items-center rounded-full border border-flare-500/35 bg-flare-500/8 font-display text-sm font-semibold tracking-tight text-flare-300 ${className}`}
    >
      {initials || "MTT"}
    </span>
  );
}
