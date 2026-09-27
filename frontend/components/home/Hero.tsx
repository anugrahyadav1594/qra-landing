import { ClarityPanel } from "@/components/ClarityPanel";
import { ImageAsset } from "@/components/ImageAsset";
import { Button } from "@/components/ui";
import { HERO } from "@/lib/content";
import { IMAGE_ALTS, IMAGE_ASSETS } from "@/lib/images";

/**
 * Hero: brand → statement → support → brand line → action, entering in
 * sequence, with the product interface arriving last.
 *
 * The hero image is atmosphere, not a picture frame: it sits behind the
 * interface, is masked into the page and is dimmed by the section's own
 * gradients, so the two read as one object.
 */
export function Hero() {
  return (
    <section id="hero" data-section="hero" className="relative overflow-hidden">
      {/* Atmospheric layer — masked, dimmed, never a rectangle */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-full opacity-[0.6] lg:w-[64%]"
      >
        <ImageAsset
          src={IMAGE_ASSETS.hero}
          alt={IMAGE_ALTS.hero}
          decorative
          priority
          sizes="(min-width: 1024px) 64vw, 100vw"
          className="h-full w-full img-mask-left"
          imageClassName="object-center"
          fallbackClassName="bg-[linear-gradient(140deg,#151E2A_0%,#111925_45%,#070A0F_100%)]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-ink-950 to-transparent" />
      </div>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid-backdrop" />

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
            style={{ "--d": "780ms" } as React.CSSProperties}
          >
            {HERO.note}
          </p>
        </div>

        {/* Product interface — arrives after the words, explains itself in place */}
        <div className="rise w-full" style={{ "--d": "620ms" } as React.CSSProperties}>
          <ClarityPanel />
        </div>
      </div>
    </section>
  );
}
