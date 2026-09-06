import type { Metadata } from "next";

import { FeedbackForm } from "@/components/FeedbackForm";
import { SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the QRA team.",
};

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <SectionHeading
        eyebrow="Contact"
        title="Talk to us"
        description="Sales, partnerships, careers questions, or just saying hi — we reply to everything."
      />
      <div className="mx-auto grid max-w-4xl gap-10 lg:grid-cols-5">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 lg:col-span-2">
          <h2 className="text-lg font-semibold text-white">Direct channels</h2>
          <dl className="mt-6 space-y-5 text-sm">
            <div>
              <dt className="text-zinc-500">General</dt>
              <dd className="mt-1 font-medium text-zinc-200">hello@company.com</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Security (see /security)</dt>
              <dd className="mt-1 font-medium text-zinc-200">security@company.com</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Grievance officer</dt>
              <dd className="mt-1 font-medium text-zinc-200">grievance@company.com</dd>
            </div>
          </dl>
          <p className="mt-8 text-xs leading-relaxed text-zinc-600">
            Email addresses above are placeholders pending the company's final
            domain configuration (ARCHITECTURE.md §24, open question O1).
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-8 lg:col-span-3">
          <FeedbackForm mode="contact" defaultPageSlug="/contact" />
        </div>
      </div>
    </section>
  );
}
