"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import {
  Button,
  Checkbox,
  EmptyState,
  ErrorState,
  Field,
  Modal,
  Select,
  Skeleton,
  StatusPill,
  TextInput,
  useToast,
} from "@/components/tournament/ui";
import {
  adminApi,
  type AdminOverview,
  type AdminRegistrationList,
  type AuditEntry,
} from "@/lib/tournamentApi";
import {
  SPONSOR_CATEGORIES,
  SPONSOR_CATEGORY_LABELS,
  formatDateTime,
  formatINR,
  validatePrizeConfig,
  type Announcement,
  type College,
  type Registration,
  type Sponsor,
  type TournamentConfig,
} from "@/lib/tournament";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "registrations", label: "Registrations" },
  { id: "colleges", label: "Colleges" },
  { id: "sponsors", label: "Sponsors" },
  { id: "config", label: "Event configuration" },
  { id: "announcements", label: "Announcements" },
  { id: "leaderboard", label: "Leaderboard" },
  { id: "audit", label: "Audit log" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const STATUSES = [
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "waitlisted",
  "cancelled",
];

export function AdminConsole({ initialConfig }: { initialConfig: TournamentConfig | null }) {
  const { status, user, authHeaders } = useAuth();
  const { push } = useToast();
  const [tab, setTab] = useState<TabId>("overview");
  const [config, setConfig] = useState<TournamentConfig | null>(initialConfig);

  const headers = useMemo(() => authHeaders(), [authHeaders]);

  if (status === "signed-out") {
    return (
      <div className="arena-panel arena-panel-sm p-8 text-center">
        <h1 className="font-display text-2xl font-semibold text-bone">Administrator sign-in</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ash">
          The admin console is protected on the server. Sign in with an administrator email to
          continue.
        </p>
        <Link href="/tournament/register" className="btn-flare arena-focus mt-6 inline-flex rounded-full px-5 py-2.5 text-sm">
          Sign in
        </Link>
      </div>
    );
  }

  if (user && !user.is_admin) {
    return (
      <div className="arena-panel arena-panel-sm p-8 text-center">
        <h1 className="font-display text-2xl font-semibold text-bone">Administrator access required</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ash">
          You are signed in as {user.email}, which does not have tournament administrator rights.
          Access is enforced by the API, not by the interface.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-flare-300">
            Tournament control
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-bone sm:text-3xl">
            Admin console
          </h1>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ash">
          Signed in as {user?.email}
        </p>
      </div>

      <nav aria-label="Admin sections" className="flex flex-wrap gap-2 border-b border-white/8 pb-3">
        {TABS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => setTab(entry.id)}
            aria-current={tab === entry.id ? "page" : undefined}
            className={`arena-focus rounded-full border px-3.5 py-1.5 text-xs transition ${
              tab === entry.id
                ? "border-flare-500/60 bg-flare-500/12 text-flare-300"
                : "border-white/10 text-ash hover:border-white/25 hover:text-bone"
            }`}
          >
            {entry.label}
          </button>
        ))}
      </nav>

      {tab === "overview" && <OverviewTab headers={headers} />}
      {tab === "registrations" && <RegistrationsTab headers={headers} />}
      {tab === "colleges" && <CollegesTab headers={headers} />}
      {tab === "sponsors" && <SponsorsTab headers={headers} />}
      {tab === "config" && (
        <ConfigTab
          headers={headers}
          config={config}
          onSaved={(updated) => {
            setConfig(updated);
            push("Tournament configuration saved.", "success");
          }}
        />
      )}
      {tab === "announcements" && <AnnouncementsTab headers={headers} />}
      {tab === "leaderboard" && (
        <LeaderboardTab
          headers={headers}
          enabled={config?.leaderboard_enabled ?? false}
          onToggled={(enabled) => setConfig((current) => (current ? { ...current, leaderboard_enabled: enabled } : current))}
        />
      )}
      {tab === "audit" && <AuditTab headers={headers} />}
    </div>
  );
}

/* ── Overview ─────────────────────────────────────────────────────────── */

