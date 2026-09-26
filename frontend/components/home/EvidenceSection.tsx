import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/ui";

const CHAIN = [
  {
    label: "Number",
    value: "Revenue increased",
    detail: "What you see first.",
  },
  {
    label: "What it means",
    value: "What changed?",
    detail: "The explanation, in plain language.",
  },
  {
    label: "Where it came from",
    value: "Source: annual report / financial statement",
    detail: "The document the number is from, so you can check it yourself.",
  },
];

/** Evidence: teaching the visitor how to trust what they read. */
export function EvidenceSection() {
  return (
    <Section id="evidence" tone="sunken" labelledBy="evidence-heading">
      <Reveal>
        <div className="max-w-2xl">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-accent">
            Evidence
          </p>
          <h2
            id="evidence-heading"
            className="mt-4 font-display text-3xl font-semibold leading-[1.12] tracking-tightest text-ink sm:text-[2.5rem]"
          >
            Every number should have a reason.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            If you can&rsquo;t see where a number came from, you can&rsquo;t decide how much to
            trust it. So each explanation is meant to be traceable to the document behind it.
          </p>
        </div>

        <ol className="mt-14 grid gap-8 md:grid-cols-3 md:gap-6">
          {CHAIN.map((node, index) => (
            <li key={node.label} className="border-t border-ink/15 pt-6">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  {node.label}
                </p>
              </div>
              <p className="mt-4 font-display text-lg font-semibold leading-snug tracking-tight text-ink">
                {node.value}
              </p>
              <p className="mt-2 text-base leading-relaxed text-muted">{node.detail}</p>
            </li>
          ))}
        </ol>

        <p className="mt-12 max-w-2xl text-base leading-relaxed text-muted">
          The goal isn&rsquo;t more information. It&rsquo;s information you can check.
        </p>
      </Reveal>
    </Section>
  );
}
