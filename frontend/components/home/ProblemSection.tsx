import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/ui";

const SOURCES = [
  "Annual report",
  "Quarterly results",
  "News",
  "Exchange filings",
  "Shareholding data",
  "Charts",
  "Financial ratios",
  "Analyst notes",
];

/** The real problem: information is easy to find, understanding is not. */
export function ProblemSection() {
  return (
    <Section id="problem" labelledBy="problem-heading">
      <Reveal>
        <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-accent">
              The problem
            </p>
            <h2
              id="problem-heading"
              className="mt-4 font-display text-3xl font-semibold leading-[1.12] tracking-tightest text-ink sm:text-[2.5rem]"
            >
              Investing is easy to start.
              <br />
              <span className="text-muted">Understanding what you&rsquo;re buying is harder.</span>
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Annual reports. Results. Filings. News. Ratios. Charts.
            </p>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-800">
              The information exists. Understanding how it connects is the difficult part.
            </p>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted">
              Financial information is scattered across annual reports, earnings results, filings,
              news, charts and financial websites. For a new investor, turning all of that into
              something understandable can be overwhelming.
            </p>
          </div>

          <div className="lg:pt-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              What you would read today
            </p>
            <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
              {SOURCES.map((source) => (
                <li key={source} className="flex items-center justify-between gap-4 py-3">
                  <span className="text-sm text-ink-700">{source}</span>
                  <span aria-hidden="true" className="text-sm text-muted-400">
                    —
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8 border-l-2 border-ink/15 pl-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Too much information
              </p>
              <p className="mt-3 font-display text-xl font-semibold leading-snug tracking-tight text-ink">
                Now what does all of this actually mean?
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
