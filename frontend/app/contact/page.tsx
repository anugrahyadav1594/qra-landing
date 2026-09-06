import type { Metadata } from "next";

import { FeedbackForm } from "@/components/FeedbackForm";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Quantrelic Analytics team.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <Reveal>
        <SectionHeading
          eyebrow="Contact"
          title="Talk to us"
          description="Product questions, partnerships, careers, or just saying hi — we reply to everything."
        />
      </Reveal>
      <div className="mx-auto grid max-w-4xl gap-10 lg:grid-cols-5">
        <Reveal delay={100}>
          <div className="h-full rounded-3xl border border-white/5 bg-ink-900/60 p-8 lg:col-span-2">
            <h2 className="text-lg font-semibold text-paper">Direct channels</h2>
            <dl className="mt-6 space-y-5 text-sm">
              <div>
                <dt className="text-paper-dim/50">General</dt>
                <dd className="mt-1 font-medium text-paper">hello@company.com</dd>
              </div>
              <div>
                <dt className="text-paper-dim/50">Security (see /security)</dt>
                <dd className="mt-1 font-medium text-paper">security@company.com</dd>
              </div>
              <div>
                <dt className="text-paper-dim/50">Grievance officer</dt>
                <dd className="mt-1 font-medium text-paper">grievance@company.com</dd>
              </div>
            </dl>
            <p className="mt-8 text-xs leading-relaxed text-paper-dim/40">
              Email addresses above are placeholders pending the company's final domain
              configuration (ARCHITECTURE.md §24, open question O1).
            </p>
          </div>
        </Reveal>
        <Reveal delay={180}>
          <div className="h-full rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-8 lg:col-span-3">
            <FeedbackForm mode="contact" defaultPageSlug="/contact" />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
