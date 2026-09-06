import type { Metadata } from "next";

import { Reveal } from "@/components/Reveal";
import { WaitlistForm } from "@/components/WaitlistForm";
import { SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Join the waitlist",
  description:
    "Get early access to QRA — the Quantrelic Research Agent. Early access opens in cohorts, in waitlist order.",
};

export default function WaitlistPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <Reveal>
        <SectionHeading
          eyebrow="Early access"
          title="Get early access to QRA."
          description="One email per person. Duplicates are ignored, your position is fixed at join time, and opting out takes one click."
        />
      </Reveal>
      <Reveal delay={120}>
        <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-8 sm:p-10">
          <WaitlistForm />
        </div>
      </Reveal>
      <p className="mx-auto mt-8 max-w-xl text-center text-xs text-paper-dim/40">
        QRA does not provide investment advice. QRA investigates. You decide.
      </p>
    </div>
  );
}
