import type { Metadata } from "next";

import { SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How QRA handles personal data.",
};

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <SectionHeading eyebrow="Legal" title="Privacy policy" />
      <div className="mx-auto max-w-3xl space-y-8 rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-sm leading-relaxed text-zinc-300">
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-amber-200">
          <strong>Placeholder text.</strong> Final policy language is pending legal
          counsel review before launch (ARCHITECTURE.md §16.1, open questions O1/O6).
        </div>

        <div>
          <h2 className="text-base font-semibold text-white">What we collect</h2>
          <p className="mt-2">
            On this website we collect only what forms ask for: your email address for
            the waitlist, feedback and contact messages, and application details
            (including your resume) for careers. We store IP addresses in hashed form
            for abuse prevention, never raw.
          </p>
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">Why and on what basis</h2>
          <p className="mt-2">
            Waitlist entries are used solely to contact you about the product you
            joined. Feedback is used to improve the site and products. Applications are
            used for recruitment. Every purpose requires a separate, explicit consent,
            recorded with the policy version you saw.
          </p>
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">Your choices</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Withdraw any consent at any time — it takes effect immediately.</li>
            <li>Request a copy of everything we hold about you.</li>
            <li>Request deletion — with a reversible 30-day cooling-off window.</li>
          </ul>
          <p className="mt-2">Write to grievance@company.com (placeholder) for any data request.</p>
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">Sharing</h2>
          <p className="mt-2">
            We never sell or rent personal data, and we never use it for advertising
            profiling. Processors (hosting, email delivery, analytics) are bound by
            data-processing agreements and listed in the final policy.
          </p>
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">Retention</h2>
          <p className="mt-2">
            Waitlist and feedback data: up to 24 months, then purged. Applications:
            retained for recruitment audit, anonymized on account deletion. Backups age
            out automatically.
          </p>
        </div>
      </div>
    </section>
  );
}
