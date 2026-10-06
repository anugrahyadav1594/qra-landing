"use client";

import { QRAReveal } from "@/components/motion/QRAReveal";
import { QRASectionTransition } from "@/components/motion/QRASectionTransition";
import { Section, SectionLabel } from "@/components/ui";
import { WHY } from "@/lib/content";

/**
 * WHY QRA — the differentiation, and the system underneath it.
 *
 * Two columns, kept deliberately bare: the familiar route on the left, the QRA
 * route on the right. The argument is in the shape — one column ends at
 * "remember", the other ends at "improve", and only one of them ever asks the
 * visitor to decide something.
 *
 * Below it, the five parts of the product are drawn as one chain rather than as
 * a feature list, so nothing on the page reads as an afterthought: each part
 * exists to feed the next.
 */
export function WhySection() {
  return (
    <Section id="why" tone="raised" labelledBy="why-heading" className="relative overflow-hidden">
      <QRASectionTransition label="Different" />

      <div className="relative z-10">
        <QRAReveal>
          <div className="max-w-3xl">
            <SectionLabel tone="brand">{WHY.label}</SectionLabel>
            <h2
              id="why-heading"
              className="mt-5 font-display text-[2.1rem] font-semibold leading-[1.08] tracking-tightest text-paper sm:text-5xl sm:leading-[1.05] lg:text-[3.4rem]"
            >
              {WHY.statement.map((line, index) => (
                <span key={line} className="block">
                  {line}
                  {index < WHY.statement.length - 1 ? " " : null}
                </span>
              ))}
            </h2>
          </div>
        </QRAReveal>

        {/* The two routes. */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 sm:gap-8 lg:mt-16">
          <QRAReveal variant="clip">
            <div className="why-col why-col--muted h-full">
              <p className="micro">{WHY.traditional.title}</p>
              <ol className="mt-6 space-y-3">
                {WHY.traditional.steps.map((step, index) => (
                  <li key={step} className="flex items-center gap-3">
                    <span className="font-mono text-xs text-paper-faint">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-lg font-medium tracking-tight text-paper-dim">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="mt-6 border-t border-line-faint pt-5 text-sm leading-relaxed text-paper-mute">
                {WHY.traditional.note}
              </p>
            </div>
          </QRAReveal>

          <QRAReveal variant="clip" delay={110}>
            <div className="why-col why-col--qra h-full">
              <p className="micro !text-brand-400">{WHY.qra.title}</p>
              <ol className="mt-6 space-y-3">
                {WHY.qra.steps.map((step, index) => (
                  <li key={step} className="flex items-center gap-3">
                    <span className="font-mono text-xs text-brand-400">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-lg font-semibold tracking-tight text-paper">
                      {step}
                    </span>
                    {index === 2 && (
                      <span className="why-col__mark" aria-hidden="true">
                        you
                      </span>
                    )}
                  </li>
                ))}
              </ol>
              <p className="mt-6 border-t border-line-faint pt-5 text-sm leading-relaxed text-paper-dim">
                {WHY.qra.note}
              </p>
            </div>
          </QRAReveal>
        </div>

        {/* The system, as one chain. */}
        <QRAReveal delay={80}>
          <div className="mt-16 border-t border-line pt-8">
            <p className="micro">{WHY.system.title}</p>
            <ol className="mt-6 flex flex-wrap items-stretch gap-3">
              {WHY.system.nodes.map((node, index) => (
                <li key={node.label} className="flex items-center gap-3">
                  <span className="why-node">
                    <span className="why-node__label">{node.label}</span>
                    <span className="why-node__detail">{node.detail}</span>
                  </span>
                  {index < WHY.system.nodes.length - 1 && (
                    <span aria-hidden="true" className="why-node__arrow">
                      →
                    </span>
                  )}
                </li>
              ))}
            </ol>
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-paper-mute">
              {WHY.system.caption}
            </p>
            <p className="mt-8 font-display text-xl font-semibold tracking-tight text-paper sm:text-2xl">
              {WHY.closing}
            </p>
          </div>
        </QRAReveal>
      </div>
    </Section>
  );
}
