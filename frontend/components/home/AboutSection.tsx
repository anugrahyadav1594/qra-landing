import Link from "next/link";

import { Reveal } from "@/components/Reveal";
import { Eyebrow } from "@/components/ui";

export function AboutSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <Reveal>
        <div className="grid gap-14 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <div>
            <Eyebrow>The company</Eyebrow>
            <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-tightest text-paper sm:text-5xl">
              Quantrelic Analytics
            </h2>
          </div>
          <div className="space-y-6 text-base leading-relaxed text-paper-dim/80">
            <p>
              Quantrelic Analytics Private Limited builds intelligent financial research
              infrastructure and products. QRA — the Quantrelic Research Agent — is its first.
            </p>
            <p>
              We're a small, remote-first team based in India, building research software for
              serious questions. QRA is in early access development; if you'd like to help shape
              it, join the waitlist or write to us.
            </p>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-paper transition hover:border-white/30 hover:bg-white/5"
              >
                About the company
              </Link>
              <Link
                href="/careers"
                className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-paper transition hover:border-white/30 hover:bg-white/5"
              >
                We're hiring
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
