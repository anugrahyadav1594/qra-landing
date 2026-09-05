import type { Metadata } from "next";

import { SectionHeading } from "@/components/ui";
import { WaitlistForm } from "@/components/WaitlistForm";
import { apiGet } from "@/lib/api";
import { FALLBACK_PRODUCTS } from "@/lib/seed";

export const metadata: Metadata = {
  title: "Join the waitlist",
  description: "Get early access to QRA products — first come, first served.",
};

export const dynamic = "force-dynamic";

export default async function WaitlistPage() {
  const data = await apiGet<{ products: { id: string; slug: string; name: string }[] }>(
    "/api/v1/products",
    { products: FALLBACK_PRODUCTS },
  );
  const products = data.products.map(({ id, slug, name }) => ({ id, slug, name }));

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <SectionHeading
        eyebrow="Waitlist"
        title="Get in line for early access"
        description="One email per product. Duplicates are ignored, your position is fixed at join time, and opting out takes one click."
      />
      <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-8">
        <WaitlistForm products={products} />
      </div>
    </section>
  );
}
