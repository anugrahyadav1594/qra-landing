import type { Metadata } from "next";

import { socialMetadata } from "@/lib/seo";
import Link from "next/link";

import { apiGet } from "@/lib/api";
import { SectionLabel } from "@/components/ui";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { FALLBACK_POSTINGS } from "@/lib/seed";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Open roles at Quantrelic Analytics \u2014 building QRA, technology that makes financial information easier to understand.",
  ...socialMetadata({
    title: `Careers · ${SITE_NAME}`,
    description: "Open roles at Quantrelic Analytics.",
    url: `${SITE_URL}/careers`,
  }),
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
    <div className="mx-auto max-w-shell px-5 pb-20 pt-14 sm:px-6 sm:pt-20">
      <header className="max-w-2xl">
        <SectionLabel tone="brand">Careers</SectionLabel>
        <h1 className="mt-5 font-display text-[2.2rem] font-semibold leading-[1.06] tracking-tightest text-paper sm:text-5xl">
          Build something that makes investing easier to understand.
        </h1>
        <p className="mt-5 text-base leading-relaxed text-paper-dim">
          Small team, real ownership, work that ships. Remote-first, based in India.
        </p>
      </header>

      <div className="mt-14 max-w-3xl">
        {data.postings.length === 0 && (
          <p className="text-base leading-relaxed text-paper-dim">
            No open roles right now \u2014 check back soon, or say hello via the{" "}
            <Link href="/contact" className="text-brand-300 underline decoration-brand-500/40 underline-offset-2">
              contact page
            </Link>
            .
          </p>
        )}

        <ul className="border-t border-line">
          {data.postings.map((posting) => (
            <li key={posting.id} className="border-b border-line">
              <Link
                href={`/careers/${posting.slug}`}
                className="flex flex-col gap-3 py-6 transition-colors hover:bg-ink-850/60 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-2"
              >
                <div>
                  <h2 className="font-display text-lg font-semibold tracking-tight text-paper">
                    {posting.title}
                  </h2>
                  <p className="mt-1.5 text-sm text-paper-mute">
                    {posting.department} \u00b7 {posting.location} \u00b7{" "}
                    {posting.employment_type.replace("_", " ")}
                  </p>
                </div>
                <span className="text-sm font-semibold text-brand-300">View role \u2192</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
