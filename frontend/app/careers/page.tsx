import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui";
import { apiGet } from "@/lib/api";
import { SITE_NAME } from "@/lib/constants";
import { FALLBACK_POSTINGS } from "@/lib/seed";

export const metadata: Metadata = {
  title: "Careers",
  description: `Open roles at Quantrelic Analytics — building QRA, technology that makes financial information easier to understand.`,
  openGraph: {
    title: `Careers · ${SITE_NAME}`,
    description: "Open roles at Quantrelic Analytics.",
  },
};

export const dynamic = "force-dynamic";

type Posting = {
  id: string;
  slug: string;
  title: string;
  department: string;
  location_type: string;
  location: string;
  employment_type: string;
  compensation_range: string | null;
};

export default async function CareersPage() {
  const data = await apiGet<{ postings: Posting[] }>("/api/v1/careers", {
    postings: FALLBACK_POSTINGS,
  });

  return (
    <div className="mx-auto max-w-shell px-5 py-14 sm:px-6 sm:py-20">
      <header className="max-w-2xl">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-accent">
          Careers
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-tightest text-ink sm:text-5xl">
          Build something that makes investing easier to understand.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">
          We&rsquo;re a small, remote-first team based in India. Small team, real ownership, and
          work that ships.
        </p>
      </header>

      <div className="mt-14 max-w-3xl">
        {data.postings.length === 0 && (
          <p className="text-base leading-relaxed text-muted">
            No open roles right now — check back soon, or say hello via the{" "}
            <Link href="/contact" className="text-accent underline decoration-accent/40 underline-offset-2">
              contact page
            </Link>
            .
          </p>
        )}

        <ul className="border-t border-ink/15">
          {data.postings.map((posting) => (
            <li key={posting.id} className="border-b border-ink/10">
              <Link
                href={`/careers/${posting.slug}`}
                className="flex flex-col gap-3 py-6 transition-colors hover:bg-white sm:flex-row sm:items-center sm:justify-between sm:gap-6"
              >
                <div>
                  <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
                    {posting.title}
                  </h2>
                  <p className="mt-1.5 text-sm text-muted">
                    {posting.department} · {posting.location} ·{" "}
                    {posting.employment_type.replace("_", " ")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {posting.compensation_range && (
                    <Badge tone="muted">{posting.compensation_range}</Badge>
                  )}
                  <span className="text-sm font-semibold text-accent">View role →</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
