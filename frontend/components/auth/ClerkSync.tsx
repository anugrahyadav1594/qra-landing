"use client";

import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { useEffect } from "react";

import { useAuth } from "@/components/auth/AuthProvider";

/**
 * Optional bridge. Rendered (lazily) only when a Clerk publishable key is
 * configured: it forwards Clerk's session token to the tournament API client
 * so the backend can link the Clerk identity to a participant record.
 */
export default function ClerkSync() {
  const { isSignedIn, getToken, isLoaded } = useClerkAuth();
  const { setClerkToken, refresh } = useAuth();

  useEffect(() => {
    let cancelled = false;
    async function sync() {
      if (!isLoaded) return;
      if (!isSignedIn) {
        setClerkToken(null);
        await refresh();
        return;
      }
      try {
        const token = await getToken();
        if (cancelled) return;
        setClerkToken(token ?? null);
        await refresh();
      } catch {
        setClerkToken(null);
      }
    }
    void sync();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, getToken, setClerkToken, refresh]);

  return null;
}
