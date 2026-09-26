import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/ui";

const REASONS = [
  {
    n: "01",
    title: "It\u2019s written for professionals.",
    body: "Annual reports, filings and results are written for analysts. For everyone else, they can read like a different language.",
  },
  {
    n: "02",
    title: "It\u2019s scattered across places.",
    body: "Numbers live in one document, context in another, news somewhere else — and nothing tells you which part matters.",
  },
  {
    n: "03",
    title: "There\u2019s nowhere simple to start.",
    body: "Questions pile up as you read — what changed, why it matters, what to watch next — with no obvious first step.",
  },
];

/** Why financial information feels hard — naming the difficulty honestly. */
export function WhyHardSection() {
  return (
    <Section id="why" tone="sunken" labelledBy="why-heading">
      <Reveal>
        <h2
          id="why-heading"
          className="max-w-2xl font-display text-3xl font-semibold leading-[1.12] tracking-tightest text-ink sm:text-[2.5rem]"
        >
          Financial information shouldn&rsquo;t require a finance degree to understand.
        </h2>

        <dl className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {REASONS.map((reason) => (
            <div key={reason.n} className="border-t border-ink/15 pt-6">
              <dt className="font-mono text-xs text-accent">{reason.n}</dt>
              <dd className="mt-4">
                <p className="font-display text-lg font-semibold leading-snug tracking-tight text-ink">
                  {reason.title}
                </p>
                <p className="mt-3 text-base leading-relaxed text-muted">{reason.body}</p>
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </Section>
  );
}
