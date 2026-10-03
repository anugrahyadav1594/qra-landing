import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ApplyForm } from "@/components/ApplyForm";
import { Markdown } from "@/components/Markdown";
import { QRAReveal } from "@/components/motion/QRAReveal";
import { SectionLabel } from "@/components/ui";
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
    description: `${posting.title} at Quantrelic Analytics \u2014 ${posting.location}.`,
  };
}

export default async function CareerPage({ params }: { params: { slug: string } }) {
  const posting = await getPosting(params.slug);
  if (!posting) notFound();

  return (
    <div className="mx-auto max-w-shell px-5 pb-20 pt-14 sm:px-6 sm:pt-20">
      <div className="mx-auto max-w-3xl">
        <QRAReveal>
          <SectionLabel tone="brand">Careers</SectionLabel>
          <h1 className="mt-5 font-display text-[2.2rem] font-semibold leading-[1.06] tracking-tightest text-paper sm:text-5xl">
            {posting.title}
          </h1>
          <p className="mt-4 text-sm text-paper-mute">
            {posting.department} \u00b7 {posting.employment_type.replace("_", " ")} \u00b7{" "}
            {posting.location_type.replace("_", " ")} \u00b7 {posting.location}
          </p>
        </QRAReveal>

        <div className="mt-12 grid gap-10 sm:grid-cols-2">
          <QRAReveal>
            <section>
              <h2 className="font-display text-lg font-semibold tracking-tight text-paper">
                About the role
              </h2>
              <div className="mt-3 text-base">
                <Markdown source={posting.description_md} />
              </div>
            </section>
          </QRAReveal>
          <QRAReveal delay={90}>
            <section>
              <h2 className="font-display text-lg font-semibold tracking-tight text-paper">
                Requirements
              </h2>
              <div className="mt-3 text-base">
                <Markdown source={posting.requirements_md} />
              </div>
            </section>
          </QRAReveal>
        </div>

        <QRAReveal delay={140}>
          <section className="mt-14 rounded-xl border border-line bg-ink-850/80 p-6 shadow-panel sm:p-8">
            <h2 className="font-display text-xl font-semibold tracking-tight text-paper">Apply</h2>
            <p className="mb-6 mt-2 text-sm text-paper-mute">
              Resume (PDF) and a few details. A person at {SITE_NAME} reads every application.
            </p>
            <ApplyForm slug={posting.slug} title={posting.title} />
          </section>
        </QRAReveal>
      </div>
    </div>
  );
}
