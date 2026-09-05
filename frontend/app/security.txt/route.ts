import { NextResponse } from "next/server";

export function GET() {
  const body = [
    "Contact: mailto:security@company.com",
    "Preferred-Languages: en",
    "Canonical: https://company.com/.well-known/security.txt",
    "Policy: https://company.com/security",
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
