"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Reveal } from "@/components/Reveal";
import { EmptyState, SectionHeader } from "@/components/tournament/ui";
import type { College } from "@/lib/tournament";

const INITIAL_VISIBLE = 12;

/**
 * Participating colleges.
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

  return (
    <section id="colleges" className="relative scroll-mt-20 border-t border-white/8 bg-arena-950 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <SectionHeader
              index="03"
              eyebrow="Participating colleges"
              title={
                <>
                  Campuses
                  <br />
                  in the arena.
                </>
              }
              description="Participants represent their own institution. Colleges are onboarded and verified by the organisers; the list grows as institutions complete onboarding."
            />
            {colleges.length > 0 && (
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ash lg:pb-2">
                {colleges.length} {colleges.length === 1 ? "college" : "colleges"} onboarded
              </p>
            )}
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="mt-12">
            {colleges.length === 0 ? (
              <EmptyState
                icon="grid"
                title="College onboarding is in progress"
                description="Institutions are being verified and onboarded by the organisers. This wall fills up automatically as colleges are added — nothing here is listed until it is confirmed."
                action={
                  <Link href="/contact" className="btn-ghost arena-focus rounded-full px-5 py-2.5 text-sm">
                    Are you a college? Talk to us
                  </Link>
                }
              />
            ) : (
              <>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {visible.map((college) => (
                    <li key={college.id}>
                      <CollegeTile college={college} />
                    </li>
                  ))}
                </ul>

                {colleges.length > INITIAL_VISIBLE && (
                  <div className="mt-8 flex justify-center">
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
              </>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function CollegeTile({ college }: { college: College }) {
  return (
    <div className="logo-tile arena-panel arena-panel-sm flex h-full flex-col gap-4 p-4">
      <div className="grid h-16 place-items-center">
        {college.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={college.logo_url}
            alt={`${college.name} logo`}
            className="max-h-14 w-auto max-w-[80%] object-contain"
            loading="lazy"
          />
        ) : (
          <Monogram name={college.name} />
        )}
      </div>
      <div className="mt-auto">
        <p className="line-clamp-2 text-[13px] font-medium leading-snug text-bone">{college.name}</p>
        {college.location && (
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ash">
            {college.location}
          </p>
        )}
      </div>
    </div>
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
