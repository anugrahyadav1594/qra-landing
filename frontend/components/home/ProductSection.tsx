import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/ui";

const QUESTIONS = [
  { topic: "Business", question: "How does the company make money?" },
  { topic: "Financials", question: "Are revenue and profits improving?" },
  { topic: "Growth", question: "What\u2019s driving the growth?" },
  { topic: "Risk", question: "What could change the picture?" },
  { topic: "Recent developments", question: "What has changed recently?" },
];

const EXPLANATION = [
  "Revenue has grown steadily\u2026",
  "Margins have moved with costs\u2026",
  "Cash generation has supported investment\u2026",
  "Debt has changed over the period\u2026",
];

/**
 * Product concept: an explanatory interface, not a broker terminal.
 * Everything inside the panel is placeholder content for a concept UI.
 */
export function ProductSection() {
  return (
    <Section id="product" labelledBy="product-heading">
      <Reveal>
        <div className="max-w-2xl">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-accent">
            The product
          </p>
          <h2
            id="product-heading"
            className="mt-4 font-display text-3xl font-semibold leading-[1.12] tracking-tightest text-ink sm:text-[2.5rem]"
          >
            Everything you need to understand a company.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            One company at a time, answered in plain questions — and the explanation behind each
            answer.
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-lg border border-ink/10 bg-white shadow-card">
          {/* Panel header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 px-5 py-5 sm:px-7">
            <div>
              <p className="font-display text-lg font-semibold tracking-tight text-ink">
                RELIANCE INDUSTRIES
              </p>
              <p className="mt-1 text-sm text-muted">What should I understand about this company?</p>
            </div>
            <p className="text-[0.68rem] font-medium uppercase tracking-[0.14em] text-muted">
              Illustrative interface
            </p>
          </div>

          {/* The five things QRA is being built to explain */}
          <ul className="divide-y divide-ink/[0.07]">
            {QUESTIONS.map((item) => (
              <li
                key={item.topic}
                className="grid gap-1 px-5 py-5 sm:grid-cols-[minmax(0,190px)_1fr] sm:items-baseline sm:gap-6 sm:px-7"
              >
                <p className="font-display text-base font-semibold tracking-tight text-ink">
                  {item.topic}
                </p>
                <p className="text-base leading-relaxed text-muted">{item.question}</p>
              </li>
            ))}
          </ul>

          {/* The explanation layer */}
          <div className="border-t border-ink/10 bg-canvas-sunken px-5 py-6 sm:px-7 sm:py-7">
            <p className="font-display text-base font-semibold tracking-tight text-ink">
              Here&rsquo;s what the information means
            </p>
            <ul className="mt-4 space-y-2.5">
              {EXPLANATION.map((line) => (
                <li key={line} className="flex gap-3 text-base leading-relaxed text-ink-700">
                  <span aria-hidden="true" className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                  {line}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="rounded border border-accent/25 bg-accent-50 px-3 py-1.5 text-xs font-semibold text-accent-700">
                See the evidence
              </span>
              <span className="text-xs text-muted">
                Every explanation links back to the statement it came from.
              </span>
            </div>
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-muted">
          Concept interface. The company name and all figures shown are placeholders used to explain
          the idea — not real data, and not a live product.
        </p>

        <p className="mt-12 max-w-2xl font-display text-2xl font-semibold leading-snug tracking-tight text-ink sm:text-3xl">
          Numbers are useful. Understanding what they mean is better.
        </p>
      </Reveal>
    </Section>
  );
}
