"use client";

import { QRAAtmosphere } from "@/components/motion/QRAAtmosphere";
import { QRAReveal } from "@/components/motion/QRAReveal";
import { QRASectionTransition } from "@/components/motion/QRASectionTransition";
import { Section, SectionLabel } from "@/components/ui";
import { TRUST } from "@/lib/content";

/**
 * Trust.
 *
 * The most minimal section on the site: one horizontal line, three statements
 * that extend it, and the line the whole product rests on. The animation slows
 * down here on purpose — after everything before it, precision is the point.
 */
export function TrustSection() {
  return (
    <Section id="trust" tone="deep" labelledBy="trust-heading" className="relative overflow-hidden">
      <QRASectionTransition label="Calmer" />

      {/* The quietest environment on the site. */}
      <QRAAtmosphere variant="trust" />


      <QRAReveal stagger step={160} className="relative z-10">
        <div className="max-w-2xl">
          <SectionLabel tone="brand">{TRUST.label}</SectionLabel>
          <h2
            id="trust-heading"
            className="mt-5 font-display text-[2.4rem] font-semibold leading-[1.04] tracking-tightest text-paper sm:text-5xl lg:text-[3.6rem]"
          >
            {TRUST.statement.map((line, index) => (
              <span key={line} className="block">
                {line}
                {index < TRUST.statement.length - 1 ? " " : null}
              </span>
            ))}
          </h2>
        </div>

        {/* One line, extended three times. */}
        <div className="mt-16 max-w-3xl">
          <div className="trust-rule w-full" aria-hidden="true" />
          <ul>
            {TRUST.principles.map((principle) => (
              <li key={principle.n}>
                <div className="flex items-baseline gap-5 py-7 sm:gap-8" data-principle>
                  <span className="font-mono text-xs text-brand-400">{principle.n}</span>
                  <p className="font-display text-xl font-semibold tracking-tight text-paper sm:text-3xl">
                    {principle.line}
                  </p>
                </div>
                <div className="trust-rule w-full" aria-hidden="true" />
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-14 max-w-2xl" data-closing>
          <p className="text-lg leading-relaxed text-paper-dim">{TRUST.closing[0]}</p>
          <p className="mt-6 font-display text-2xl font-semibold tracking-tight text-paper sm:text-3xl">
            {TRUST.closing[1]}
          </p>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-paper-faint">{TRUST.note}</p>
        </div>
      </QRAReveal>
    </Section>
  );
}