function OverviewTab({ headers }: { headers: Record<string, string> }) {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    adminApi
      .overview(headers)
      .then((result) => !cancelled && setData(result))
      .catch((caught: unknown) =>
        !cancelled && setError(caught instanceof Error ? caught.message : "Could not load overview."),
      );
    return () => {
      cancelled = true;
    };
  }, [headers]);

  if (error) return <ErrorState message={error} />;
  if (!data) return <Skeleton className="h-64 w-full" />;

  const cards = [
    { label: "Total registrations", value: String(data.total_registrations) },
    { label: "Pending review", value: String(data.pending_approvals) },
    { label: "Approved", value: String(data.approved) },
    { label: "Active colleges", value: `${data.active_colleges}/${data.total_colleges}` },
    { label: "Sponsors", value: String(data.sponsor_count) },
    { label: "Announcements", value: String(data.published_announcements) },
  ];

  const maxTrend = Math.max(1, ...data.registrations_last_7_days.map((point) => point.registrations));

  return (
    <div className="space-y-6">
      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="arena-panel arena-panel-sm px-5 py-4">
            <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-ash">
              {card.label}
            </dt>
            <dd className="mt-2 font-display text-3xl font-semibold text-bone">{card.value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <section className="arena-panel arena-panel-sm p-6">
          <h2 className="font-display text-base font-semibold text-bone">Registrations by college</h2>
          {data.by_college.length === 0 ? (
            <p className="mt-4 text-sm text-ash">No registrations recorded yet.</p>
          ) : (
            <ul className="mt-5 space-y-3">
              {data.by_college.map((row) => {
                const max = Math.max(...data.by_college.map((entry) => entry.registrations));
                return (
                  <li key={row.college}>
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="truncate text-bone/90">{row.college}</span>
                      <span className="font-mono text-xs text-flare-300">{row.registrations}</span>
                    </div>
                    <div className="mt-1.5 h-1 w-full bg-white/8">
                      <div
                        className="h-full bg-flare-500"
                        style={{ width: `${(row.registrations / max) * 100}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="arena-panel arena-panel-sm p-6">
          <h2 className="font-display text-base font-semibold text-bone">Last 7 days</h2>
          <div className="mt-6 flex h-32 items-end gap-2">
            {data.registrations_last_7_days.map((point) => (
              <div key={point.date} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-sm bg-gradient-to-t from-flare-600 to-flare-400"
                  style={{ height: `${Math.max(4, (point.registrations / maxTrend) * 100)}%` }}
                  title={`${point.date}: ${point.registrations}`}
                />
                <span className="font-mono text-[9px] text-ash">
                  {point.date.slice(5)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {Object.entries(data.by_status).map(([status, count]) => (
              <span
                key={status}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ash"
              >
                {status.replace(/_/g, " ")} · {count}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ── Registrations ────────────────────────────────────────────────────── */

function RegistrationsTab({ headers }: { headers: Record<string, string> }) {
  const { push } = useToast();
  const [rows, setRows] = useState<AdminRegistrationList | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [colleges, setColleges] = useState<College[]>([]);
  const [collegeId, setCollegeId] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [list, collegeList] = await Promise.all([
        adminApi.registrations(headers, { q: query || undefined, status: status || undefined, college_id: collegeId || undefined }),
        adminApi.colleges(headers),
      ]);
      setRows(list);
      setColleges(collegeList.colleges);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load registrations.");
    }
  }, [headers, query, status, collegeId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function setStatusFor(registration: Registration, nextStatus: string) {
    setBusyId(registration.id);
    try {
      await adminApi.updateRegistration(headers, registration.id, { status: nextStatus });
      push(`${registration.registration_id} → ${nextStatus.replace(/_/g, " ")}`, "success");
      await load();
    } catch (caught) {
      push(caught instanceof Error ? caught.message : "Update failed.", "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Search" htmlFor="admin-search" className="min-w-[14rem]">
          <TextInput
            id="admin-search"
            placeholder="Name, email or registration ID"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </Field>
        <Field label="Status" htmlFor="admin-status" className="min-w-[11rem]">
          <Select id="admin-status" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map((option) => (
              <option key={option} value={option}>
                {option.replace(/_/g, " ")}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="College" htmlFor="admin-college" className="min-w-[12rem]">
          <Select id="admin-college" value={collegeId} onChange={(event) => setCollegeId(event.target.value)}>
            <option value="">All colleges</option>
            {colleges.map((college) => (
              <option key={college.id} value={college.id}>
                {college.name}
              </option>
            ))}
          </Select>
        </Field>
        <a
          href={adminApi.exportCsvUrl({ college_id: collegeId || undefined, status: status || undefined })}
          className="btn-ghost arena-focus rounded-full px-4 py-2.5 text-sm"
        >
          Export CSV
        </a>
        <Button variant="ghost" onClick={() => void load()}>
          Refresh
        </Button>
      </div>

      {error && <ErrorState message={error} onRetry={() => void load()} />}

      {!rows ? (
        <Skeleton className="h-64 w-full" />
      ) : rows.registrations.length === 0 ? (
        <EmptyState title="No registrations yet" description="Entries appear here the moment a participant submits one." />
      ) : (
        <div className="arena-panel arena-panel-sm overflow-x-auto">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead>
              <tr className="border-b border-white/8 font-mono text-[10px] uppercase tracking-[0.18em] text-ash">
                <th scope="col" className="px-4 py-3 font-normal">ID</th>
                <th scope="col" className="px-4 py-3 font-normal">Participant</th>
                <th scope="col" className="px-4 py-3 font-normal">College</th>
                <th scope="col" className="px-4 py-3 font-normal">Submitted</th>
                <th scope="col" className="px-4 py-3 font-normal">Status</th>
                <th scope="col" className="px-4 py-3 text-right font-normal">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {rows.registrations.map((registration) => (
                <tr key={registration.id}>
                  <td className="px-4 py-3 font-mono text-xs text-flare-300">
                    {registration.registration_id}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-bone">{registration.full_name}</p>
                    <p className="text-xs text-ash">{registration.email}</p>
                    <p className="text-xs text-ash">{registration.mobile}</p>
                  </td>
                  <td className="px-4 py-3 text-bone/85">{registration.college_name ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ash">
                    {formatDateTime(registration.created_at) ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={registration.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        disabled={busyId === registration.id || registration.status === "approved"}
                        onClick={() => void setStatusFor(registration, "approved")}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busyId === registration.id || registration.status === "rejected"}
                        onClick={() => void setStatusFor(registration, "rejected")}
                      >
                        Reject
                      </Button>
                      <Select
                        aria-label="Set status"
                        className="w-36 py-1.5 text-xs"
                        value=""
                        onChange={(event) => {
                          if (event.target.value) void setStatusFor(registration, event.target.value);
                        }}
                      >
                        <option value="">Set status…</option>
                        {STATUSES.map((option) => (
                          <option key={option} value={option}>
                            {option.replace(/_/g, " ")}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-white/8 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ash">
            {rows.total} registrations
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Colleges ─────────────────────────────────────────────────────────── */

function CollegesTab({ headers }: { headers: Record<string, string> }) {
  const { push } = useToast();
  const [colleges, setColleges] = useState<College[]>([]);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const result = await adminApi.colleges(headers);
      setColleges(result.colleges);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load colleges.");
    }
  }, [headers]);

  useEffect(() => {
    void load();
  }, [load]);

  async function create(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await adminApi.createCollege(headers, {
        name,
        location: location || undefined,
        description: description || undefined,
        is_active: true,
        accepts_registrations: true,
      });
      setName("");
      setLocation("");
      setDescription("");
      push("College added.", "success");
      await load();
    } catch (caught) {
      push(caught instanceof Error ? caught.message : "Could not add the college.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(college: College, patch: Partial<College>) {
    try {
      await adminApi.updateCollege(headers, college.id, patch);
      push(`${college.name} updated.`, "success");
      await load();
    } catch (caught) {
      push(caught instanceof Error ? caught.message : "Update failed.", "error");
    }
  }

  async function uploadLogo(college: College, file: File) {
    setUploadingId(college.id);
    try {
      await adminApi.uploadLogo(headers, `/api/v1/admin/tournament/colleges/${college.id}/logo`, file);
      push("Logo uploaded.", "success");
      await load();
    } catch (caught) {
      push(caught instanceof Error ? caught.message : "Upload rejected.", "error");
    } finally {
      setUploadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={create} className="arena-panel arena-panel-sm grid gap-4 p-6 sm:grid-cols-2">
        <Field label="College name" htmlFor="college-name" required>
          <TextInput id="college-name" value={name} onChange={(event) => setName(event.target.value)} required />
        </Field>
        <Field label="Location" htmlFor="college-location">
          <TextInput
            id="college-location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Mumbai"
          />
        </Field>
        <Field label="Description (optional)" htmlFor="college-description" className="sm:col-span-2">
          <TextInput
            id="college-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>
        <div className="sm:col-span-2">
          <Button type="submit" loading={busy}>
            Add college
          </Button>
          <p className="mt-2 text-xs text-ash">
            New colleges are active immediately and appear in the registration dropdown.
          </p>
        </div>
        {error && (
          <div className="sm:col-span-2">
            <ErrorState message={error} onRetry={() => void load()} />
          </div>
        )}
      </form>

      {colleges.length === 0 ? (
        <EmptyState
          icon="grid"
          title="No colleges onboarded"
          description="Add the verified institutions. Only active colleges appear on the public wall and in the registration dropdown."
        />
      ) : (
        <ul className="space-y-3">
          {colleges.map((college) => (
            <li
              key={college.id}
              className="arena-panel arena-panel-sm flex flex-wrap items-center gap-4 p-4"
            >
              <div className="grid h-12 w-12 place-items-center overflow-hidden rounded border border-white/10 bg-white/5">
                {college.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={college.logo_url} alt="" className="h-full w-full object-contain" />
                ) : (
                  <span className="font-mono text-[10px] text-ash">No logo</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-bone">{college.name}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ash">
                  {college.location ?? "—"} · {college.registration_count ?? 0} registrations
                </p>
              </div>
              <label className="flex items-center gap-2 text-xs text-ash">
                <input
                  type="checkbox"
                  checked={college.is_active}
                  onChange={(event) => void toggle(college, { is_active: event.target.checked })}
                  className="h-4 w-4 accent-[#F47C35]"
                />
                Active
              </label>
              <label className="flex items-center gap-2 text-xs text-ash">
                <input
                  type="checkbox"
                  checked={college.accepts_registrations}
                  onChange={(event) =>
                    void toggle(college, { accepts_registrations: event.target.checked })
                  }
                  className="h-4 w-4 accent-[#F47C35]"
                />
                Open to registrations
              </label>
              <label className="cursor-pointer rounded-full border border-white/12 px-3 py-1.5 text-xs text-bone/80 transition hover:border-flare-500/60">
                {uploadingId === college.id ? "Uploading…" : "Upload logo"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void uploadLogo(college, file);
                  }}
                />
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── Sponsors ─────────────────────────────────────────────────────────── */

function SponsorsTab({ headers }: { headers: Record<string, string> }) {
  const { push } = useToast();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("other_partner");
  const [website, setWebsite] = useState("");
  const [order, setOrder] = useState("0");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const result = await adminApi.sponsors(headers);
    setSponsors(result.sponsors);
  }, [headers]);

  useEffect(() => {
    void load().catch(() => undefined);
  }, [load]);

  async function create(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await adminApi.createSponsor(headers, {
        name,
        category,
        website_url: website || undefined,
        display_order: Number(order) || 0,
        is_active: true,
      });
      setName("");
      setWebsite("");
      setOrder("0");
      push("Sponsor added.", "success");
      await load();
    } catch (caught) {
      push(caught instanceof Error ? caught.message : "Could not add the sponsor.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function uploadLogo(sponsor: Sponsor, file: File) {
    try {
      await adminApi.uploadLogo(headers, `/api/v1/admin/tournament/sponsors/${sponsor.id}/logo`, file);
      push("Logo uploaded.", "success");
      await load();
    } catch (caught) {
      push(caught instanceof Error ? caught.message : "Upload rejected.", "error");
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={create} className="arena-panel arena-panel-sm grid gap-4 p-6 sm:grid-cols-2">
        <Field label="Name" htmlFor="sponsor-name" required>
          <TextInput id="sponsor-name" value={name} onChange={(event) => setName(event.target.value)} required />
        </Field>
        <Field label="Category" htmlFor="sponsor-category">
          <Select id="sponsor-category" value={category} onChange={(event) => setCategory(event.target.value)}>
            {SPONSOR_CATEGORIES.map((option) => (
              <option key={option} value={option}>
                {SPONSOR_CATEGORY_LABELS[option]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Website (optional)" htmlFor="sponsor-website">
          <TextInput
            id="sponsor-website"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            placeholder="https://"
          />
        </Field>
        <Field label="Display order" htmlFor="sponsor-order">
          <TextInput
            id="sponsor-order"
            inputMode="numeric"
            value={order}
            onChange={(event) => setOrder(event.target.value.replace(/\D/g, ""))}
          />
        </Field>
        <div>
          <Button type="submit" loading={busy}>
            Add sponsor
          </Button>
        </div>
      </form>

      {sponsors.length === 0 ? (
        <EmptyState
          icon="ring"
          title="No sponsors yet"
          description="Partners are added by the organisers and appear on the public sponsor wall as soon as they are active."
        />
      ) : (
        <ul className="space-y-3">
          {sponsors.map((sponsor) => (
            <li key={sponsor.id} className="arena-panel arena-panel-sm flex flex-wrap items-center gap-4 p-4">
              <div className="grid h-12 w-20 place-items-center overflow-hidden rounded border border-white/10 bg-white/5">
                {sponsor.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={sponsor.logo_url} alt="" className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="font-mono text-[10px] text-ash">No logo</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-bone">{sponsor.name}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ash">
                  {SPONSOR_CATEGORY_LABELS[sponsor.category] ?? sponsor.category} · order{" "}
                  {sponsor.display_order}
                </p>
              </div>
              <Select
                aria-label="Sponsor category"
                className="w-44 py-1.5 text-xs"
                value={sponsor.category}
                onChange={(event) =>
                  void adminApi
                    .updateSponsor(headers, sponsor.id, { category: event.target.value })
                    .then(() => {
                      push("Category updated.", "success");
                      return load();
                    })
                    .catch(() => push("Update failed.", "error"))
                }
              >
                {SPONSOR_CATEGORIES.map((option) => (
                  <option key={option} value={option}>
                    {SPONSOR_CATEGORY_LABELS[option]}
                  </option>
                ))}
              </Select>
              <label className="flex items-center gap-2 text-xs text-ash">
                <input
                  type="checkbox"
                  checked={sponsor.is_active}
                  onChange={(event) =>
                    void adminApi
                      .updateSponsor(headers, sponsor.id, { is_active: event.target.checked })
                      .then(() => load())
                  }
                  className="h-4 w-4 accent-[#F47C35]"
                />
                Active
              </label>
              <label className="cursor-pointer rounded-full border border-white/12 px-3 py-1.5 text-xs text-bone/80 transition hover:border-flare-500/60">
                Upload logo
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void uploadLogo(sponsor, file);
                  }}
                />
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── Configuration ────────────────────────────────────────────────────── */

function ConfigTab({
  headers,
  config,
  onSaved,
}: {
  headers: Record<string, string>;
  config: TournamentConfig | null;
  onSaved: (config: TournamentConfig) => void;
}) {
  const { push } = useToast();
  const [form, setForm] = useState(() => ({
    prize_pool_total: config?.prize_pool_total ?? 100000,
    cash_prize_pool: config?.cash_prize_pool ?? 60000,
    goodies_and_merchandise: config?.goodies_and_merchandise ?? 40000,
    champion_prize: config?.champion_prize ?? 25000,
    first_runner_up_prize: config?.first_runner_up_prize ?? 15000,
    second_runner_up_prize: config?.second_runner_up_prize ?? 10000,
    merit_prize_count: config?.merit_prize_count ?? 10,
    merit_prize_amount: config?.merit_prize_amount ?? 1000,
    merit_prize_total: config?.merit_prize_total ?? 10000,
    event_starts_at: config?.event_starts_at ?? "",
    registration_closes_at: config?.registration_closes_at ?? "",
    venue: config?.venue ?? "",
    eligibility: config?.eligibility ?? "",
    qualifying_round_info: config?.qualifying_round_info ?? "",
    final_round_info: config?.final_round_info ?? "",
    competition_format: config?.competition_format ?? "",
    contact_email: config?.contact_email ?? "",
  }));
  const [switches, setSwitches] = useState({
    registrations_open: config?.registrations_open ?? true,
    auto_approve_registrations: config?.auto_approve_registrations ?? false,
    leaderboard_enabled: config?.leaderboard_enabled ?? false,
  });
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const reconciliation = useMemo(() => {
    const merit = Number(form.merit_prize_count) * Number(form.merit_prize_amount);
    const cash =
      Number(form.champion_prize) +
      Number(form.first_runner_up_prize) +
      Number(form.second_runner_up_prize) +
      merit;
    return { merit, cash, total: Number(form.cash_prize_pool) + Number(form.goodies_and_merchandise) };
  }, [form]);

  function update(field: keyof typeof form, value: string | number) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    const payload = {
      prize_pool_total: Number(form.prize_pool_total),
      cash_prize_pool: Number(form.cash_prize_pool),
      goodies_and_merchandise: Number(form.goodies_and_merchandise),
      champion_prize: Number(form.champion_prize),
      first_runner_up_prize: Number(form.first_runner_up_prize),
      second_runner_up_prize: Number(form.second_runner_up_prize),
      merit_prize_count: Number(form.merit_prize_count),
      merit_prize_amount: Number(form.merit_prize_amount),
      merit_prize_total: Number(form.merit_prize_total),
    };
    const validationErrors = validatePrizeConfig(payload);
    setErrors(validationErrors);
    if (validationErrors.length > 0) return;

    setBusy(true);
    try {
      const saved = await adminApi.updateConfig(headers, {
        ...payload,
        event_starts_at: form.event_starts_at || null,
        registration_closes_at: form.registration_closes_at || null,
        venue: form.venue || null,
        eligibility: form.eligibility || null,
        qualifying_round_info: form.qualifying_round_info || null,
        final_round_info: form.final_round_info || null,
        competition_format: form.competition_format || null,
        contact_email: form.contact_email || null,
        ...switches,
      });
      onSaved(saved);
    } catch (caught) {
      push(caught instanceof Error ? caught.message : "Could not save the configuration.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <section className="arena-panel arena-panel-sm p-6">
        <h2 className="font-display text-base font-semibold text-bone">Prize pool</h2>
        <p className="mt-1 text-xs text-ash">
          The pool must reconcile: cash prizes + goodies = total, and merit count × merit amount =
          merit total.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <NumberField label="Total pool" value={form.prize_pool_total} onChange={(value) => update("prize_pool_total", value)} />
          <NumberField label="Cash pool" value={form.cash_prize_pool} onChange={(value) => update("cash_prize_pool", value)} />
          <NumberField label="Goodies" value={form.goodies_and_merchandise} onChange={(value) => update("goodies_and_merchandise", value)} />
          <NumberField label="Champion" value={form.champion_prize} onChange={(value) => update("champion_prize", value)} />
          <NumberField label="First runner-up" value={form.first_runner_up_prize} onChange={(value) => update("first_runner_up_prize", value)} />
          <NumberField label="Second runner-up" value={form.second_runner_up_prize} onChange={(value) => update("second_runner_up_prize", value)} />
          <NumberField label="Merit count" value={form.merit_prize_count} onChange={(value) => update("merit_prize_count", value)} />
          <NumberField label="Merit amount" value={form.merit_prize_amount} onChange={(value) => update("merit_prize_amount", value)} />
          <NumberField label="Merit total" value={form.merit_prize_total} onChange={(value) => update("merit_prize_total", value)} />
        </div>

        <div className="mt-5 flex flex-wrap gap-x-8 gap-y-2 rounded-md border border-white/8 bg-white/[0.02] px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ash">
          <span>
            Merit: {form.merit_prize_count} × {formatINR(form.merit_prize_amount)} ={" "}
            <span className="text-flare-300">{formatINR(reconciliation.merit)}</span>
          </span>
          <span>
            Cash sum: <span className="text-flare-300">{formatINR(reconciliation.cash)}</span> / declared{" "}
            {formatINR(form.cash_prize_pool)}
          </span>
          <span>
            Total: <span className="text-flare-300">{formatINR(reconciliation.total)}</span> / declared{" "}
            {formatINR(form.prize_pool_total)}
          </span>
        </div>

        {errors.length > 0 && (
          <div className="mt-4 space-y-1">
            {errors.map((message) => (
              <p key={message} role="alert" className="text-xs text-red-400">
                {message}
              </p>
            ))}
          </div>
        )}
      </section>

      <section className="arena-panel arena-panel-sm grid gap-4 p-6 sm:grid-cols-2">
        <h2 className="font-display text-base font-semibold text-bone sm:col-span-2">Event details</h2>
        <Field label="Event starts at (ISO date-time)" htmlFor="config-event-start">
          <TextInput
            id="config-event-start"
            value={form.event_starts_at}
            onChange={(event) => update("event_starts_at", event.target.value)}
            placeholder="2026-02-14T09:30"
          />
        </Field>
        <Field label="Registrations close at (ISO date-time)" htmlFor="config-reg-close">
          <TextInput
            id="config-reg-close"
            value={form.registration_closes_at}
            onChange={(event) => update("registration_closes_at", event.target.value)}
            placeholder="2026-02-01T18:00"
          />
        </Field>
        <Field label="Venue" htmlFor="config-venue">
          <TextInput id="config-venue" value={form.venue} onChange={(event) => update("venue", event.target.value)} />
        </Field>
        <Field label="Contact email" htmlFor="config-contact">
          <TextInput
            id="config-contact"
            type="email"
            value={form.contact_email}
            onChange={(event) => update("contact_email", event.target.value)}
          />
        </Field>
        <Field label="Eligibility" htmlFor="config-eligibility" className="sm:col-span-2">
          <textarea
            id="config-eligibility"
            rows={3}
            value={form.eligibility}
            onChange={(event) => update("eligibility", event.target.value)}
            className="input-arena arena-focus rounded-lg"
          />
        </Field>
        <Field label="Qualifying-round information" htmlFor="config-qualifying" className="sm:col-span-2">
          <textarea
            id="config-qualifying"
            rows={3}
            value={form.qualifying_round_info}
            onChange={(event) => update("qualifying_round_info", event.target.value)}
            className="input-arena arena-focus rounded-lg"
          />
        </Field>
        <Field label="Final-round information" htmlFor="config-final" className="sm:col-span-2">
          <textarea
            id="config-final"
            rows={2}
            value={form.final_round_info}
            onChange={(event) => update("final_round_info", event.target.value)}
            className="input-arena arena-focus rounded-lg"
          />
        </Field>
        <Field label="Competition format" htmlFor="config-format" className="sm:col-span-2">
          <textarea
            id="config-format"
            rows={2}
            value={form.competition_format}
            onChange={(event) => update("competition_format", event.target.value)}
            className="input-arena arena-focus rounded-lg"
          />
        </Field>
      </section>

      <section className="arena-panel arena-panel-sm space-y-3 p-6">
        <h2 className="font-display text-base font-semibold text-bone">Operational switches</h2>
        <Checkbox
          id="switch-open"
          checked={switches.registrations_open}
          onChange={(value) => setSwitches({ ...switches, registrations_open: value })}
          label="Registrations open"
          description="When off, the registration form explains that registrations are closed."
        />
        <Checkbox
          id="switch-auto-approve"
          checked={switches.auto_approve_registrations}
          onChange={(value) => setSwitches({ ...switches, auto_approve_registrations: value })}
          label="Auto-approve registrations"
          description="When off, entries arrive as “under review” and an administrator decides."
        />
        <Checkbox
          id="switch-leaderboard"
          checked={switches.leaderboard_enabled}
          onChange={(value) => setSwitches({ ...switches, leaderboard_enabled: value })}
          label="Publish leaderboard"
          description="Controls visibility of the standings an administrator has entered."
        />
      </section>

      <Button type="submit" size="lg" loading={busy}>
        Save configuration
      </Button>
    </form>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <Field label={label} htmlFor={`number-${label.replace(/\s+/g, "-").toLowerCase()}`}>
      <TextInput
        id={`number-${label.replace(/\s+/g, "-").toLowerCase()}`}
        inputMode="numeric"
        value={String(value)}
        onChange={(event) => onChange(Number(event.target.value.replace(/\D/g, "")) || 0)}
      />
    </Field>
  );
}

/* ── Announcements ────────────────────────────────────────────────────── */

function AnnouncementsTab({ headers }: { headers: Record<string, string> }) {
  const { push } = useToast();
  const [items, setItems] = useState<Announcement[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("general");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const result = await adminApi.announcements(headers);
    setItems(result.announcements);
  }, [headers]);

  useEffect(() => {
    void load().catch(() => undefined);
  }, [load]);

  async function create(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await adminApi.createAnnouncement(headers, {
        title,
        body_md: body,
        category,
        is_published: true,
      });
      setTitle("");
      setBody("");
      push("Announcement published.", "success");
      await load();
    } catch (caught) {
      push(caught instanceof Error ? caught.message : "Could not publish.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={create} className="arena-panel arena-panel-sm grid gap-4 p-6">
        <Field label="Title" htmlFor="announcement-title" required>
          <TextInput id="announcement-title" value={title} onChange={(event) => setTitle(event.target.value)} required />
        </Field>
        <Field label="Body (markdown-lite, plain text is fine)" htmlFor="announcement-body" required>
          <textarea
            id="announcement-body"
            rows={4}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className="input-arena arena-focus rounded-lg"
            required
          />
        </Field>
        <div className="flex flex-wrap items-end gap-4">
          <Field label="Category" htmlFor="announcement-category" className="min-w-[12rem]">
            <Select id="announcement-category" value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="general">General</option>
              <option value="registrations">Registrations</option>
              <option value="qualifying_rounds">Qualifying rounds</option>
              <option value="reminder">Reminder</option>
              <option value="rules">Rules</option>
            </Select>
          </Field>
          <Button type="submit" loading={busy}>
            Publish announcement
          </Button>
        </div>
      </form>

      {items.length === 0 ? (
        <EmptyState title="No announcements" description="Publish registration updates, qualifying-round information and reminders." />
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="arena-panel arena-panel-sm flex flex-wrap items-start gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-bone">{item.title}</p>
                <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-ash">{item.body_md}</p>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ash/70">
                  {item.category.replace(/_/g, " ")} ·{" "}
                  {item.is_published ? "Published" : "Draft"}
                  {item.published_at ? ` · ${formatDateTime(item.published_at)}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    void adminApi
                      .updateAnnouncement(headers, item.id, { is_published: !item.is_published })
                      .then(() => load())
                      .catch(() => push("Update failed.", "error"))
                  }
                >
                  {item.is_published ? "Unpublish" : "Publish"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    void adminApi
                      .deleteAnnouncement(headers, item.id)
                      .then(() => {
                        push("Announcement deleted.", "success");
                        return load();
                      })
                      .catch(() => push("Delete failed.", "error"))
                  }
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── Leaderboard ──────────────────────────────────────────────────────── */

function LeaderboardTab({
  headers,
  enabled,
  onToggled,
}: {
  headers: Record<string, string>;
  enabled: boolean;
  onToggled: (enabled: boolean) => void;
}) {
  const { push } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [score, setScore] = useState("");
  const [rank, setRank] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function add(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await adminApi.createLeaderboardEntry(headers, {
        display_name: displayName,
        college_name: collegeName || undefined,
        score: score === "" ? undefined : Number(score),
        rank: rank === "" ? undefined : Number(rank),
        qualification_status: status || undefined,
      });
      setDisplayName("");
      setCollegeName("");
      setScore("");
      setRank("");
      push("Standing added.", "success");
    } catch (caught) {
      push(caught instanceof Error ? caught.message : "Could not add the standing.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="arena-panel arena-panel-sm flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <p className="font-display text-base font-semibold text-bone">Public standings</p>
          <p className="mt-1 text-xs text-ash">
            {enabled
              ? "Standings are visible on the public leaderboard."
              : "Standings are hidden — the public page shows the pre-event state."}
          </p>
        </div>
        <Button
          variant={enabled ? "ghost" : "flare"}
          onClick={() =>
            void adminApi
              .publishLeaderboard(headers, !enabled)
              .then((result) => {
                onToggled(result.leaderboard_enabled);
                push(result.leaderboard_enabled ? "Leaderboard published." : "Leaderboard hidden.", "success");
              })
              .catch(() => push("Could not change visibility.", "error"))
          }
        >
          {enabled ? "Hide standings" : "Publish standings"}
        </Button>
      </div>

      <form onSubmit={add} className="arena-panel arena-panel-sm grid gap-4 p-6 sm:grid-cols-2">
        <Field label="Display name" htmlFor="lb-name" required>
          <TextInput id="lb-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required />
        </Field>
        <Field label="College" htmlFor="lb-college">
          <TextInput id="lb-college" value={collegeName} onChange={(event) => setCollegeName(event.target.value)} />
        </Field>
        <Field label="Score" htmlFor="lb-score">
          <TextInput id="lb-score" inputMode="decimal" value={score} onChange={(event) => setScore(event.target.value)} />
        </Field>
        <Field label="Rank" htmlFor="lb-rank">
          <TextInput id="lb-rank" inputMode="numeric" value={rank} onChange={(event) => setRank(event.target.value.replace(/\D/g, ""))} />
        </Field>
        <Field label="Qualification status" htmlFor="lb-status">
          <TextInput
            id="lb-status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            placeholder="qualified / eliminated / pending"
          />
        </Field>
        <div className="flex items-end">
          <Button type="submit" loading={busy}>
            Add standing
          </Button>
        </div>
        <p className="text-xs text-ash sm:col-span-2">
          Only real results belong here. The public leaderboard never shows simulated or
          placeholder rankings.
        </p>
      </form>
    </div>
  );
}

/* ── Audit log ────────────────────────────────────────────────────────── */

function AuditTab({ headers }: { headers: Record<string, string> }) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);

  useEffect(() => {
    void adminApi
      .auditLog(headers)
      .then((result) => setEntries(result.entries))
      .catch(() => undefined);
  }, [headers]);

  if (entries.length === 0) {
    return <EmptyState title="No administrative changes yet" description="Every privileged action is recorded here with the acting administrator's email." />;
  }

  return (
    <div className="arena-panel arena-panel-sm overflow-hidden">
      <table className="w-full min-w-[42rem] text-left text-sm">
        <thead>
          <tr className="border-b border-white/8 font-mono text-[10px] uppercase tracking-[0.18em] text-ash">
            <th scope="col" className="px-4 py-3 font-normal">When</th>
            <th scope="col" className="px-4 py-3 font-normal">Actor</th>
            <th scope="col" className="px-4 py-3 font-normal">Action</th>
            <th scope="col" className="px-4 py-3 font-normal">Entity</th>
            <th scope="col" className="px-4 py-3 font-normal">Detail</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/6">
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td className="px-4 py-3 font-mono text-xs text-ash">
                {formatDateTime(entry.created_at) ?? "—"}
              </td>
              <td className="px-4 py-3 text-xs text-bone/85">{entry.actor_email ?? "—"}</td>
              <td className="px-4 py-3 font-mono text-xs text-flare-300">{entry.action}</td>
              <td className="px-4 py-3 text-xs text-ash">
                {entry.entity}
                {entry.entity_id ? ` · ${entry.entity_id.slice(0, 8)}` : ""}
              </td>
              <td className="px-4 py-3 text-xs text-ash">{entry.detail_json ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
