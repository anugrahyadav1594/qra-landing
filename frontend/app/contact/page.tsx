import type { Metadata } from "next";
import Link from "next/link";

import { FeedbackForm } from "@/components/FeedbackForm";
import { SectionLabel } from "@/components/ui";
import {
  COMPANY_NAME,
  CONTACT_GENERAL_EMAIL,
  SECURITY_CONTACT_EMAIL,
  SITE_NAME,
} from "@/lib/constants";
import { CONTACT_COPY } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Quantrelic Analytics — product questions, working with us, careers, or anything else. Use the form and we'll get back to you.",
  openGraph: {
    title: `Contact · ${SITE_NAME}`,
    description:
      "Product questions, working with us, or something else — use the form and we'll get back to you.",
  },
};

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-contact px-5 pb-20 pt-14 sm:px-6 sm:pt-20">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,35fr)_minmax(0,65fr)] lg:gap-16">
        {/* Left — the human side */}
        <div>
          <SectionLabel tone="brand">{CONTACT_COPY.eyebrow}</SectionLabel>
          <h1 className="mt-5 font-display text-[2.2rem] font-semibold leading-[1.06] tracking-tightest text-paper sm:text-5xl">
            {CONTACT_COPY.headline}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-paper-dim">{CONTACT_COPY.support}</p>

          <ul className="mt-8 space-y-3">
            {CONTACT_COPY.points.map((point) => (
              <li key={point} className="flex gap-3 text-sm text-paper-mute">
                <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-400" />
                {point}
              </li>
            ))}
          </ul>

          <p className="mt-8 border-t border-line pt-6 text-sm leading-relaxed text-paper-mute">
            {CONTACT_COPY.formNote}
          </p>

          {(CONTACT_GENERAL_EMAIL || SECURITY_CONTACT_EMAIL) && (
            <dl className="mt-6 space-y-4 text-sm">
              {CONTACT_GENERAL_EMAIL && (
                <div>
                  <dt className="micro !tracking-[0.16em]">General enquiries</dt>
                  <dd className="mt-1 text-paper">
                    <a
                      href={`mailto:${CONTACT_GENERAL_EMAIL}`}
                      className="break-words hover:text-brand-300"
                    >
                      {CONTACT_GENERAL_EMAIL}
                    </a>
                  </dd>
                </div>
              )}
              {SECURITY_CONTACT_EMAIL && (
                <div>
                  <dt className="micro !tracking-[0.16em]">Security reports</dt>
                  <dd className="mt-1 text-paper">
                    <a
                      href={`mailto:${SECURITY_CONTACT_EMAIL}`}
                      className="break-words hover:text-brand-300"
                    >
                      {SECURITY_CONTACT_EMAIL}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          )}

          <ul className="mt-8 space-y-2 border-t border-line pt-6 text-sm">
            {[
              { href: "/feedback", label: "Send feedback on this site or the product" },
              { href: "/security", label: "Responsible disclosure policy" },
              { href: "/careers", label: "Open roles" },
            ].map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-paper-dim hover:text-brand-300">
                  {link.label} →
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Right — the form, wide enough to actually use */}
        <div className="rounded-xl border border-line bg-ink-850/80 p-6 shadow-panel sm:p-8">
          <h2 className="font-display text-xl font-semibold tracking-tight text-paper">
            Send us a message
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-paper-mute">
            Name, email and topic help us route it to the right person at {COMPANY_NAME}.
          </p>
          <div className="mt-6">
            <FeedbackForm mode="contact" defaultPageSlug="/contact" />
          </div>
        </div>
      </div>
    </div>
  );
}
