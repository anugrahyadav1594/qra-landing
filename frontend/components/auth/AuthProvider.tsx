"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { fetchSession, logout, requestOtp, verifyOtp } from "@/lib/tournamentApi";
import type { Registration } from "@/lib/tournament";

export type AuthUser = {
  id: string;
  email: string;
  email_verified: boolean;
  full_name: string | null;
  is_admin: boolean;
};

export type AuthStatus = "loading" | "signed-out" | "signed-in";

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  registration: Registration | null;
  usingClerk: boolean;
  refresh: () => Promise<void>;
  requestCode: (email: string) => Promise<{ dev_code?: string; delivery: string }>;
  confirmCode: (email: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
  authHeaders: () => Record<string, string>;
  setRegistration: (registration: Registration | null) => void;
  /** Used by the optional Clerk bridge to publish a session token. */
  setClerkToken: (token: string | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** Clerk is optional: the tournament works with the built-in passwordless
 * flow unless a publishable key is present. */
export const CLERK_ENABLED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const tokenRef = useRef<string | null>(null);

  const authHeaders = useCallback((): Record<string, string> => {
    const token = tokenRef.current;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const refresh = useCallback(async () => {
    try {
      const session = await fetchSession(authHeaders());
      if (session.signed_in && session.participant) {
        setUser(session.participant);
        setRegistration(session.registration ?? null);
        setStatus("signed-in");
      } else {
        setUser(null);
        setRegistration(null);
        setStatus("signed-out");
      }
    } catch {
      // Offline / backend unavailable: stay signed out rather than blocking
      // the interface. The next navigation retries.
      setStatus((current) => (current === "loading" ? "signed-out" : current));
    }
  }, [authHeaders]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const requestCode = useCallback(async (email: string) => {
    const result = await requestOtp(email);
    return { dev_code: result.dev_code, delivery: result.delivery };
  }, []);

  const confirmCode = useCallback(
    async (email: string, code: string) => {
      await verifyOtp(email, code);
      await refresh();
    },
    [refresh],
  );

  const setClerkToken = useCallback((token: string | null) => {
    tokenRef.current = token;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await logout(authHeaders());
    } catch {
      // Signing out locally is still the right thing to do.
    }
    tokenRef.current = null;
    setUser(null);
    setRegistration(null);
    setStatus("signed-out");
  }, [authHeaders]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      registration,
      usingClerk: CLERK_ENABLED,
      refresh,
      requestCode,
      confirmCode,
      signOut,
      authHeaders,
      setRegistration,
      setClerkToken,
    }),
    [
      status,
      user,
      registration,
      refresh,
      requestCode,
      confirmCode,
      signOut,
      authHeaders,
      setClerkToken,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
