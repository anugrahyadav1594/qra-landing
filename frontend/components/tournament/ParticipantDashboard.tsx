"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { Monogram } from "@/components/tournament/CollegeWall";
import {
  Button,
  ErrorState,
  Field,
  Modal,
  Select,
  Skeleton,
  StatusPill,
  TextInput,
  useToast,
} from "@/components/tournament/ui";
import { ACADEMIC_YEAR_OPTIONS } from "@/lib/schemas";
import { fetchAnnouncements, fetchColleges, fetchMyRegistration, updateMyRegistration } from "@/lib/tournamentApi";
import {
  formatDateTime,
  formatINR,
  type Announcement,
  type College,
  type Registration,
  type TournamentConfig,
} from "@/lib/tournament";

export function ParticipantDashboard({ config }: { config: TournamentConfig }) {
  const { status, user, registration: fromSession, authHeaders, signOut } = useAuth();
  const { push } = useToast();

  const [record, setRecord] = useState<Registration | null>(fromSession);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [mine, announcementList, collegeList] = await Promise.all([
        fetchMyRegistration(authHeaders()),
        fetchAnnouncements(),
        fetchColleges(),
      ]);
      setRecord(mine.registration);
      setAnnouncements(announcementList.announcements);
      setColleges(collegeList.colleges);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load your dashboard.");
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    if (status === "signed-in") void load();
    if (status === "signed-out") setLoading(false);
  }, [status, load]);

  const editable = useMemo(
    () => Boolean(record && !["approved", "rejected", "cancelled"].includes(record.status)),
    [record],
  );

  if (status === "signed-out") {
    return (
      <div className="arena-panel arena-panel-sm p-8 text-center">
        <h1 className="font-display text-2xl font-semibold text-bone">Sign in to your arena</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ash">
          Your dashboard shows only your own registration, so we need to know who you are first.
          Sign-in is passwordless — a one-time code to your email.
        </p>
        <Link href="/tournament/register" className="btn-flare arena-focus mt-6 inline-flex rounded-full px-5 py-2.5 text-sm">
          Sign in / register
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void load()} />;
  }

  if (!record) {
    return (
      <div className="arena-panel arena-panel-sm p-8 text-center">
        <h1 className="font-display text-2xl font-semibold text-bone">No entry yet</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ash">
          You are signed in as {user?.email}, but there is no tournament entry on this account yet.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/tournament/register" className="btn-flare arena-focus rounded-full px-5 py-2.5 text-sm">
            Register now
          </Link>
          <Button variant="ghost" onClick={() => void signOut()}>
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  const milestones = [
    { label: "Registration received", value: formatDateTime(record.created_at), done: true },
    {
      label: "Review decision",
      value: ["approved", "rejected", "waitlisted"].includes(record.status)
        ? `Decision recorded — ${record.status.replace("_", " ")}`
        : "Pending review by the organisers",
      done: ["approved", "rejected", "waitlisted"].includes(record.status),
    },
    {
      label: "College-level qualifying rounds",
      value: config.qualifying_round_info ?? "Guidelines to be announced",
      done: false,
    },
    { label: "Event date", value: formatDateTime(config.event_starts_at), done: false },
  ];

  return (
    <div className="space-y-8">
      {/* ── Identity card ─────────────────────────────────────────── */}
      <section className="arena-panel arena-panel-sm relative overflow-hidden p-6 sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, rgba(244,124,53,0.6), transparent 65%)" }}
        />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-flare-300">
              Participant dashboard
            </p>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-bone sm:text-4xl">
              {record.full_name}
            </h1>
            <p className="mt-2 font-mono text-xs tracking-[0.14em] text-ash">{record.registration_id}</p>
          </div>
          <div className="text-right">
            <StatusPill status={record.status} />
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ash">
              {record.email_verified ? "Email verified" : "Email unverified"}
            </p>
          </div>
        </div>

        <dl className="relative mt-8 grid gap-6 border-t border-white/8 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <Cell label="College">
            <span className="flex items-center gap-3">
              {record.college_logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={record.college_logo_url} alt="" className="h-8 w-8 object-contain" />
              ) : (
                record.college_name && <Monogram name={record.college_name} className="h-8 w-8 text-[10px]" />
              )}
              <span className="text-sm text-bone">{record.college_name ?? "—"}</span>
            </span>
          </Cell>
          <Cell label="Mobile">{record.mobile ?? "—"}</Cell>
          <Cell label="Course">{record.course ?? "—"}</Cell>
          <Cell label="Academic year">{record.academic_year ?? "—"}</Cell>
          <Cell label="City">{record.city ?? "—"}</Cell>
          <Cell label="Email">{record.email}</Cell>
          <Cell label="Last updated">{formatDateTime(record.updated_at) ?? "—"}</Cell>
          <Cell label="Prize pool">
            <span className="text-flare-300">{formatINR(config.prize_pool_total)}</span>
          </Cell>
        </dl>

        {record.status_note && (
          <p className="relative mt-6 rounded-md border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-ash">
            Organiser note: {record.status_note}
          </p>
        )}

        {editable && (
          <div className="relative mt-6 flex flex-wrap gap-3">
            <Button variant="ghost" onClick={() => setEditing(true)}>
              Edit my details
            </Button>
          </div>
        )}
      </section>

      {/* ── Milestones + announcements ────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <section className="arena-panel arena-panel-sm p-6 sm:p-8">
          <h2 className="font-display text-lg font-semibold text-bone">Milestones</h2>
          <ol className="mt-6 space-y-5">
            {milestones.map((milestone) => (
              <li key={milestone.label} className="flex gap-4">
                <span
                  className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                    milestone.done ? "bg-flare-500" : "bg-white/15"
                  }`}
                />
                <div>
                  <p className="text-sm font-medium text-bone">{milestone.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-ash">
                    {milestone.value ?? "To be announced"}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="arena-panel arena-panel-sm p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-bone">Announcements</h2>
            <Link
              href="/tournament#event-details"
              className="arena-focus rounded font-mono text-[10px] uppercase tracking-[0.2em] text-flare-300"
            >
              Event details
            </Link>
          </div>
          {announcements.length === 0 ? (
            <p className="mt-6 text-sm leading-relaxed text-ash">
              No announcements yet. Registration updates, qualifying-round information and rule
              changes appear here the moment the organisers publish them.
            </p>
          ) : (
            <ul className="mt-6 space-y-4">
              {announcements.slice(0, 5).map((announcement) => (
                <li key={announcement.id} className="border-l-2 border-flare-500/50 pl-4">
                  <p className="text-sm font-medium text-bone">{announcement.title}</p>
                  <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-ash">
                    {announcement.body_md}
                  </p>
                  {announcement.published_at && (
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ash/60">
                      {formatDateTime(announcement.published_at)}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* ── Rules & links ─────────────────────────────────────────── */}
      <section className="grid gap-4 sm:grid-cols-3">
        <LinkCard href="/tournament/rules" title="Rules & regulations" detail="Eligibility, conduct and competition rules." />
        <LinkCard href="/tournament/leaderboard" title="Leaderboard" detail="Standings appear once the competition begins." />
        <LinkCard href="/tournament/faq" title="FAQ" detail="Answers about entries, colleges and prizes." />
      </section>

      {editing && (
        <EditDetailsModal
          record={record}
          colleges={colleges}
          onClose={() => setEditing(false)}
          onSaved={(updated) => {
            setRecord(updated);
            setEditing(false);
            push("Your details were updated.", "success");
          }}
        />
      )}
    </div>
  );
}

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-ash">{label}</dt>
      <dd className="mt-1.5 text-sm text-bone">{children}</dd>
    </div>
  );
}

