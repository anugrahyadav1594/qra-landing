import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ApplyForm } from "@/components/ApplyForm";
import { Markdown } from "@/components/Markdown";
import { Reveal } from "@/components/Reveal";
import { Badge, Eyebrow } from "@/components/ui";
import { apiGet } from "@/lib/api";
import { SITE_NAME } from "@/lib/constants";
import { FALLBACK_POSTINGS } from "@/lib/seed";

export const dynamic = "force-dynamic";

type Posting = {
  id: string;
  slug: string;
  title: string;
  department: string;
  location_type: string;
  location: string;
  employment_type: string;
  description_md: string;
  requirements_md: string;
  compensation_range: string | null;
  status: string;
};

async function getPosting(slug: string): Promise<Posting | null> {
  const data = await apiGet<{ postings: Posting[] }>("/api/v1/careers", {
    postings: FALLBACK_POSTINGS,
  });
  return data.postings.find((posting) => posting.slug === slug) ?? null;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const posting = await getPosting(params.slug);
  if (!posting) return { title: "Role not found" };
  return {
    title: posting.title,
    description: `${posting.title} at Quantrelic Analytics — ${posting.location}.`,
  };
}

export default async function CareerPage({ params }: { params: { slug: string } }) {
  const posting = await getPosting(params.slug);
  if (!posting) notFound();

  return (
    <div className="mx-auto max-w-shell px-5 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <div className="flex flex-wrap items-center gap-3">
            <Eyebrow>Careers</Eyebrow>
            <Badge tone="accent">Open</Badge>
            <Badge tone="muted">{posting.location}</Badge>
            {posting.compensation_range && <Badge tone="muted">{posting.compensation_range}</Badge>}
          </div>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-tightest text-ink sm:text-5xl">
            {posting.title}
          </h1>
          <p className="mt-4 text-base text-muted">
            {posting.department} · {posting.employment_type.replace("_", " ")} ·{" "}
            {posting.location_type.replace("_", " ")}
          </p>
        </Reveal>

        <div className="mt-10 space-y-12">
          <Reveal>
            <section>
              <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
                About the role
              </h2>
              <div className="mt-3 text-base">
                <Markdown source={posting.description_md} />
              </div>
            </section>
          </Reveal>
          <Reveal>
            <section>
              <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
                Requirements
              </h2>
              <div className="mt-3 text-base">
                <Markdown source={posting.requirements_md} />
              </div>
            </section>
          </Reveal>
        </div>

        <Reveal>
          <section className="mt-16 rounded-lg border border-ink/10 bg-white p-6 shadow-card sm:p-8">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">Apply</h2>
            <p className="mb-6 mt-2 text-sm leading-relaxed text-muted">
              Resume (PDF) and a few details. A person at {SITE_NAME} reads every application, and
              we reply either way.
            </p>
            <ApplyForm slug={posting.slug} title={posting.title} />
          </section>
        </Reveal>
      </div>
    </div>
  );
}
