/**
 * Clerk configuration.
 *
 * Clerk is this site's identity provider. In deployed environments
 * `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is always set and everything behaves
 * normally. In local/preview environments without secrets the key is absent —
 * rather than failing every route with "Missing publishableKey", the public
 * marketing site renders without the auth controls.
 *
 * Nothing else changes when the key is present: the same ClerkProvider, the
 * same middleware and the same sign-in/sign-up/user surfaces render as before.
 */
export const CLERK_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";

export const clerkEnabled = CLERK_PUBLISHABLE_KEY.length > 0;
