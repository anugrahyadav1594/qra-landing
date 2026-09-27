import Link from "next/link";

import { Button, SectionLabel } from "@/components/ui";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-shell flex-col items-start px-5 py-24 sm:px-6 sm:py-32">
      <SectionLabel tone="brand">404</SectionLabel>
      <h1 className="mt-5 font-display text-[2.2rem] font-semibold leading-[1.06] tracking-tightest text-paper sm:text-5xl">
        This page doesn\u2019t exist.
      </h1>
      <p className="mt-4 max-w-md text-lg leading-relaxed text-paper-dim">
        The link may be broken, or the page may have moved.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button href="/" size="lg">
          Back home
        </Button>
        <Button href="/contact" size="lg" variant="outline">
          Contact us
        </Button>
      </div>
      <p className="mt-8 text-sm text-paper-faint">
        Looking for the product?{" "}
        <Link href="/product" className="text-brand-300 underline decoration-brand-500/40 underline-offset-2">
          See the product page
        </Link>
        .
      </p>
    </section>
  );
}
