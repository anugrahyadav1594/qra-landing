import type { Metadata } from "next";
import Link from "next/link";

import { Markdown } from "@/components/Markdown";
import { Reveal } from "@/components/Reveal";
import { WaitlistForm } from "@/components/WaitlistForm";
import { Badge, Eyebrow } from "@/components/ui";
import { apiGet } from "@/lib/api";
import { PRODUCT_NAME, SITE_NAME, SITE_URL } from "@/lib/constants";
import { FALLBACK_PRODUCT } from "@/lib/seed";

export const metadata: Metadata = {
  title: "Product",
  description:
    "QRA is being built to make the financial information behind an investment easier to understand — statements, results, filings and developments, explained in plain language.",
  openGraph: {
    title: `Product · ${SITE_NAME}`,
    description:
      "QRA is being built to make the financial information behind an investment easier to understand.",
    url: `${SITE_URL}/product`,
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
    <div className="mx-auto max-w-shell px-5 py-14 sm:px-6 sm:py-20">
      <div className="grid gap-14 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
        <Reveal>
          <Eyebrow>The product</Eyebrow>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-tightest text-ink sm:text-5xl">
            {PRODUCT_NAME} — financial information, made easier to understand.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{product.tagline}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Badge tone={product.accepts_waitlist ? "accent" : "muted"}>
              {product.accepts_waitlist ? "Early access — waitlist open" : "Waitlist closed"}
            </Badge>
            <span className="text-sm text-muted">
              In early development. {PRODUCT_NAME} does not provide investment advice.
            </span>
          </div>

          <div className="mt-10 max-w-2xl text-base">
            <Markdown source={product.description_md} />
          </div>

          <Link
            href="/research"
            className="mt-10 inline-flex items-center gap-2 rounded-md border border-ink/15 bg-white px-6 py-3 text-base font-semibold text-ink transition-colors hover:border-ink/30"
          >
            How {PRODUCT_NAME} explains things
            <span aria-hidden="true">→</span>
          </Link>
        </Reveal>

        <Reveal delay={120}>
          <div className="lg:sticky lg:top-28">
            <div className="rounded-lg border border-ink/10 bg-white p-6 shadow-card sm:p-8">
              <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
                Join the waitlist
              </h2>
              <p className="mb-6 mt-2 text-sm leading-relaxed text-muted">
                Early access opens in cohorts. One email — no spam.
              </p>
              <WaitlistForm compact />
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
