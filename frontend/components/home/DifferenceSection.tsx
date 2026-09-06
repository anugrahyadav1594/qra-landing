import { Reveal } from "@/components/Reveal";
import { Eyebrow } from "@/components/ui";

const STEPS = [
  { n: "01", text: "A user begins with a company or ticker." },
  {
    n: "02",
    text: "QRA assembles the relevant information — fundamentals, financial statements, filings and recent developments.",
  },
  {
    n: "03",
    text: "Each source is examined for context: what changed, what matters, what needs watching.",
  },
  {
    n: "04",
    text: "The evidence is organized — fundamentals, risks, catalysts and valuation signals in one structured view.",
  },
  { n: "05", text: "It helps organize research into something you can reason about." },
];

export function DifferenceSection() {
  return (
    <section className="border-y border-white/5 bg-ink-900/40">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <Eyebrow>The QRA difference</Eyebrow>
              <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-tightest text-paper sm:text-5xl">
                Turn information into investigation.
              </h2>
              <p className="mt-6 max-w-md text-base leading-relaxed text-paper-dim/70">
                Most tools add another source. QRA is designed to connect the sources you already
                have — into a process you can follow, question and build on.
              </p>
            </div>
          </Reveal>

          <div className="space-y-4">
            {STEPS.map((step, index) => (
              <Reveal key={step.n} delay={index * 90}>
                <div className="flex gap-5 rounded-xl border border-white/5 bg-ink-850/70 p-5 sm:p-6">
                  <span className="font-mono text-sm font-semibold text-signal-400">{step.n}</span>
                  <p className="text-base leading-relaxed text-paper-dim/90">{step.text}</p>
                </div>
              </Reveal>
            ))}
            <Reveal delay={STEPS.length * 90}>
              <p className="pt-4 text-center text-xs font-semibold uppercase tracking-[0.3em] text-aqua-300">
                QRA investigates. You decide.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
