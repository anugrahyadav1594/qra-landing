import { Reveal } from "@/components/Reveal";
import { Eyebrow } from "@/components/ui";

const STEPS = [
  {
    n: "01",
    title: "Start with a ticker",
    body: "Pick the company or ticker you want to understand.",
  },
  {
    n: "02",
    title: "Gather the information",
    body: "Fundamentals, financial statements, filings and recent developments come together in one place.",
  },
  {
    n: "03",
    title: "Analyze with context",
    body: "Each fact is placed against the company's history and its sector.",
  },
  {
    n: "04",
    title: "Flag risks & catalysts",
    body: "What could go wrong — and what could change the story.",
  },
  {
    n: "05",
    title: "Review the synthesis",
    body: "An evidence-backed view of the business, growth and valuation.",
  },
  {
    n: "06",
    title: "Build the thesis",
    body: "Your own investment thesis — organized, sourced and ready to reason about.",
  },
];

export function PipelineSection() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
      <div className="grid gap-14 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
        <Reveal>
          <div className="lg:sticky lg:top-28">
            <Eyebrow>How it works</Eyebrow>
            <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-tightest text-paper sm:text-5xl">
              From ticker to thesis, step by step.
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-paper-dim/70">
              Six stages, one direction: from the ticker you're curious about to the thesis you
              decide on.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120} className="relative">
          {/* Vertical rail */}
          <div className="absolute bottom-6 left-[27px] top-6 w-px bg-white/5" aria-hidden="true">
            <div className="rail-draw h-full w-full bg-gradient-to-b from-signal-500/70 via-aqua-500/50 to-transparent" />
          </div>
          <ol className="space-y-8">
            {STEPS.map((step) => (
              <li key={step.n} className="relative flex gap-6">
                <span className="relative z-10 flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full border border-signal-500/30 bg-ink-850 font-mono text-sm font-semibold text-signal-300">
                  {step.n}
                </span>
                <div className="pt-1.5">
                  <h3 className="font-display text-lg font-semibold tracking-tight text-paper">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 max-w-md text-sm leading-relaxed text-paper-dim/70">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
