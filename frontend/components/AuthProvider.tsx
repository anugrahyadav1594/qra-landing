"use client";

import { ClerkProvider } from "@clerk/nextjs";

import { CLERK_PUBLISHABLE_KEY, clerkEnabled } from "@/lib/clerk";

/** Renders the app inside ClerkProvider when a publishable key is configured,
 * and transparently renders without it in keyless local/preview setups. */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (!clerkEnabled) return <>{children}</>;
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>{children}</ClerkProvider>
  );
}
