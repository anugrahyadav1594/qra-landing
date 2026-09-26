import { Reveal } from "@/components/Reveal";
import { WaitlistForm } from "@/components/WaitlistForm";
import { Section } from "@/components/ui";

export function WaitlistSection() {
  return (
    <Section id="waitlist" labelledBy="waitlist-heading">
      <Reveal>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-accent">
              Early access
            </p>
            <h2
              id="waitlist-heading"
              className="mt-4 font-display text-3xl font-semibold leading-[1.12] tracking-tightest text-ink sm:text-[2.5rem]"
            >
              Be among the first to experience a simpler way to understand investing.
            </h2>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
              We&rsquo;re building QRA now. Join the waitlist and we&rsquo;ll let you know when early
              access opens.
            </p>
            <ul className="mt-8 space-y-3 text-base text-muted">
              {[
                "Waitlist updates only — no marketing unless you ask for it.",
                "One email per person; duplicates are ignored.",
                "You can ask us to remove your details at any time.",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden="true" className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-positive" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-ink/10 bg-white p-6 shadow-card sm:p-8">
            <WaitlistForm />
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
