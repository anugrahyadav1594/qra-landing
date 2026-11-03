import { NextResponse, type NextRequest } from "next/server";

/**
 * Clerk is optional. When a publishable key is configured the Clerk
 * middleware handles session hand-back and the `/__clerk/*` proxy routes;
 * without a key it is never invoked, so the app runs identically with the
 * built-in passwordless identity flow.
 */
const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

async function passthrough(request: NextRequest) {
  return NextResponse.next();
}

export default async function middleware(request: NextRequest) {
  if (!clerkEnabled) return passthrough(request);
  try {
    const { clerkMiddleware } = await import("@clerk/nextjs/server");
    const handler = clerkMiddleware() as unknown as (
      req: NextRequest,
      event: { waitUntil: (promise: Promise<unknown>) => void },
    ) => Promise<Response> | Response;
    return await handler(request, { waitUntil: () => undefined });
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|__clerk|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webm)).*)",
    // Bare root path — the catch-all above does NOT match "/"
    "/",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
