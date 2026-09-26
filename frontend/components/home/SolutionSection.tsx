import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/ui";

const STEPS = [
  {
    n: "01",
    title: "Find the information",
    body: "The reports, results, filings and developments that matter for one company, brought together instead of hunted for.",
  },
  {
    n: "02",
    title: "Understand what it means",
    body: "What the numbers are saying, explained in language you don\u2019t need to be a professional to follow.",
  },
  {
    n: "03",
    title: "See what matters",
    body: "What changed, what it affects, and what is worth keeping an eye on next.",
  },
  {
    n: "04",
    title: "Decide for yourself",
    body: "No tips and no predictions. Understanding first, then your own decision.",
  },
];

/** What Quantrelic is building, and how it makes investing simpler. */
export function SolutionSection() {
  return (
    <Section id="solution" labelledBy="solution-heading">
      <Reveal>
        <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-accent">
              What we&rsquo;re building
            </p>
            <h2
              id="solution-heading"
              className="mt-4 font-display text-3xl font-semibold leading-[1.12] tracking-tightest text-ink sm:text-[2.5rem]"
            >
              Turn financial information into understanding.
            </h2>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
              Quantrelic is being built to explain the information behind an investment — in a way
              that makes sense whether you&rsquo;re seeing it for the first time or already know the
              basics.
            </p>
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-muted">
              QRA is in development. This is the direction we are building towards, described
              plainly — not a finished product.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              How it makes investing simpler
            </p>
            <ol className="mt-4">
              {STEPS.map((step) => (
                <li key={step.n} className="border-t border-ink/10 py-6 first:border-t-0 sm:py-7">
                  <div className="flex gap-5">
                    <span className="pt-1 font-mono text-xs text-accent">{step.n}</span>
                    <div>
                      <h3 className="font-display text-lg font-semibold tracking-tight text-ink">
                        {step.title}
                      </h3>
                      <p className="mt-2 max-w-lg text-base leading-relaxed text-muted">
                        {step.body}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
