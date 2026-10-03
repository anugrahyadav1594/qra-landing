import { ClarityPanel } from "@/components/ClarityPanel";
import { QRAAtmosphere } from "@/components/motion/QRAAtmosphere";
import { TextReveal } from "@/components/motion/TextReveal";
import { Button } from "@/components/ui";
import { HERO } from "@/lib/content";

/**
 * Hero.
 *
 * The composition is unchanged — the statement on the left, the product
 * interface on the right — but the atmosphere is no longer a picture: it is the
 * data field itself, slowly drifting, with a second field beside the interface
 * performing the site's signature transformation once as the page settles.
 *
 * The product interface is the focal point; everything behind it stays under
 * 10% opacity so the eye lands on the numbers.
 */
export function Hero() {
  return (
    <section id="hero" data-section="hero" className="relative overflow-hidden">
      {/* The layer stack, in order: the environment image, its dark wash (both
          inside QRAAtmosphere), a very faint grid, the information field, then
          the content. Each layer is quieter than the one above it. */}
      <QRAAtmosphere variant="hero" />

      {/* A fine grid at 3.5% — structure you feel rather than see. */}
      <div aria-hidden="true" className="grid-backdrop pointer-events-none absolute inset-0" />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_20%_30%,rgba(63,111,255,0.07),transparent_70%)]"
      />

      <div className="relative z-10 mx-auto grid max-w-shell gap-14 px-5 pb-20 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[1.02fr_1fr] lg:items-start lg:gap-16 lg:pb-28 lg:pt-20">
        <div>
          <p className="rise micro !text-brand-400" style={{ "--d": "0ms" } as React.CSSProperties}>
            {HERO.eyebrow}
          </p>

          <h1 className="mt-6 font-display text-[2.7rem] font-semibold leading-[1.02] tracking-tightest text-paper sm:text-6xl lg:text-[4.1rem]">
            {HERO.headline.map((line, index) => (
              <span key={line} className="block">
                <TextReveal text={line} step={70} delay={140 + index * 130} />
                {index < HERO.headline.length - 1 ? " " : null}
              </span>
            ))}
          </h1>

          <p
            className="rise mt-6 max-w-lg text-lg leading-relaxed text-paper-dim"
            style={{ "--d": "620ms" } as React.CSSProperties}
          >
            {HERO.support}
          </p>

          <p
            className="rise mt-7 border-l border-brand-500/60 pl-4 font-display text-sm font-medium tracking-tight text-paper"
            style={{ "--d": "720ms" } as React.CSSProperties}
          >
            {HERO.tagline}
          </p>

          <div
            className="rise mt-9 flex flex-col gap-3 sm:flex-row"
            style={{ "--d": "840ms" } as React.CSSProperties}
          >
            <Button href="#waitlist" size="lg" className="btn-lift">
              {HERO.primaryCta}
            </Button>
            <Button href="#how-it-works" size="lg" variant="outline" className="btn-lift">
              {HERO.secondaryCta}
              <span aria-hidden="true" className="btn-arrow">
                →
              </span>
            </Button>
          </div>

          <p
            className="rise mt-7 max-w-md text-xs leading-relaxed text-paper-faint"
            style={{ "--d": "960ms" } as React.CSSProperties}
          >
            {HERO.note}
          </p>
        </div>

        {/* The product interface. It now sits directly on the environment
            rather than on a second animation, so the panel is unambiguously the
            brightest, sharpest thing on the screen. */}
        <div className="rise relative w-full" style={{ "--d": "700ms" } as React.CSSProperties}>
          <ClarityPanel />
        </div>
      </div>
    </section>
  );
}
