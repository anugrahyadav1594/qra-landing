import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/Reveal";
import { PRODUCT_NAME, SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "How QRA explains things",
  description:
    "How QRA is being built to explain a company: the information it looks at, how an explanation is structured, and what QRA is not.",
  openGraph: {
    title: `How ${PRODUCT_NAME} explains things · ${SITE_NAME}`,
    description: SITE_DESCRIPTION,
  },
};

const LOOKS_AT = [
  {
    title: "The business",
    body: "How the company makes money, who its customers are, and what its growth depends on.",
  },
  {
    title: "The numbers",
    body: "Revenue, profits, margins, cash flow and debt — read across several years rather than a single point.",
  },
  {
    title: "Filings & disclosures",
    body: "What the company is required to tell the market: ownership, material events, related-party transactions.",
  },
  {
    title: "News & developments",
    body: "Recent developments that change the picture, and when they matter.",
  },
  {
    title: "Risks & what to watch",
    body: "What could go wrong, what the business is exposed to, and what is worth keeping an eye on.",
  },
];

const STRUCTURE = [
  ["Question", "Start from a plain question about a company, not a blank search box."],
  ["Information", "Bring the relevant statements, filings and developments together in one place."],
  ["Context", "Place each number against the company's own history, not in isolation."],
  ["Explanation", "Say what the information means in ordinary language, and show the source."],
  ["Your decision", "Stop there. The judgement about what to do is yours."],
];

const NOT = [
  {
    title: "Not a tip service",
    body: "QRA is not built to tell anyone what to buy or sell, and it does not publish recommendations.",
  },
  {
    title: "Not a prediction engine",
    body: "It does not forecast prices or promise returns. It explains the information that exists today.",
  },
  {
    title: "Not an advisor",
    body: `${PRODUCT_NAME} does not provide investment advice and does not make investment decisions for anyone.`,
  },
];

export default function ResearchPage() {
  return (
    <div className="mx-auto max-w-shell px-5 py-14 sm:px-6 sm:py-20">
      <Reveal>
        <div className="max-w-3xl">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-accent">
            How it works
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-tightest text-ink sm:text-5xl">
            How {PRODUCT_NAME} explains things
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            {PRODUCT_NAME} doesn&rsquo;t hand you an answer. It explains what a company&rsquo;s
            financial information is saying, shows where each explanation came from, and leaves the
            decision to you.
          </p>
        </div>
      </Reveal>

      <section className="mt-20">
        <Reveal>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            What it looks at
          </h2>
        </Reveal>
        <dl className="mt-8 border-t border-ink/15">
          {LOOKS_AT.map((item) => (
            <div key={item.title} className="border-b border-ink/10 py-6 sm:flex sm:gap-10">
              <dt className="font-display text-lg font-semibold tracking-tight text-ink sm:w-56 sm:shrink-0">
                {item.title}
              </dt>
              <dd className="mt-2 max-w-2xl text-base leading-relaxed text-muted sm:mt-0">
                {item.body}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-20">
        <Reveal>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            How an explanation is put together
          </h2>
          <ol className="mt-8 grid gap-8 md:grid-cols-3 lg:grid-cols-5 lg:gap-6">
            {STRUCTURE.map(([name, body], index) => (
              <li key={name} className="border-t border-ink/15 pt-5">
                <span className="font-mono text-xs text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-base font-semibold tracking-tight text-ink">
                  {name}
                </h3>
                <p className="mt-2 text-base leading-relaxed text-muted">{body}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      <section className="mt-20">
        <Reveal>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            What {PRODUCT_NAME} is not
          </h2>
          <dl className="mt-8 grid gap-10 md:grid-cols-3 md:gap-8">
            {NOT.map((item) => (
              <div key={item.title} className="border-t border-ink/15 pt-6">
                <dt className="font-display text-lg font-semibold tracking-tight text-ink">
                  {item.title}
                </dt>
                <dd className="mt-3 text-base leading-relaxed text-muted">{item.body}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      <Reveal>
        <div className="mt-20 border-t border-ink/10 pt-10">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/waitlist"
              className="inline-flex items-center justify-center rounded-md bg-accent px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-accent-700"
            >
              Join the waitlist
            </Link>
            <Link
              href="/product"
              className="inline-flex items-center justify-center rounded-md border border-ink/15 bg-white px-6 py-3.5 text-base font-semibold text-ink transition-colors hover:border-ink/30"
            >
              About the product
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
