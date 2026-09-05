import Link from "next/link";

import { Badge } from "@/components/ui";

export type ProductSummary = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  status: string;
  accepts_waitlist: boolean;
};

export function ProductCard({ product }: { product: ProductSummary }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-brand-500/40 hover:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-brand-500/40"
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/25 to-accent-500/25 text-lg font-bold text-white">
          {product.name.charAt(0)}
        </span>
        <Badge tone={product.accepts_waitlist ? "brand" : "muted"}>
          {product.accepts_waitlist ? "Waitlist open" : "Coming soon"}
        </Badge>
      </div>
      <h3 className="text-lg font-semibold text-white group-hover:text-brand-400">
        {product.name}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400">{product.tagline}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-400">
        Learn more
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </span>
    </Link>
  );
}
