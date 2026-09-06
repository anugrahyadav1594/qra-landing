import type { Metadata } from "next";
import Link from "next/link";

import { Markdown } from "@/components/Markdown";
import { Reveal } from "@/components/Reveal";
import { WaitlistForm } from "@/components/WaitlistForm";
import { Badge, Eyebrow } from "@/components/ui";
import { apiGet } from "@/lib/api";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { FALLBACK_PRODUCT } from "@/lib/seed";

export const metadata: Metadata = {
  title: "Product",
  description:
    "QRA — the Quantrelic Research Agent — turns a ticker into a thesis: investigating financial statements, filings, news and market signals so investors can decide with clarity.",
  openGraph: {
    title: `QRA · ${SITE_NAME}`,
    description: "QRA — the Quantrelic Research Agent — turns a ticker into a thesis.",
  },
};

export const dynamic = "force-dynamic";

type ProductDetail = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description_md: string;
  domain?: string | null;
  status: string;
  accepts_waitlist: boolean;
};

export default async function ProductPage() {
  const data = await apiGet<{ products: ProductDetail[] }>("/api/v1/products", {
    products: [FALLBACK_PRODUCT],
  });
  const product =
    data.products.find((candidate) => candidate.slug === "qra") ??
    data.products[0] ??
    FALLBACK_PRODUCT;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
      <div className="grid gap-14 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
        <Reveal>
          <Eyebrow>The product</Eyebrow>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tightest text-paper sm:text-6xl">
            QRA — the Quantrelic
            <br className="hidden sm:block" /> Research Agent.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-paper-dim/80">{product.tagline}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Badge tone={product.accepts_waitlist ? "brand" : "muted"}>
              {product.accepts_waitlist ? "Early access — waitlist open" : "Waitlist closed"}
            </Badge>
            <span className="text-xs text-paper-dim/40">
              QRA does not provide investment advice.
            </span>
          </div>

          <div className="mt-10 max-w-2xl">
            <Markdown source={product.description_md} />
          </div>

          <Link
            href="/research"
            className="mt-10 inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-paper transition hover:border-white/30 hover:bg-white/5"
          >
            How QRA research works
            <span aria-hidden="true">→</span>
          </Link>
        </Reveal>

        <Reveal delay={140}>
          <div className="lg:sticky lg:top-28">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-7 sm:p-9">
              <h2 className="font-display text-xl font-semibold tracking-tight text-paper">
                Join the waitlist
              </h2>
              <p className="mb-6 mt-2 text-sm leading-relaxed text-paper-dim/60">
                Early access opens in cohorts, in waitlist order. One email — no spam.
              </p>
              <WaitlistForm compact />
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
