import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-shell flex-col items-start px-5 py-24 sm:px-6 sm:py-32">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-accent">404</p>
      <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-tightest text-ink sm:text-5xl">
        This page doesn&rsquo;t exist
      </h1>
      <p className="mt-4 max-w-md text-lg leading-relaxed text-muted">
        The link may be broken, or the page may have moved.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-accent px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-accent-700"
        >
          Back home
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-md border border-ink/15 bg-white px-6 py-3.5 text-base font-semibold text-ink transition-colors hover:border-ink/30"
        >
          Contact us
        </Link>
      </div>
    </section>
  );
}
