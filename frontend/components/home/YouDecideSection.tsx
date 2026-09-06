import { Reveal } from "@/components/Reveal";
import { Eyebrow } from "@/components/ui";

export function YouDecideSection() {
  return (
    <section className="border-y border-white/5 bg-ink-900/40">
      <div className="mx-auto max-w-4xl px-6 py-24 text-center">
        <Reveal>
          <Eyebrow className="mb-6">A principle, not a disclaimer</Eyebrow>
          <h2 className="font-display text-4xl font-semibold leading-[1.08] tracking-tightest text-paper sm:text-6xl">
            QRA investigates.
            <br />
            <span className="text-aqua-300">You decide.</span>
          </h2>
          <p className="mx-auto mt-8 max-w-md text-sm leading-relaxed text-paper-dim/50">
            QRA does not provide investment advice and does not make investment decisions for you.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