function LinkCard({ href, title, detail }: { href: string; title: string; detail: string }) {
  return (
    <Link
      href={href}
      className="arena-panel arena-panel-sm logo-tile group block p-5"
    >
      <p className="font-display text-base font-semibold text-bone">{title}</p>
      <p className="mt-1.5 text-xs leading-relaxed text-ash">{detail}</p>
      <span className="mt-4 inline-block font-mono text-[10px] uppercase tracking-[0.2em] text-flare-300">
        Open →
      </span>
    </Link>
  );
}

function EditDetailsModal({
  record,
  colleges,
  onClose,
  onSaved,
}: {
  record: Registration;
  colleges: College[];
  onClose: () => void;
  onSaved: (registration: Registration) => void;
}) {
  const { authHeaders } = useAuth();
  const [mobile, setMobile] = useState(record.mobile ?? "");
  const [city, setCity] = useState(record.city ?? "");
  const [course, setCourse] = useState(record.course ?? "");
  const [year, setYear] = useState(record.academic_year ?? "");
  const [collegeId, setCollegeId] = useState(record.college_id ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const updated = await updateMyRegistration(
        { mobile, city, course, academic_year: year, college_id: collegeId },
        authHeaders(),
      );
      onSaved(updated);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update your details.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit your details"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={() => void save()} loading={busy}>
            Save changes
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Mobile" htmlFor="edit-mobile">
          <TextInput
            id="edit-mobile"
            value={mobile}
            onChange={(event) => setMobile(event.target.value.replace(/[^\d+]/g, ""))}
          />
        </Field>
        <Field label="City" htmlFor="edit-city">
          <TextInput id="edit-city" value={city} onChange={(event) => setCity(event.target.value)} />
        </Field>
        <Field label="Course / branch" htmlFor="edit-course">
          <TextInput id="edit-course" value={course} onChange={(event) => setCourse(event.target.value)} />
        </Field>
        <Field label="Academic year" htmlFor="edit-year">
          <Select id="edit-year" value={year} onChange={(event) => setYear(event.target.value)}>
            <option value="">Select year</option>
            {ACADEMIC_YEAR_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="College" htmlFor="edit-college">
          <Select
            id="edit-college"
            value={collegeId}
            onChange={(event) => setCollegeId(event.target.value)}
          >
            {colleges.map((college) => (
              <option key={college.id} value={college.id}>
                {college.name}
              </option>
            ))}
          </Select>
        </Field>
        {error && <ErrorState message={error} />}
      </div>
    </Modal>
  );
}
