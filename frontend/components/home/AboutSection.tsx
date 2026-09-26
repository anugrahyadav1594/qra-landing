import Link from "next/link";

import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/ui";

export function AboutSection() {
  return (
    <Section id="about" tone="sunken" labelledBy="about-heading">
      <Reveal>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-accent">
              The company
            </p>
            <h2
              id="about-heading"
              className="mt-4 font-display text-3xl font-semibold leading-[1.12] tracking-tightest text-ink sm:text-[2.5rem]"
            >
              Quantrelic Analytics
            </h2>
          </div>

          <div className="space-y-6 text-lg leading-relaxed text-muted">
            <p className="text-ink-800">
              Quantrelic Analytics Private Limited is building technology to make financial
              information easier to understand and investing simpler for everyday investors.
            </p>
            <p>We believe access to investing should come with access to understanding.</p>
            <p className="text-base text-muted">
              QRA is in early development and we&rsquo;re sharing it early so it can be built with
              the people it&rsquo;s meant for.
            </p>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-md border border-ink/15 bg-white px-6 py-3 text-base font-semibold text-ink transition-colors hover:border-ink/30"
              >
                About the company
              </Link>
              <Link
                href="/careers"
                className="inline-flex items-center justify-center rounded-md border border-ink/15 bg-white px-6 py-3 text-base font-semibold text-ink transition-colors hover:border-ink/30"
              >
                We&rsquo;re hiring
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
