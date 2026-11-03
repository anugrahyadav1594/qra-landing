"use client";

import Link from "next/link";
import { useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { Monogram } from "@/components/tournament/CollegeWall";
import { Button, Skeleton, StatusPill } from "@/components/tournament/ui";
import { displayRegistrationId, formatDateTime, type TournamentConfig } from "@/lib/tournament";

export function RegistrationSuccess({
  config,
  justRegistered = false,
}: {
  config: TournamentConfig;
  justRegistered?: boolean;
}) {
  const { status, registration } = useAuth();
  const [copied, setCopied] = useState(false);

  if (status === "loading") {
    return (
      <div className="arena-panel arena-panel-sm p-8">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-4 h-10 w-2/3" />
        <Skeleton className="mt-6 h-24 w-full" />
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="arena-panel arena-panel-sm p-8 text-center">
        <h1 className="font-display text-2xl font-semibold text-bone">No entry found</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ash">
          We could not find a registration for this session. If you registered with another email
          address, sign in with it — otherwise start a new entry.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/tournament/register" className="btn-flare arena-focus rounded-full px-5 py-2.5 text-sm">
            Register now
          </Link>
          <Link href="/tournament/dashboard" className="btn-ghost arena-focus rounded-full px-5 py-2.5 text-sm">
            Go to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const registrationId = displayRegistrationId(registration);

  async function copyId() {
    try {
      await navigator.clipboard.writeText(registrationId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="arena-panel arena-panel-sm relative overflow-hidden p-6 sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, rgba(244,124,53,0.6), transparent 65%)" }}
        />

        <p className="relative font-mono text-[10px] uppercase tracking-[0.3em] text-flare-300">
          {justRegistered ? "Entry received" : "Your entry"}
        </p>

        <h1 className="relative mt-4 font-display text-3xl font-semibold uppercase leading-[1.02] tracking-tightest text-bone sm:text-5xl">
          You&apos;re in.
          <br />
          <span className="text-flare-500">Welcome to the arena.</span>
        </h1>

        <p className="relative mt-5 max-w-xl text-sm leading-relaxed text-ash">
          Your registration for {config.name} has been recorded. Keep your registration ID — it
          identifies your entry in every communication with the organisers.
        </p>

        <div className="relative mt-8 flex flex-wrap items-center gap-4 rounded-lg border border-flare-500/25 bg-flare-500/[0.06] px-5 py-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-ash">
              Registration ID
            </p>
            <p className="mt-1 font-mono text-xl font-semibold tracking-[0.14em] text-flare-300">
              {registrationId}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={copyId} className="ml-auto">
            {copied ? "Copied" : "Copy ID"}
          </Button>
        </div>

        <dl className="relative mt-8 grid gap-6 sm:grid-cols-2">
          <Detail label="Participant" value={registration.full_name} />
          <Detail label="Email" value={registration.email} />
          <Detail
            label="College"
            value={
              registration.college_name
                ? `${registration.college_name}${registration.college_location ? ` · ${registration.college_location}` : ""}`
                : "—"
            }
            logoUrl={registration.college_logo_url}
            collegeName={registration.college_name}
          />
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.24em] text-ash">Status</dt>
            <dd className="mt-2">
              <StatusPill status={registration.status} />
            </dd>
          </div>
          <Detail label="Tournament" value={config.name} />
          <Detail label="Submitted" value={formatDateTime(registration.created_at) ?? "—"} />
        </dl>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="arena-panel arena-panel-sm p-6 sm:p-8">
          <h2 className="font-display text-lg font-semibold text-bone">What happens next</h2>
          <ol className="mt-5 space-y-4">
            {[
              {
                title: "Your entry is logged",
                detail: "Your registration ID is live and visible in your dashboard at any time.",
              },
              {
                title: "Review, if the organisers enable it",
                detail:
                  registration.status === "approved"
                    ? "Your entry is approved. Announcements will cover the next steps."
                    : "Entries are reviewed against the published rules; your dashboard status changes the moment a decision is made.",
              },
              {
                title: "College-level qualifying rounds",
                detail:
                  config.qualifying_round_info ??
                  "Detailed qualifying-round guidelines will be announced soon.",
              },
              {
                title: "Announcements",
                detail:
                  "Dates, venue and round structure are published as announcements and in your dashboard — never guessed beforehand.",
              },
            ].map((item, index) => (
              <li key={item.title} className="flex gap-4">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-flare-500/40 font-mono text-[10px] text-flare-300">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-bone">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ash">{item.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-5">
          <div className="arena-panel arena-panel-sm p-6 sm:p-8">
            <h2 className="font-display text-lg font-semibold text-bone">Your dashboard</h2>
            <p className="mt-3 text-sm leading-relaxed text-ash">
              Everything about your own entry — status, announcements, milestones and the rules —
              lives in one place.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/tournament/dashboard" className="btn-flare arena-focus rounded-full px-5 py-2.5 text-sm">
                Open dashboard
              </Link>
              <Link href="/tournament/leaderboard" className="btn-ghost arena-focus rounded-full px-5 py-2.5 text-sm">
                Leaderboard
              </Link>
            </div>
          </div>

          <p className="px-1 text-xs leading-relaxed text-ash/80">
            A confirmation email is sent to {registration.email} whenever outbound email is
            configured for the platform. Your entry is recorded either way — the dashboard is always
            the source of truth.
          </p>
        </div>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
  logoUrl,
  collegeName,
}: {
  label: string;
  value: string;
  logoUrl?: string | null;
  collegeName?: string | null;
}) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-[0.24em] text-ash">{label}</dt>
      <dd className="mt-2 flex items-center gap-3 text-sm text-bone">
        {logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="" className="h-8 w-8 object-contain" />
        )}
        {!logoUrl && collegeName && <Monogram name={collegeName} className="h-8 w-8 text-[10px]" />}
        <span className="min-w-0 break-words">{value}</span>
      </dd>
    </div>
  );
}
