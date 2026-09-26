import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/Reveal";
import { COMPANY_NAME, PRODUCT_NAME, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description:
    "Quantrelic Analytics Private Limited is building technology that makes financial information easier to understand and investing simpler for everyday investors.",
  openGraph: {
    title: "About · Quantrelic Analytics",
    description:
      "Quantrelic Analytics Private Limited is building technology that makes financial information easier to understand.",
  },
};

const PRINCIPLES = [
  {
    title: "Clarity before complexity",
    body: "If a sentence needs a finance degree to read, it needs rewriting. Plain-language explanations come first; the numbers are always there underneath.",
  },
  {
    title: "We explain. You decide.",
    body: `${PRODUCT_NAME} is being built to explain financial information — never to tell you what to buy or sell. The decision always stays with the investor.`,
  },
  {
    title: "Evidence over opinion",
    body: "An explanation is only useful if you can see where it came from. Statements are designed to trace back to the document behind them — an annual report, a result, a filing.",
  },
  {
    title: "Consent is explicit",
    body: "Joining the waitlist is not signing up for marketing. Every purpose gets its own opt-in, its own record and its own off switch.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-shell px-5 py-14 sm:px-6 sm:py-20">
      <Reveal>
        <div className="max-w-3xl">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-accent">About</p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-tightest text-ink sm:text-5xl">
            {SITE_NAME}
          </h1>
        </div>

        <div className="mt-8 max-w-3xl space-y-6 text-lg leading-relaxed text-muted">
          <p className="text-ink-800">
            {COMPANY_NAME} is building technology to make financial information easier to understand
            and investing simpler for everyday investors.
          </p>
          <p>We believe access to investing should come with access to understanding.</p>
          <p className="text-base">
            {PRODUCT_NAME} is our product, and it is in early development. Most people who invest
            aren&rsquo;t financial professionals: the reports are written for analysts, the numbers
            are spread across documents, and it can be hard to tell which part actually matters.
            We&rsquo;re building for that gap — explaining the information behind an investment in
            language anyone can follow, with the source behind every explanation.
          </p>
          <p className="text-base">
            We&rsquo;re a small, remote-first team based in India, building in the open. If that
            sounds like work you&rsquo;d like to do,{" "}
            <Link
              href="/careers"
              className="text-accent underline decoration-accent/40 underline-offset-2 hover:text-accent-700"
            >
              see our open roles
            </Link>
            .
          </p>
        </div>
      </Reveal>

      <Reveal>
        <ul className="mt-16 grid gap-10 border-t border-ink/10 pt-12 md:grid-cols-2 md:gap-x-16 md:gap-y-12">
          {PRINCIPLES.map((principle) => (
            <li key={principle.title}>
              <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
                {principle.title}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-muted">{principle.body}</p>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal>
        <div className="mt-16 border-t border-ink/10 pt-10">
          <p className="max-w-2xl text-base leading-relaxed text-muted">
            {PRODUCT_NAME} does not provide investment advice, does not recommend what to buy or
            sell, and does not make decisions for anyone. It explains — you decide.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/waitlist"
              className="inline-flex items-center justify-center rounded-md bg-accent px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-accent-700"
            >
              Join the waitlist
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-md border border-ink/15 bg-white px-6 py-3.5 text-base font-semibold text-ink transition-colors hover:border-ink/30"
            >
              Contact us
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
