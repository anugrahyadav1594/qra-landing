import { NextResponse } from "next/server";

import { clerkMiddleware } from "@clerk/nextjs/server";

// Clerk middleware — public marketing site, so no route protection yet
// (protected app routes arrive with the Phase 4 auth flows, per
// ARCHITECTURE.md). The middleware's job right now is to let Clerk's
// auto-proxy serve the sign-in/sign-up UI and API under the same origin
// (/__clerk/*) and keep session cookies fresh on matched routes.
//
// When no publishable key is configured (local/preview environments without
// secrets) `clerkMiddleware()` throws on every request, so the middleware
// becomes a pass-through instead — the public site stays usable and no Clerk
// behaviour is removed: configure the key and Clerk runs exactly as before.
const publishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY || "";

export default publishableKey ? clerkMiddleware() : () => NextResponse.next();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|__clerk|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webm)).*)",
    // Bare root path — the catch-all above does NOT match "/", and the
    // __clerk_handshake session hand-back arrives on it (Clerk's own
    // DEFAULT_CONFIG_MATCHER includes it for this reason).
    "/",
    // API/TRPC matcher, then Clerk's auto-proxy path (once, after the API matcher)
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
