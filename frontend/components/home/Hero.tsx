import { ClarityPanel } from "@/components/ClarityPanel";
import { Button } from "@/components/ui";
import { HERO } from "@/lib/content";

/**
 * Hero: brand → statement → support → CTA → product visual, entering in
 * sequence. The visual is a concept interface (see ClarityPanel).
 */
export function Hero() {
  return (
    <section id="hero" data-section="hero" className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid-backdrop" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-brand-500/[0.10] blur-[140px]"
      />

      <div className="relative mx-auto grid max-w-shell gap-14 px-5 pb-20 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[1.02fr_1fr] lg:items-start lg:gap-16 lg:pb-28 lg:pt-20">
        <div>
          <p className="rise micro !text-brand-400" style={{ "--d": "0ms" } as React.CSSProperties}>
            {HERO.eyebrow}
          </p>

          <h1
            className="rise mt-6 font-display text-[2.7rem] font-semibold leading-[1.02] tracking-tightest text-paper sm:text-6xl lg:text-[4.1rem]"
            style={{ "--d": "90ms" } as React.CSSProperties}
          >
            {HERO.headline.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>

          <p
            className="rise mt-6 max-w-lg text-lg leading-relaxed text-paper-dim"
            style={{ "--d": "200ms" } as React.CSSProperties}
          >
            {HERO.support}
          </p>

          <p
            className="rise mt-7 border-l border-brand-500/60 pl-4 font-display text-sm font-medium tracking-tight text-paper"
            style={{ "--d": "300ms" } as React.CSSProperties}
          >
            {HERO.tagline}
          </p>

          <div
            className="rise mt-9 flex flex-col gap-3 sm:flex-row"
            style={{ "--d": "420ms" } as React.CSSProperties}
          >
            <Button href="#waitlist" size="lg">
              {HERO.primaryCta}
            </Button>
            <Button href="#how-it-works" size="lg" variant="outline">
              {HERO.secondaryCta}
            </Button>
          </div>

          <p
            className="rise mt-7 max-w-md text-xs leading-relaxed text-paper-faint"
            style={{ "--d": "540ms" } as React.CSSProperties}
          >
            {HERO.note}
          </p>
        </div>

        <div className="rise w-full" style={{ "--d": "620ms" } as React.CSSProperties}>
          <ClarityPanel />
        </div>
      </div>
    </section>
  );
}
