import { NextResponse } from "next/server";

import { SECURITY_CONTACT_EMAIL, SITE_URL } from "@/lib/constants";

/**
 * RFC 9116 security.txt.
 *
 * The contact is taken from configuration (NEXT_PUBLIC_SECURITY_EMAIL). When no
 * address is configured we point at the contact page instead of inventing an
 * address that nobody monitors.
 */
export function GET() {
  const canonicalBase = SITE_URL.replace(/\/$/, "");
  const contact = SECURITY_CONTACT_EMAIL
    ? `mailto:${SECURITY_CONTACT_EMAIL}`
    : `${canonicalBase}/contact`;

  const body = [
    `Contact: ${contact}`,
    "Preferred-Languages: en",
    `Canonical: ${canonicalBase}/security.txt`,
    `Policy: ${canonicalBase}/security`,
    "Expires: 2027-01-01T00:00:00.000Z",
    "",
  ].join("\n");

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
