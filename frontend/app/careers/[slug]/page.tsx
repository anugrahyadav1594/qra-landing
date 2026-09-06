import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ApplyForm } from "@/components/ApplyForm";
import { Markdown } from "@/components/Markdown";
import { Reveal } from "@/components/Reveal";
import { Badge } from "@/components/ui";
import { apiGet } from "@/lib/api";
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
  return { title: posting.title, description: `${posting.title} at Quantrelic Analytics — ${posting.location}` };
}

export default async function CareerPage({ params }: { params: { slug: string } }) {
  const posting = await getPosting(params.slug);
  if (!posting) notFound();

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Badge tone="brand">Open</Badge>
            <Badge tone="muted">{posting.location}</Badge>
            {posting.compensation_range && <Badge tone="muted">{posting.compensation_range}</Badge>}
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-tightest text-paper">{posting.title}</h1>
          <p className="mt-3 text-paper-dim/70">
            {posting.department} · {posting.employment_type.replace("_", " ")} ·{" "}
            {posting.location_type.replace("_", " ")}
          </p>
        </Reveal>

        <div className="mt-10 space-y-10">
          <Reveal delay={100}>
            <div className="rounded-2xl border border-white/5 bg-ink-900/60 p-8">
              <h2 className="mb-2 text-lg font-semibold text-paper">About the role</h2>
              <Markdown source={posting.description_md} />
            </div>
          </Reveal>
          <Reveal delay={180}>
            <div className="rounded-2xl border border-white/5 bg-ink-900/60 p-8">
              <h2 className="mb-2 text-lg font-semibold text-paper">Requirements</h2>
              <Markdown source={posting.requirements_md} />
            </div>
          </Reveal>
        </div>

        <Reveal delay={260}>
          <div className="mt-16 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-8">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-paper">Apply</h2>
            <p className="mt-2 mb-6 text-sm text-paper-dim/60">
              Resume (PDF) + a few details. We reply to every application.
            </p>
            <ApplyForm slug={posting.slug} title={posting.title} />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
