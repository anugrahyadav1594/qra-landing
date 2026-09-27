import { ImageAsset } from "@/components/ImageAsset";
import { Reveal } from "@/components/Reveal";
import { Button, Section, SectionLabel } from "@/components/ui";
import { AUDIENCE } from "@/lib/content";
import { IMAGE_ALTS, IMAGE_ASSETS } from "@/lib/images";

/**
 * Who it is for, said in the visitor's own words — three named readers beside
 * a single portrait. The edges of the image are masked so it reads as part of
 * the page rather than as a photograph dropped into a grid.
 */
export function AudienceSection() {
  return (
    <Section id="for-investors" labelledBy="audience-heading">
      <Reveal>
        <SectionLabel tone="brand">{AUDIENCE.label}</SectionLabel>
        <h2
          id="audience-heading"
          className="mt-5 max-w-3xl font-display text-3xl font-semibold tracking-tightest text-paper sm:text-4xl lg:text-[2.6rem] lg:leading-[1.1]"
        >
          {AUDIENCE.statement}
        </h2>
      </Reveal>

      <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:gap-16">
        <Reveal variant="scale">
          <ImageAsset
            src={IMAGE_ASSETS.investor}
            alt={IMAGE_ALTS.investor}
            sizes="(min-width: 1024px) 400px, 100vw"
            className="aspect-[4/5] w-full rounded-xl border border-line img-mask-bottom"
            imageClassName="object-center"
            fallback={<span className="micro absolute bottom-4 left-4">QRA · concept visual</span>}
          />
        </Reveal>

        <div>
          <ol className="divide-y divide-line border-t border-line">
            {AUDIENCE.people.map((person, index) => (
              <Reveal as="li" key={person.n} delay={index * 100}>
                <figure className="flex flex-col gap-3 py-7 sm:flex-row sm:items-baseline sm:gap-8">
                  <span className="font-mono text-xs text-brand-400 sm:w-8 sm:shrink-0">
                    {person.n}
                  </span>
                  <div>
                    <figcaption className="micro !tracking-[0.18em]">{person.title}</figcaption>
                    <blockquote className="mt-3 font-display text-xl font-medium leading-snug tracking-tight text-paper sm:text-2xl">
                      “{person.quote}”
                    </blockquote>
                  </div>
                </figure>
              </Reveal>
            ))}
          </ol>

          <Reveal delay={80}>
            <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-display text-xl font-semibold tracking-tight text-paper">
                {AUDIENCE.closing}
              </p>
              <Button href="#waitlist" variant="outline">
                {AUDIENCE.cta}
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
