import { SITE_TAGLINE } from "@/lib/constants";

/**
 * Hero: what Quantrelic is building, in plain language.
 *
 * The visual is a concept, not a trading terminal: financial numbers on top,
 * a plain-language explanation underneath — confusion turning into clarity.
 * Every figure is a deliberate placeholder and the panel says so.
 */
export function Hero() {
  return (
    <section id="hero" data-section="hero" className="border-b border-ink/10">
      <div className="mx-auto grid max-w-shell gap-14 px-5 pb-20 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16 lg:pb-28 lg:pt-24">
        {/* ── Copy ─────────────────────────────────────────────────── */}
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-accent">
            Quantrelic Analytics
          </p>

          <h1 className="mt-6 font-display text-[2.6rem] font-semibold leading-[1.06] tracking-tightest text-ink sm:text-5xl lg:text-[3.5rem]">
            Investing shouldn&rsquo;t be this complicated.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Financial information is everywhere — annual reports, results, filings, news and market
            data. We&rsquo;re building a simpler way to understand what it all means before you
            invest.
          </p>

          <p className="mt-8 border-t border-ink/10 pt-5 font-display text-base font-medium text-ink">
            {SITE_TAGLINE}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#waitlist"
              className="inline-flex items-center justify-center rounded-md bg-accent px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-accent-700"
            >
              Join the waitlist
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-md border border-ink/15 bg-white px-6 py-3.5 text-base font-semibold text-ink transition-colors hover:border-ink/30"
            >
              See how it works
            </a>
          </div>

          <p className="mt-6 text-sm text-muted">
            QRA is in early development. Joining the waitlist only means we&rsquo;ll email you when
            early access opens.
          </p>
        </div>

        {/* ── Illustrative preview: numbers → meaning ──────────────── */}
        <figure className="w-full">
          <div className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 px-5 py-4">
              <p className="font-display text-sm font-semibold tracking-wide text-ink">
                RELIANCE INDUSTRIES
              </p>
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.14em] text-muted">
                Illustrative example
              </p>
            </div>

            {/* Raw numbers — deliberately quiet and unresolved */}
            <div className="px-5 py-4">
              <ul className="divide-y divide-ink/[0.07] text-sm">
                {["Revenue", "Profit", "Debt", "Cash flow"].map((label) => (
                  <li key={label} className="flex items-center justify-between py-3">
                    <span className="text-ink-600">{label}</span>
                    <span className="value-placeholder font-mono text-sm">₹ ···</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* The turn: same information, explained */}
            <div className="border-t border-ink/10 bg-canvas-sunken px-5 py-5">
              <p className="font-display text-base font-semibold tracking-tight text-ink">
                What does this actually mean?
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-700">
                Revenue has grown steadily, while margins have changed&hellip; Plain-language
                explanations, with the numbers they came from.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded border border-accent/25 bg-accent-50 px-3 py-1.5 text-xs font-semibold text-accent-700">
                  Understand this
                </span>
                <span className="rounded border border-ink/10 bg-white px-3 py-1.5 text-xs font-medium text-muted">
                  See the numbers
                </span>
              </div>
            </div>
          </div>

          <figcaption className="mt-3 text-xs leading-relaxed text-muted">
            A concept interface showing how an explanation sits alongside the numbers it comes
            from. Figures are shown as placeholders — this is not real company data, and QRA is
            still in development.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
