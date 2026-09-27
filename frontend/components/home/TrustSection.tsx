import { Reveal } from "@/components/Reveal";
import { Section, SectionLabel } from "@/components/ui";
import { TRUST } from "@/lib/content";

/**
 * Trust as a brand philosophy, not a disclaimer: three statements, one
 * principle and the line the whole product rests on.
 */
export function TrustSection() {
  return (
    <Section id="trust" tone="deep" labelledBy="trust-heading">
      {/* Slow vertical rules — structure, not decoration */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
        <div className="mx-auto grid h-full max-w-shell grid-cols-4 px-6">
          {[0, 1, 2, 3].map((column) => (
            <div key={column} className="border-l border-line-faint last:border-r" />
          ))}
        </div>
      </div>

      <div className="relative">
        <Reveal>
          <div className="max-w-2xl">
            <SectionLabel tone="brand">{TRUST.label}</SectionLabel>
            <h2
              id="trust-heading"
              className="mt-5 font-display text-[2.4rem] font-semibold leading-[1.04] tracking-tightest text-paper sm:text-5xl lg:text-[3.6rem]"
            >
              {TRUST.statement.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
          </div>
        </Reveal>

        <ul className="mt-16 max-w-3xl">
          {TRUST.principles.map((principle, index) => (
            <Reveal as="li" key={principle.n} delay={index * 110}>
              <div className="flex items-baseline gap-5 border-t border-line py-6 sm:gap-8">
                <span className="font-mono text-xs text-brand-400">{principle.n}</span>
                <p className="font-display text-xl font-semibold tracking-tight text-paper sm:text-3xl">
                  {principle.line}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={100}>
          <div className="mt-14 max-w-2xl border-t border-line pt-8">
            <p className="text-lg leading-relaxed text-paper-dim">{TRUST.closing[0]}</p>
            <p className="mt-6 font-display text-2xl font-semibold tracking-tight text-paper sm:text-3xl">
              {TRUST.closing[1]}
            </p>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-paper-faint">{TRUST.note}</p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
