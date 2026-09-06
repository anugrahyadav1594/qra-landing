import type { Metadata } from "next";

import { ProductCard, ProductSummary } from "@/components/ProductCard";
import { SectionHeading } from "@/components/ui";
import { apiGet } from "@/lib/api";
import { FALLBACK_PRODUCTS } from "@/lib/seed";

export const metadata: Metadata = {
  title: "Products",
  description: "Every QRA product — one waitlist, one identity.",
};

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const data = await apiGet<{ products: ProductSummary[] }>("/api/v1/products", {
    products: FALLBACK_PRODUCTS,
  });

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <SectionHeading
        eyebrow="Products"
        title="Three products, one platform"
        description="Each product is independent — but they share one identity, one consent model and one privacy center."
      />
      <div className="grid gap-6 md:grid-cols-3">
        {data.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
