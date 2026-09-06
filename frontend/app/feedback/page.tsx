import type { Metadata } from "next";

import { FeedbackForm } from "@/components/FeedbackForm";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Feedback",
  description: "Tell us what's broken, what's missing, and what you love about QRA.",
};

export default function FeedbackPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <Reveal>
        <SectionHeading
          eyebrow="Feedback"
          title="Help us make it better"
          description="Every submission lands in a queue read by humans. Bugs, ideas, praise, security reports — all welcome."
        />
      </Reveal>
      <Reveal delay={120}>
        <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-8">
          <FeedbackForm mode="feedback" defaultPageSlug="/feedback" />
        </div>
      </Reveal>
      <p className="mx-auto mt-8 max-w-xl text-center text-sm text-paper-dim/50">
        Reporting a security issue? Choose the{" "}
        <span className="text-paper-dim">Security</span> category and see our{" "}
        <a href="/security" className="underline hover:text-paper-dim">security page</a>{" "}
        for the full disclosure policy.
      </p>
    </div>
  );
}
