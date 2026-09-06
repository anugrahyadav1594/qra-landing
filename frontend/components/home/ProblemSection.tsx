import { Reveal } from "@/components/Reveal";
import { Eyebrow } from "@/components/ui";

const SOURCES = [
  "Company filings",
  "News",
  "Financial statements",
  "Market data",
  "Presentations",
  "Screeners",
  "Charts",
  "Management commentary",
];

export function ProblemSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <Reveal>
          <Eyebrow>The problem</Eyebrow>
          <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-tightest text-paper sm:text-5xl">
            Research is everywhere.
            <br />
            <span className="text-paper-dim/50">The process isn't.</span>
          </h2>
          <blockquote className="mt-9 border-l-2 border-signal-500/60 pl-6 text-lg leading-relaxed text-paper-dim/90">
            “The problem isn't finding another source of information. The problem is connecting the
            information that already exists.”
          </blockquote>
        </Reveal>

        <Reveal delay={120}>
          <div className="grid grid-cols-2 gap-3">
            {SOURCES.map((source, index) => (
              <div
                key={source}
                className="flex items-center gap-2.5 rounded-lg border border-white/5 bg-ink-900/60 px-4 py-3"
                style={{ transform: `translateY(${(index % 2) * 14}px)` }}
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-paper-dim/30" aria-hidden="true" />
                <span className="text-sm text-paper-dim/75">{source}</span>
              </div>
            ))}
          </div>

          <div className="relative mt-10 overflow-hidden rounded-2xl border border-signal-500/25 bg-gradient-to-b from-signal-600/[0.12] to-ink-900/60 p-6 sm:p-7">
            <svg
              className="chart-line absolute right-6 top-6 h-8 w-24 text-signal-400/50"
              viewBox="0 0 96 32"
              fill="none"
              aria-hidden="true"
            >
              <path d="M2 28 L18 22 L34 25 L50 14 L66 18 L82 8 L94 4" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <p className="font-display text-lg font-semibold tracking-tight text-paper">
              QRA · one coherent research workflow
            </p>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-paper-dim/75">
              Everything, connected — so you can investigate instead of gather.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
