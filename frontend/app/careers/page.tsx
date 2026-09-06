import type { Metadata } from "next";
import Link from "next/link";

import { Badge, SectionHeading } from "@/components/ui";
import { apiGet } from "@/lib/api";
import { FALLBACK_POSTINGS } from "@/lib/seed";

export const metadata: Metadata = {
  title: "Careers",
  description: "Open roles at QRA.",
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
    <section className="mx-auto max-w-6xl px-6 py-20">
      <SectionHeading
        eyebrow="Careers"
        title="Build the boring parts brilliantly"
        description="Remote-first, India-based. Every role ships to production in week one and touches the platform's security and privacy surfaces."
      />
      <div className="mx-auto max-w-3xl space-y-4">
        {data.postings.length === 0 && (
          <p className="text-center text-zinc-500">
            No open roles right now — check back soon, or say hi via the{" "}
            <a href="/contact" className="underline">contact page</a>.
          </p>
        )}
        {data.postings.map((posting) => (
          <Link
            key={posting.id}
            href={`/careers/${posting.slug}`}
            className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-brand-500/40 hover:bg-white/[0.06] sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h3 className="font-semibold text-white">{posting.title}</h3>
              <p className="mt-1 text-sm text-zinc-400">
                {posting.department} · {posting.location} · {posting.employment_type.replace("_", " ")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {posting.compensation_range && (
                <Badge tone="muted">{posting.compensation_range}</Badge>
              )}
              <span className="text-sm font-medium text-brand-400">Apply →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
