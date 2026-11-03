"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

import { AuthProvider, CLERK_ENABLED } from "@/components/auth/AuthProvider";

/**
 * Wraps the app in Clerk's provider **only when Clerk is configured**.
 * Without a publishable key the tournament falls back to the built-in
 * passwordless email flow and nothing here is rendered.
 */
const ClerkProvider = dynamic(
  () => import("@clerk/nextjs").then((module) => ({ default: module.ClerkProvider })),
  { ssr: false },
);

const ClerkSync = dynamic(() => import("@/components/auth/ClerkSync"), { ssr: false });

export function AuthGate({ children }: { children: ReactNode }) {
  if (!CLERK_ENABLED) return <AuthProvider>{children}</AuthProvider>;
  return (
    <ClerkProvider>
      <AuthProvider>
        <ClerkSync />
        {children}
      </AuthProvider>
    </ClerkProvider>
  );
}
