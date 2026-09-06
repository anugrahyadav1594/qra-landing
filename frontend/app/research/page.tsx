import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/Reveal";
import { Eyebrow } from "@/components/ui";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Research",
  description: "How QRA research works: the information it investigates, the evidence-first method, and what QRA is not.",
  openGraph: {
    title: `Research · ${SITE_NAME}`,
    description: SITE_DESCRIPTION,
  },
};

const INVESTIGATES = [
  {
    title: "Company fundamentals",
    body: "Business model, segments, competitive position and the assumptions behind the numbers.",
  },
  {
    title: "Financial statements",
    body: "The patterns in revenue, margins, cash flow and balance-sheet health — read against history.",
  },
  {
    title: "Filings & disclosures",
    body: "What the company is required to say: ownership, transactions, material events.",
  },
  {
    title: "News & developments",
    body: "Recent developments that change the story — and the timeline of when they matter.",
  },
  {
    title: "Risks & catalysts",
    body: "What could go wrong, and what could change the view on the company.",
  },
];

const METHOD = [
  ["Question", "The research starts from what you need to decide."],
  ["Evidence", "Sources are gathered: filings, statements, news, market data."],
  ["Context", "Each fact is placed against the company's history and its sector."],
  ["Analysis", "Patterns, contradictions and sensitivities are organized into a structured view."],
  ["Thesis", "Your investment thesis — with the evidence that supports each part of it."],
];

export default function ResearchPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
      <Reveal>
        <div className="max-w-3xl">
          <Eyebrow>Research</Eyebrow>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tightest text-paper sm:text-6xl">
            How QRA research works
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-paper-dim/80">
            QRA is designed as an evidence-first research companion. It doesn't hand you an
            answer; it runs the investigation, organizes what it finds, and shows you the trail —
            so the decision stays yours.
          </p>
        </div>
      </Reveal>

      <div className="mt-20">
        <Reveal>
          <Eyebrow>What QRA investigates</Eyebrow>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tightest text-paper sm:text-4xl">
            Five layers, one company
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {INVESTIGATES.map((item, index) => (
            <Reveal key={item.title} delay={index * 70}>
              <div className="h-full rounded-2xl border border-white/5 bg-ink-900/60 p-6">
                <p className="font-mono text-xs text-signal-400">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-3 font-display text-lg font-semibold tracking-tight text-paper">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-paper-dim/70">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="mt-24 border-y border-white/5 bg-ink-900/40">
        <div className="py-20">
          <Reveal>
            <Eyebrow>The method</Eyebrow>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tightest text-paper sm:text-4xl">
              From question to thesis
            </h2>
          </Reveal>
          <div className="mt-10 space-y-4">
            {METHOD.map(([name, body], index) => (
              <Reveal key={name} delay={index * 80}>
                <div className="flex flex-col gap-2 rounded-xl border border-white/5 bg-ink-850/70 p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
                  <span className="w-32 shrink-0 font-display text-sm font-semibold text-aqua-300">
                    {name}
                  </span>
                  <p className="text-sm leading-relaxed text-paper-dim/80">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-24">
        <Reveal>
          <Eyebrow>What QRA is not</Eyebrow>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tightest text-paper sm:text-4xl">
            Honest about the edges
          </h2>
          <div className="mt-10 max-w-3xl space-y-4">
            <div className="rounded-xl border border-white/5 bg-ink-900/60 p-6">
              <h3 className="font-semibold text-paper">Not a chatbot</h3>
              <p className="mt-2 text-sm leading-relaxed text-paper-dim/70">
                QRA runs a structured investigation with the same shape every time — you can
                follow each step instead of parsing a conversation.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-ink-900/60 p-6">
              <h3 className="font-semibold text-paper">Not a stock screener</h3>
              <p className="mt-2 text-sm leading-relaxed text-paper-dim/70">
                QRA goes deep on the companies you choose, rather than ranking thousands of them.
              </p>
            </div>
            <div className="rounded-xl border border-aqua-500/25 bg-aqua-500/[0.06] p-6">
              <h3 className="font-semibold text-paper">Not an advisor</h3>
              <p className="mt-2 text-sm leading-relaxed text-paper-dim/80">
                QRA does not provide investment advice and does not make investment decisions for
                you. It investigates. You decide.
              </p>
            </div>
          </div>
          <div className="mt-12 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/waitlist"
              className="inline-flex items-center justify-center rounded-full bg-paper px-7 py-3 text-sm font-semibold text-ink-950 transition hover:bg-white"
            >
              Join the waitlist
            </Link>
            <Link
              href="/product"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-7 py-3 text-sm font-semibold text-paper transition hover:border-white/30 hover:bg-white/5"
            >
              About the product
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
