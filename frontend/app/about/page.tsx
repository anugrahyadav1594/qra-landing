import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/Reveal";
import { Eyebrow } from "@/components/ui";
import { COMPANY_NAME, PRODUCT_FULL_NAME, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description: `${COMPANY_NAME} builds intelligent financial research infrastructure and products.`,
};

const VALUES = [
  {
    title: "Evidence before opinion",
    body: "Every statement QRA produces is designed to trace back to the source it came from — filings, statements, news, market data. No source, no statement.",
  },
  {
    title: "Research, not advice",
    body: "QRA is built to investigate and organize — never to tell you what to do. The investment decision stays with the investor, always.",
  },
  {
    title: "Consent is explicit",
    body: "Joining the waitlist is not signing up for marketing. Every purpose gets its own opt-in, its own record, and its own off switch.",
  },
  {
    title: "Boring architecture, serious controls",
    body: "Rate limits on every surface, hashed IPs, audit trails, honest error messages. The controls live in the code, not the pitch.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <Reveal>
        <div className="max-w-3xl">
          <Eyebrow>About</Eyebrow>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tightest text-paper sm:text-6xl">
            {SITE_NAME}
          </h1>
        </div>
        <div className="mt-10 max-w-3xl space-y-6 text-base leading-relaxed text-paper-dim/80">
          <p>
            {COMPANY_NAME} builds intelligent financial research infrastructure and products.
            QRA — the {PRODUCT_FULL_NAME} — is its first.
          </p>
          <p>
            The company started from a simple observation: researching a company today means
            stitching together filings, terminals, news feeds and PDFs — and the connections
            between them are made by hand, in a notebook, in a spreadsheet. The information
            exists. The process doesn't.
          </p>
          <p>
            QRA is our answer: an evidence-first research companion that investigates, organizes
            and cites — so you can spend your attention on reasoning, not gathering. We're
            pre-launch and building it in the open, with early access rolling out in cohorts.
          </p>
          <p>
            We're a small, remote-first team based in India. If any of this sounds like the kind
            of thing you want to build,{" "}
            <Link
              href="/careers"
              className="text-signal-300 underline decoration-signal-400/40 underline-offset-2 hover:text-signal-400"
            >
              come work with us
            </Link>
            .
          </p>
        </div>
      </Reveal>

      <div className="mt-16 grid gap-6 sm:grid-cols-2">
        {VALUES.map((value, index) => (
          <Reveal key={value.title} delay={index * 70}>
            <div className="h-full rounded-2xl border border-white/5 bg-ink-900/60 p-6">
              <h2 className="font-display text-lg font-semibold tracking-tight text-paper">{value.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-paper-dim/70">{value.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
