import type { Metadata } from "next";

import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "Terms that govern the use of the Quantrelic Analytics website.",
};

const SECTIONS = [
  ["Using this website", "The website and its products are provided as-is and pre-launch. Joining a waitlist does not guarantee access to any product; access is granted in cohorts, in waitlist order. QRA is a research tool — it does not provide investment advice."],
  ["Your content", "Feedback, contact messages and applications are submitted voluntarily. You grant us a limited license to use them for the purpose they were submitted for (support, product improvement, recruitment)."],
  ["Acceptable use", "Do not abuse the forms: no automated submissions, no scraping, no attempts to bypass rate limits or bot checks. We rate-limit and screen submissions and may block abusive traffic."],
  ["Service changes", "We may change, pause or discontinue the website or any product at any time. Pre-launch details — product names, features, timelines — are indicative and may change."],
  ["Liability", "To the maximum extent permitted by law, the website is provided without warranties, and our liability is limited to the fullest extent applicable law allows."],
  ["Governing law", "These terms are governed by the laws of India. Disputes are subject to the jurisdiction of the courts of [City] — placeholder until the legal entity is finalized."],
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <Reveal>
        <SectionHeading eyebrow="Legal" title="Terms of service" />
        <div className="mx-auto max-w-3xl space-y-6 rounded-3xl border border-white/5 bg-ink-900/60 p-8 text-sm leading-relaxed text-paper-dim/85">
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-amber-200">
            <strong>Placeholder text.</strong> Final terms are pending legal counsel
            review before launch (ARCHITECTURE.md §16.1).
          </div>
          {SECTIONS.map(([title, body]) => (
            <div key={title}>
              <h2 className="text-base font-semibold text-paper">{title}</h2>
              <p className="mt-2">{body}</p>
            </div>
          ))}
          <p className="text-paper-dim/50">
            Last updated: {new Date().toISOString().slice(0, 10)}
          </p>
        </div>
      </Reveal>
    </div>
  );
}
