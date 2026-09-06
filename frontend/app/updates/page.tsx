import type { Metadata } from "next";

import { Markdown } from "@/components/Markdown";
import { SectionHeading } from "@/components/ui";
import { apiGet } from "@/lib/api";
import { FALLBACK_UPDATES } from "@/lib/seed";

export const metadata: Metadata = {
  title: "Updates",
  description: "Company news and changelog from QRA.",
};

export const dynamic = "force-dynamic";

type Update = {
  id: string;
  slug: string;
  title: string;
  body_md: string;
  published_at: string;
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
}

export default async function UpdatesPage() {
  const data = await apiGet<{ updates: Update[] }>("/api/v1/updates", {
    updates: FALLBACK_UPDATES,
  });

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <SectionHeading
        eyebrow="Updates"
        title="What's new at QRA"
        description="Launch notes, product progress and company news."
      />
      <div className="mx-auto max-w-2xl space-y-8">
        {data.updates.map((update) => (
          <article
            key={update.id}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-8"
          >
            <time dateTime={update.published_at} className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              {formatDate(update.published_at)}
            </time>
            <h2 className="mt-2 text-xl font-bold text-white">{update.title}</h2>
            <div className="mt-4 text-sm leading-relaxed text-zinc-400">
              <Markdown source={update.body_md} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
