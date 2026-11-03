/**
 * Browser-side tournament API client.
 *
 * Requests go to the same origin (`/api/v1/...`) and are proxied to FastAPI
 * by next.config.js, so the session cookie set by the backend is first-party
 * (no third-party cookie issues) and CORS never comes into play.
 */

import type {
  Announcement,
  College,
  LeaderboardPayload,
  Registration,
  Sponsor,
  TournamentConfig,
} from "@/lib/tournament";

export type ApiErrorShape = {
  error?: { code?: string; message?: string; request_id?: string };
};

export class ApiError extends Error {
  code: string;
  status: number;
  requestId: string;

  constructor(message: string, code: string, status: number, requestId = "") {
    super(message);
    this.code = code;
    this.status = status;
    this.requestId = requestId;
  }
}

export type FetchOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  idempotencyKey?: string;
};

async function request<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers || {}),
  };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.idempotencyKey) headers["Idempotency-Key"] = options.idempotencyKey;

  const response = await fetch(path, {
    method: options.method || "GET",
    headers,
    credentials: "same-origin",
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store",
  });

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const shape = (payload || {}) as ApiErrorShape;
    throw new ApiError(
      shape.error?.message || "Something went wrong. Please try again.",
      shape.error?.code || "request_failed",
      response.status,
      shape.error?.request_id || "",
    );
  }
  return payload as T;
}

// ── Public ───────────────────────────────────────────────────────────────

export function fetchTournament(): Promise<TournamentConfig> {
  return request<TournamentConfig>("/api/v1/tournament");
}

export function fetchColleges(): Promise<{ colleges: College[] }> {
  return request<{ colleges: College[] }>("/api/v1/tournament/colleges");
}

export function fetchSponsors(): Promise<{ sponsors: Sponsor[] }> {
  return request<{ sponsors: Sponsor[] }>("/api/v1/tournament/sponsors");
}

export function fetchAnnouncements(): Promise<{ announcements: Announcement[] }> {
  return request<{ announcements: Announcement[] }>("/api/v1/tournament/announcements");
}

export function fetchLeaderboard(): Promise<LeaderboardPayload> {
  return request<LeaderboardPayload>("/api/v1/tournament/leaderboard");
}

// ── Identity ─────────────────────────────────────────────────────────────

export type SessionPayload = {
  signed_in: boolean;
  participant: {
    id: string;
    email: string;
    email_verified: boolean;
    full_name: string | null;
    is_admin: boolean;
  } | null;
  registration: Registration | null;
  auth_provider?: string;
};

export function fetchSession(headers: Record<string, string> = {}): Promise<SessionPayload> {
  return request<SessionPayload>("/api/v1/tournament/auth/session", { headers });
}

export type OtpRequestResult = {
  sent: boolean;
  email: string;
  expires_in_minutes: number;
  delivery: string;
  dev_code?: string;
};

export function requestOtp(email: string): Promise<OtpRequestResult> {
  return request<OtpRequestResult>("/api/v1/tournament/auth/otp/request", {
    method: "POST",
    body: { email },
  });
}

export function verifyOtp(
  email: string,
  code: string,
): Promise<{ signed_in: boolean; participant: SessionPayload["participant"] }> {
  return request<{ signed_in: boolean; participant: SessionPayload["participant"] }>(
    "/api/v1/tournament/auth/otp/verify",
    { method: "POST", body: { email, code } },
  );
}

export function logout(headers: Record<string, string> = {}): Promise<{ signed_in: boolean }> {
  return request<{ signed_in: boolean }>("/api/v1/tournament/auth/logout", {
    method: "POST",
    headers,
  });
}

// ── Participant ──────────────────────────────────────────────────────────

export type RegistrationPayload = {
  registration: Registration;
  already_registered: boolean;
  message: string;
};

export function submitRegistration(
  body: Record<string, unknown>,
  options: { headers?: Record<string, string>; idempotencyKey?: string } = {},
): Promise<RegistrationPayload> {
  return request<RegistrationPayload>("/api/v1/tournament/register", {
    method: "POST",
    body,
    headers: options.headers,
    idempotencyKey: options.idempotencyKey,
  });
}

export function fetchMyRegistration(
  headers: Record<string, string> = {},
): Promise<{ registration: Registration | null; config: Record<string, unknown> }> {
  return request<{ registration: Registration | null; config: Record<string, unknown> }>(
    "/api/v1/tournament/me/registration",
    { headers },
  );
}

export function updateMyRegistration(
  body: Record<string, unknown>,
  headers: Record<string, string> = {},
): Promise<Registration> {
  return request<Registration>("/api/v1/tournament/me/registration", {
    method: "PATCH",
    body,
    headers,
  });
}

// ── Admin ────────────────────────────────────────────────────────────────

const ADMIN = "/api/v1/admin/tournament";

export type AdminOverview = {
  total_registrations: number;
  by_status: Record<string, number>;
  by_college: { college: string; registrations: number }[];
  pending_approvals: number;
  approved: number;
  active_colleges: number;
  total_colleges: number;
  sponsor_count: number;
  published_announcements: number;
  registrations_last_7_days: { date: string; registrations: number }[];
  leaderboard_enabled: boolean;
  registrations_open: boolean;
};

