import type { Metadata } from "next";

import { ProductCard, ProductSummary } from "@/components/ProductCard";
import { SectionHeading, Badge } from "@/components/ui";
import { WaitlistForm } from "@/components/WaitlistForm";
import { apiGet } from "@/lib/api";
import { FALLBACK_PRODUCTS } from "@/lib/seed";

export const metadata: Metadata = {
  title: { absolute: "QRA — One account for everything we build." },
};

export const dynamic = "force-dynamic";

const PRINCIPLES = [
  {
    title: "One identity, every product",
    body: "Sign up once, use every QRA product. One account, one profile, one privacy center — no duplicate accounts, ever.",
  },
  {
    title: "Privacy by architecture",
    body: "We store the minimum, hash what we can, and delete what you ask. Consent is explicit, granular and withdrawable.",
  },
  {
    title: "Boring, reliable tech",
    body: "A hardened auth provider, a boring database, rate limits on every surface. Fast pages, accessible interfaces.",
  },
];

export default async function HomePage() {
  const data = await apiGet<{ products: ProductSummary[] }>("/api/v1/products", {
    products: FALLBACK_PRODUCTS,
  });
  const products = data.products.map((product) => ({
    ...product,
    tagline: product.tagline || "",
  }));
  const formProducts = products.map(({ id, slug, name }) => ({ id, slug, name }));

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="hero-grid absolute inset-0" aria-hidden="true" />
        <div
          className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-brand-500/20 to-transparent"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-20 sm:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge>Private beta — waitlist open</Badge>
            <h1 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-6xl">
              One account for{" "}
              <span className="gradient-text">everything we build.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
              QRA is a family of privacy-first products. Join one waitlist and
              you're in line for all of them — early access, first come, first served.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="#waitlist"
                className="inline-flex w-full items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-ink-950 transition hover:bg-zinc-200 sm:w-auto"
              >
                Join the waitlist
              </a>
              <a
                href="/products"
                className="inline-flex w-full items-center justify-center rounded-full border border-white/15 px-7 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5 sm:w-auto"
              >
                Explore products
              </a>
            </div>
            <dl className="mx-auto mt-14 grid max-w-2xl grid-cols-3 gap-4">
              {[
                ["3", "products in the pipeline"],
                ["1", "identity for all of them"],
                ["0", "dark patterns, forever"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-5">
                  <dt className="sr-only">{label}</dt>
                  <dd className="text-2xl font-bold text-white">{value}</dd>
                  <dd className="mt-1 text-xs text-zinc-500">{label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ── Principles ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeading
          eyebrow="Why QRA"
          title="Built like we mean it"
          description="The platform underneath the products is designed first — so the products can stay fast, private and reliable."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {PRINCIPLES.map((principle) => (
            <div key={principle.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="text-base font-semibold text-white">{principle.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">{principle.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Products ─────────────────────────────────────────────────── */}
      <section className="border-y border-white/5 bg-ink-900/40">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionHeading
            eyebrow="Products"
            title="What we're building"
            description="Three products, one shared foundation. Early access opens in cohorts — the waitlist order is the invite order."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Waitlist CTA ─────────────────────────────────────────────── */}
      <section id="waitlist" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-20">
        <div className="mx-auto grid max-w-4xl gap-10 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-8 sm:p-12 lg:grid-cols-2">
          <div>
            <Badge tone="success">First come, first served</Badge>
            <h2 className="mt-4 text-3xl font-bold text-white">Get early access</h2>
            <p className="mt-4 text-sm leading-relaxed text-zinc-400">
              Pick the product you're most excited about. One email, ten seconds —
              and you're in line for every cohort. We never spam: waitlist updates
              only, and marketing only if you separately opt in.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-zinc-300">
              <li className="flex gap-2">
                <span aria-hidden="true" className="text-accent-400">✓</span> Duplicate-proof — one entry per email per product
              </li>
              <li className="flex gap-2">
                <span aria-hidden="true" className="text-accent-400">✓</span> Your position is set at join time and never sold
              </li>
              <li className="flex gap-2">
                <span aria-hidden="true" className="text-accent-400">✓</span> Opt out any time, from any email
              </li>
            </ul>
          </div>
          <WaitlistForm products={formProducts} compact />
        </div>
      </section>
    </>
  );
}
