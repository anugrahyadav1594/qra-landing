import type { Metadata } from "next";

import { FeedbackForm } from "@/components/FeedbackForm";
import { SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Feedback",
  description: "Tell us what's broken, what's missing, and what you love.",
};

export default function FeedbackPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <SectionHeading
        eyebrow="Feedback"
        title="Help us make it better"
        description="Every submission lands in a queue read by humans. Bugs, ideas, praise, security reports — all welcome."
      />
      <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-8">
        <FeedbackForm mode="feedback" defaultPageSlug="/feedback" />
      </div>
      <p className="mx-auto mt-8 max-w-xl text-center text-sm text-zinc-500">
        Reporting a security issue? Choose the{" "}
        <span className="text-zinc-300">Security</span> category and see our{" "}
        <a href="/security" className="underline hover:text-zinc-300">security page</a>{" "}
        for the full disclosure policy.
      </p>
    </section>
  );
}
