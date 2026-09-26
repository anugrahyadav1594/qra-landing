import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/ui";

const PRINCIPLES = [
  { n: "01", line: "No guaranteed returns." },
  { n: "02", line: "No stock tips." },
  { n: "03", line: "No pretending to know the future." },
];

/** Trust: a product philosophy, not a legal footnote. */
export function TrustSection() {
  return (
    <Section id="trust" tone="dark" labelledBy="trust-heading">
      <Reveal>
        <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-accent-200">
              Trust
            </p>
            <h2
              id="trust-heading"
              className="mt-4 font-display text-3xl font-semibold leading-[1.12] tracking-tightest text-white sm:text-[2.5rem]"
            >
              Clarity over hype.
            </h2>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/70">
              Just clearer financial information to help you understand what you&rsquo;re looking at.
            </p>
          </div>

          <div>
            <ul>
              {PRINCIPLES.map((principle) => (
                <li
                  key={principle.n}
                  className="flex items-baseline gap-5 border-t border-white/15 py-6 first:border-t-0 first:pt-1"
                >
                  <span className="font-mono text-xs text-accent-200">{principle.n}</span>
                  <p className="font-display text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    {principle.line}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-10 border-t border-white/15 pt-8">
              <p className="font-display text-2xl font-semibold tracking-tight text-white">
                QRA explains. You decide.
              </p>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-white/65">
                QRA is a product of Quantrelic Analytics Private Limited. It is being built to
                explain financial information — not to provide investment advice, recommend
                investments, or make decisions for anyone.
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
