import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col items-center px-6 py-32 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-signal-400">404</p>
      <h1 className="mt-4 font-display text-4xl font-semibold tracking-tightest text-paper">
        This page doesn't exist
      </h1>
      <p className="mt-4 max-w-md text-paper-dim/70">
        The link may be broken, or the page may have moved. Everything else still works.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-paper px-6 py-3 text-sm font-semibold text-ink-950 transition hover:bg-white"
      >
        Back home
      </Link>
    </section>
  );
}
