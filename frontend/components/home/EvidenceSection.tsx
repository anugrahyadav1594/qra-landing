import { Reveal } from "@/components/Reveal";
import { Eyebrow } from "@/components/ui";

const CHAIN = ["Question", "Evidence", "Context", "Analysis", "Thesis"];

export function EvidenceSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow className="mb-3">Evidence-first</Eyebrow>
          <h2 className="font-display text-4xl font-semibold leading-[1.08] tracking-tightest text-paper sm:text-5xl">
            Answers without evidence are just opinions.
          </h2>
        </div>
      </Reveal>

      <Reveal delay={140}>
        <div className="mt-16 flex flex-col items-center justify-center gap-2 sm:flex-row sm:items-stretch sm:gap-0">
          {CHAIN.map((node, index) => (
            <div key={node} className="flex flex-col items-center sm:flex-row sm:items-center">
              <div
                className={`flex min-w-[120px] flex-col items-center justify-center gap-1 rounded-xl border px-5 py-4 sm:min-w-[130px] ${
                  index === CHAIN.length - 1
                    ? "border-aqua-500/40 bg-aqua-500/10"
                    : "border-white/10 bg-ink-900/70"
                }`}
              >
                <span className="font-mono text-[10px] text-paper-dim/40">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className={`font-display text-sm font-semibold tracking-tight ${
                    index === CHAIN.length - 1 ? "text-aqua-300" : "text-paper"
                  }`}
                >
                  {node}
                </span>
              </div>
              {index < CHAIN.length - 1 && (
                <svg
                  className="mx-1 hidden h-5 w-10 text-signal-400/60 sm:block"
                  viewBox="0 0 40 20"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    className="chain-arrow"
                    d="M2 10h30M28 4l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    style={{ animationDelay: `${0.3 + index * 0.25}s` }}
                  />
                </svg>
              )}
            </div>
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-xl text-center text-sm leading-relaxed text-paper-dim/60">
          Every statement QRA produces is designed to trace back to the source it came from —
          filings, statements, news, market data.
        </p>
      </Reveal>
    </section>
  );
}
