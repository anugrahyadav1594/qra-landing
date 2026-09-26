import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/ui";

const STEPS = [
  {
    n: "01",
    title: "Understand the business",
    body: "See how the company makes money, what drives its growth and where its business could be vulnerable.",
  },
  {
    n: "02",
    title: "Understand the numbers",
    body: "Financial statements are translated into information you can actually reason about.",
  },
  {
    n: "03",
    title: "Understand what changed",
    body: "Results, filings, developments and other information are brought together so you don\u2019t have to piece everything together yourself.",
  },
  {
    n: "04",
    title: "Understand the risks",
    body: "What could change the picture, what the company is exposed to, and what is worth watching.",
  },
  {
    n: "05",
    title: "Make your own decision",
    body: "Quantrelic explains; it does not tell you what to buy or sell. The decision stays yours.",
  },
];

/** How it works: five plain-English stages, no research pipeline jargon. */
export function HowItWorksSection() {
  return (
    <Section id="how-it-works" tone="sunken" labelledBy="how-it-works-heading">
      <Reveal>
        <div className="grid gap-14 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-accent">
              How it works
            </p>
            <h2
              id="how-it-works-heading"
              className="mt-4 font-display text-3xl font-semibold leading-[1.12] tracking-tightest text-ink sm:text-[2.5rem]"
            >
              Understand before you invest.
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
              The same questions a careful investor asks, in the order they make sense — answered in
              language anyone can follow.
            </p>
          </div>

          <ol className="border-t border-ink/15">
            {STEPS.map((step) => (
              <li key={step.n} className="border-b border-ink/10 py-7 first:pt-6">
                <div className="flex gap-5">
                  <span className="pt-1 font-mono text-xs text-accent">{step.n}</span>
                  <div>
                    <h3 className="font-display text-xl font-semibold tracking-tight text-ink">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-xl text-base leading-relaxed text-muted">{step.body}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>
    </Section>
  );
}
