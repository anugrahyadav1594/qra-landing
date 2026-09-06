import type { Metadata } from "next";

import { SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "About",
  description: "The story and mission behind QRA.",
};

const VALUES = [
  {
    title: "Privacy is a feature, not a checkbox",
    body: "Every product decision starts with data minimization. If we don't need it, we don't collect it — and what we keep is hashed, scoped and deletable.",
  },
  {
    title: "Boring architecture, exciting products",
    body: "Postgres, rate limits, audit logs, backups. The exciting part is what users can do — never how the plumbing works.",
  },
  {
    title: "Consent is explicit",
    body: "Joining a waitlist is not signing up for marketing. Every purpose gets its own opt-in, its own record, and its own off switch.",
  },
  {
    title: "Ship for India, build for the world",
    body: "We're an India-based team, so DPDP compliance, local pricing and mobile-first UX are table stakes — not afterthoughts.",
  },
];

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <SectionHeading
        eyebrow="About"
        title="We build products people can trust"
        description="QRA started with a simple frustration: every new product asks you to create yet another account, share yet another email, accept yet another privacy policy you'll never read."
      />
      <div className="mx-auto max-w-3xl space-y-6 text-base leading-relaxed text-zinc-300">
        <p>
          So we're building the opposite. One identity across every product we ship.
          One consent model you actually understand. One place to see, export, or delete
          everything we hold about you.
        </p>
        <p>
          Under the hood, the platform is deliberately conservative: a hardened
          authentication provider holds credentials, while the identity graph — the
          mapping of who you are across our products — lives in a database we control,
          governed by rules we can test. No microservices, no exotic infrastructure,
          no premature scaling.
        </p>
        <p>
          We're pre-launch and hiring. If any of this sounds like the kind of thing
          you want to build, <a href="/careers" className="text-brand-400 underline decoration-brand-400/40 underline-offset-2 hover:text-brand-500">come work with us</a>.
        </p>
      </div>
      <div className="mx-auto mt-16 grid max-w-4xl gap-6 sm:grid-cols-2">
        {VALUES.map((value) => (
          <div key={value.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h3 className="font-semibold text-white">{value.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">{value.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
