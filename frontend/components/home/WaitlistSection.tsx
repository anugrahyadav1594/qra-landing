import { Reveal } from "@/components/Reveal";
import { WaitlistForm } from "@/components/WaitlistForm";
import { Eyebrow } from "@/components/ui";

export function WaitlistSection() {
  return (
    <section id="waitlist" className="relative mx-auto max-w-6xl scroll-mt-24 overflow-hidden px-6 py-24">
      <div
        className="absolute right-[-15%] top-[-30%] h-[380px] w-[380px] rounded-full bg-signal-600/10 blur-[120px] motion-safe:block"
        aria-hidden="true"
      />
      <div className="relative grid gap-14 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <Eyebrow>Early access</Eyebrow>
          <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-tightest text-paper sm:text-5xl">
            Your next
            <br />
            <span className="bg-gradient-to-r from-signal-300 to-aqua-300 bg-clip-text text-transparent">
              research
            </span>
            <br />
            starts here.
          </h2>
          <p className="mt-7 max-w-md text-base leading-relaxed text-paper-dim/75">
            We're building a new way to research companies — one that helps investors move from
            scattered information to a clearer investment thesis. Early access opens in cohorts,
            in waitlist order.
          </p>
        </Reveal>

        <Reveal delay={140}>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-7 sm:p-9">
            <WaitlistForm />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
