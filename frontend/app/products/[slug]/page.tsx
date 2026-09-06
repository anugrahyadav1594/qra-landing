import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Markdown } from "@/components/Markdown";
import { Badge } from "@/components/ui";
import { WaitlistForm } from "@/components/WaitlistForm";
import { apiGet } from "@/lib/api";
import { FALLBACK_PRODUCTS } from "@/lib/seed";

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

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.tagline,
    openGraph: { title: product.name, description: product.tagline },
  };
}

async function getProduct(slug: string): Promise<ProductDetail | null> {
  const data = await apiGet<{ products: ProductDetail[] }>("/api/v1/products", {
    products: FALLBACK_PRODUCTS,
  });
  return data.products.find((product) => product.slug === slug) ?? null;
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const formProducts = [{ id: product.id, slug: product.slug, name: product.name }];

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Badge tone={product.accepts_waitlist ? "brand" : "muted"}>
            {product.accepts_waitlist ? "Waitlist open" : "Coming soon"}
          </Badge>
          {product.domain && <Badge tone="muted">{product.domain}</Badge>}
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white">{product.name}</h1>
        <p className="mt-4 text-xl text-zinc-400">{product.tagline}</p>
        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-8">
          <Markdown source={product.description_md} />
        </div>
      </div>

      {product.accepts_waitlist && (
        <div className="mx-auto mt-16 max-w-2xl rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-8">
          <h2 className="text-2xl font-bold text-white">Join the {product.name} waitlist</h2>
          <p className="mt-2 mb-6 text-sm text-zinc-400">
            First come, first served. You'll hear from us only about {product.name} early access.
          </p>
          <WaitlistForm products={formProducts} defaultProductId={product.id} compact />
        </div>
      )}
    </section>
  );
}
