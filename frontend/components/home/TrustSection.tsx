"use client";

import { useRef } from "react";

import { QRADataField } from "@/components/QRADataField";
import { Section, SectionLabel } from "@/components/ui";
import { useScrollScene } from "@/components/useScrollScene";
import { TRUST } from "@/lib/content";

/**
 * Trust.
 *
 * The most minimal section on the site: one horizontal line, three statements
 * that extend it, and the line the whole product rests on. The animation slows
 * down here on purpose — after everything before it, precision is the point.
 */
export function TrustSection() {
  const ref = useRef<HTMLDivElement>(null);

  useScrollScene(ref, ({ gsap }) => {
    const timeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: ref.current,
        start: "top 72%",
        end: "bottom 60%",
        scrub: 0.8,
      },
    });

    timeline.from("[data-rule]", {
      scaleX: 0,
      transformOrigin: "left center",
      duration: 1.1,
      stagger: 0.5,
    });
    timeline.from(
      "[data-principle]",
      { opacity: 0, y: 10, duration: 0.6, stagger: 0.5 },
      0.15,
    );
    timeline.from("[data-closing]", { opacity: 0, y: 12, duration: 0.8 }, ">-0.3");
  });

  return (
    <Section id="trust" tone="deep" labelledBy="trust-heading" className="relative overflow-hidden">
      <QRADataField variant="organize" intensity={0.5} density={0.5} className="opacity-30" />

      {/* Slow vertical rules — structure, not decoration */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
        <div className="mx-auto grid h-full max-w-shell grid-cols-4 px-6">
          {[0, 1, 2, 3].map((column) => (
            <div key={column} className="border-l border-line-faint last:border-r" />
          ))}
        </div>
      </div>

      <div className="relative" ref={ref}>
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
          <div className="h-px w-full origin-left bg-line-strong" data-rule aria-hidden="true" />
          <ul>
            {TRUST.principles.map((principle) => (
              <li key={principle.n}>
                <div className="flex items-baseline gap-5 py-7 sm:gap-8" data-principle>
                  <span className="font-mono text-xs text-brand-400">{principle.n}</span>
                  <p className="font-display text-xl font-semibold tracking-tight text-paper sm:text-3xl">
                    {principle.line}
                  </p>
                </div>
                <div className="h-px w-full origin-left bg-line" data-rule aria-hidden="true" />
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
      </div>
    </Section>
  );
}