export type AdminRegistrationList = {
  registrations: Registration[];
  total: number;
  limit: number;
  offset: number;
};

export type AuditEntry = {
  id: string;
  actor_email: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  detail_json: string | null;
  created_at: string | null;
};

export const adminApi = {
  overview: (headers: Record<string, string>) =>
    request<AdminOverview>(`${ADMIN}/overview`, { headers }),

  registrations: (
    headers: Record<string, string>,
    params: { q?: string; college_id?: string; status?: string; limit?: number } = {},
  ) => {
    const search = new URLSearchParams();
    if (params.q) search.set("q", params.q);
    if (params.college_id) search.set("college_id", params.college_id);
    if (params.status) search.set("status", params.status);
    search.set("limit", String(params.limit ?? 200));
    return request<AdminRegistrationList>(`${ADMIN}/registrations?${search.toString()}`, {
      headers,
    });
  },

  exportCsvUrl: (params: { college_id?: string; status?: string } = {}) => {
    const search = new URLSearchParams();
    if (params.college_id) search.set("college_id", params.college_id);
    if (params.status) search.set("status", params.status);
    const query = search.toString();
    return `${ADMIN}/registrations/export.csv${query ? `?${query}` : ""}`;
  },

  updateRegistration: (
    headers: Record<string, string>,
    id: string,
    body: { status: string; status_note?: string | null },
  ) => request<Registration>(`${ADMIN}/registrations/${id}`, { method: "PATCH", body, headers }),

  colleges: (headers: Record<string, string>) =>
    request<{ colleges: College[] }>(`${ADMIN}/colleges`, { headers }),

  createCollege: (headers: Record<string, string>, body: Record<string, unknown>) =>
    request<College>(`${ADMIN}/colleges`, { method: "POST", body, headers }),

  updateCollege: (
    headers: Record<string, string>,
    id: string,
    body: Record<string, unknown>,
  ) => request<College>(`${ADMIN}/colleges/${id}`, { method: "PATCH", body, headers }),

  sponsors: (headers: Record<string, string>) =>
    request<{ sponsors: Sponsor[] }>(`${ADMIN}/sponsors`, { headers }),

  createSponsor: (headers: Record<string, string>, body: Record<string, unknown>) =>
    request<Sponsor>(`${ADMIN}/sponsors`, { method: "POST", body, headers }),

  updateSponsor: (
    headers: Record<string, string>,
    id: string,
    body: Record<string, unknown>,
  ) => request<Sponsor>(`${ADMIN}/sponsors/${id}`, { method: "PATCH", body, headers }),

  config: (headers: Record<string, string>) =>
    request<TournamentConfig>(`${ADMIN}/config`, { headers }),

  updateConfig: (headers: Record<string, string>, body: Record<string, unknown>) =>
    request<TournamentConfig>(`${ADMIN}/config`, { method: "PATCH", body, headers }),

  announcements: (headers: Record<string, string>) =>
    request<{ announcements: Announcement[] }>(`${ADMIN}/announcements`, { headers }),

  createAnnouncement: (headers: Record<string, string>, body: Record<string, unknown>) =>
    request<Announcement>(`${ADMIN}/announcements`, { method: "POST", body, headers }),

  updateAnnouncement: (
    headers: Record<string, string>,
    id: string,
    body: Record<string, unknown>,
  ) => request<Announcement>(`${ADMIN}/announcements/${id}`, { method: "PATCH", body, headers }),

  deleteAnnouncement: (headers: Record<string, string>, id: string) =>
    request<{ deleted: boolean }>(`${ADMIN}/announcements/${id}`, { method: "DELETE", headers }),

  createLeaderboardEntry: (headers: Record<string, string>, body: Record<string, unknown>) =>
    request<{ id: string }>(`${ADMIN}/leaderboard/entries`, { method: "POST", body, headers }),

  deleteLeaderboardEntry: (headers: Record<string, string>, id: string) =>
    request<{ deleted: boolean }>(`${ADMIN}/leaderboard/entries/${id}`, {
      method: "DELETE",
      headers,
    }),

  publishLeaderboard: (headers: Record<string, string>, enabled: boolean) =>
    request<{ leaderboard_enabled: boolean }>(`${ADMIN}/leaderboard/publish`, {
      method: "POST",
      body: { enabled },
      headers,
    }),

  auditLog: (headers: Record<string, string>) =>
    request<{ entries: AuditEntry[] }>(`${ADMIN}/audit-log?limit=100`, { headers }),

  uploadLogo: async (
    headers: Record<string, string>,
    url: string,
    file: File,
  ): Promise<{ url: string }> => {
    const form = new FormData();
    form.append("file", file);
    const response = await fetch(url, { method: "POST", body: form, headers, credentials: "same-origin" });
    const payload = (await response.json()) as ApiErrorShape & { url?: string };
    if (!response.ok) {
      throw new ApiError(
        payload.error?.message || "Upload failed.",
        payload.error?.code || "upload_failed",
        response.status,
      );
    }
    return { url: payload.url || "" };
  },
};
