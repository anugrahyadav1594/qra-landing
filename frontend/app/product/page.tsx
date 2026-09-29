import type { Metadata } from "next";

import { socialMetadata } from "@/lib/seo";

import { ProductPreview } from "@/components/ProductPreview";
import { QRAReveal } from "@/components/motion/QRAReveal";
import { WaitlistForm } from "@/components/WaitlistForm";
import { Button, SectionLabel } from "@/components/ui";
import { apiGet } from "@/lib/api";
import { PRODUCT_NAME, SITE_NAME, SITE_URL } from "@/lib/constants";
import { FALLBACK_PRODUCT } from "@/lib/seed";

export const metadata: Metadata = {
  title: "Product",
  description:
    "QRA is being built to make the financial information behind an investment easier to understand — the business, the numbers, what changed and what could change the picture.",
  ...socialMetadata({
    title: `Product · ${SITE_NAME}`,
    description: "QRA is being built to make the financial information behind an investment easier to understand.",
    url: `${SITE_URL}/product`,
  }),
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
    data.products.find((candidate) => candidate.slug === "qra") ?? data.products[0] ?? FALLBACK_PRODUCT;

  return (
    <div className="relative">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[520px] grid-backdrop" />

      <div className="relative mx-auto max-w-shell px-5 pb-20 pt-14 sm:px-6 sm:pt-20">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-end lg:gap-16">
          <div>
            <SectionLabel tone="brand">The product</SectionLabel>
            <h1 className="mt-5 font-display text-[2.5rem] font-semibold leading-[1.03] tracking-tightest text-paper sm:text-5xl lg:text-6xl">
              Financial information.
              <br />
              Finally in context.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-paper-dim">
              One company. Five questions. An explanation for each answer — and the source it came
              from.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-sm leading-relaxed text-paper-mute">{product.tagline}</p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded border border-line px-2.5 py-1 text-xs text-paper-dim">
                {product.accepts_waitlist ? "Early access — waitlist open" : "Waitlist closed"}
              </span>
              <span className="text-xs text-paper-faint">
                In early development. {PRODUCT_NAME} does not provide investment advice.
              </span>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button href="/waitlist">Join the waitlist</Button>
              <Button href="/research" variant="outline">
                How it works
              </Button>
            </div>
          </div>
        </div>

        <QRAReveal variant="scale" delay={120} className="mt-14">
          <ProductPreview />
        </QRAReveal>

        <div className="mt-16 grid gap-10 border-t border-line pt-12 lg:grid-cols-[1.1fr_minmax(0,460px)] lg:gap-16">
          <QRAReveal>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-paper sm:text-3xl">
              What QRA is not
            </h2>
            <ul className="mt-6 space-y-4 text-base leading-relaxed text-paper-dim">
              <li>Not a tip service — it never tells you what to buy or sell.</li>
              <li>Not a prediction engine — it does not forecast prices or promise returns.</li>
              <li>Not an advisor — it explains financial information, and you decide.</li>
            </ul>
            <p className="mt-8 max-w-xl text-sm leading-relaxed text-paper-mute">
              {product.description_md.split("\n")[0]}
            </p>
          </QRAReveal>

          <QRAReveal delay={120}>
            <div className="rounded-xl border border-line bg-ink-850/80 p-6 shadow-panel sm:p-7">
              <h2 className="font-display text-lg font-semibold tracking-tight text-paper">
                Join the waitlist
              </h2>
              <p className="mb-5 mt-2 text-sm text-paper-mute">
                Early access opens in cohorts. One email — no spam.
              </p>
              <WaitlistForm compact />
            </div>
          </QRAReveal>
        </div>
      </div>
    </div>
  );
}
