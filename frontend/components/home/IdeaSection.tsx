import { ImageAsset } from "@/components/ImageAsset";
import { Reveal } from "@/components/Reveal";
import { Button, Section, SectionLabel, SectionStatement } from "@/components/ui";
import { IDEA } from "@/lib/content";
import { IMAGE_ALTS, IMAGE_ASSETS } from "@/lib/images";

/**
 * The idea in three moves. One process line runs across the three steps and
 * draws itself as each one arrives — evidence that this is a single process,
 * not three features.
 */
export function IdeaSection() {
  return (
    <Section id="how-it-works" labelledBy="idea-heading" className="overflow-hidden">
      {/* Clarity, as atmosphere: the section where the picture settles */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[70%] opacity-[0.5]">
        <ImageAsset
          src={IMAGE_ASSETS.clarity}
          alt={IMAGE_ALTS.clarity}
          decorative
          sizes="100vw"
          className="h-full w-full img-mask-bottom"
          imageClassName="object-center"
          fallbackClassName="bg-[linear-gradient(150deg,#111925_0%,#0D131D_55%,#070A0F_100%)]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/70 via-ink-950/80 to-ink-950" />
      </div>

      <div className="relative">
        <Reveal>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <SectionLabel tone="brand">{IDEA.label}</SectionLabel>
              <SectionStatement id="idea-heading" lines={IDEA.statement} as="h2" className="mt-5" />
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-paper-mute lg:text-right">
              Three moves. No jargon, no dashboards to learn.
            </p>
          </div>
        </Reveal>

        <ol className="mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
          {IDEA.steps.map((step, index) => (
            <Reveal as="li" key={step.n} delay={index * 140}>
              <div className="relative border-t border-line pt-7">
                {/* The process line, drawing itself as the step arrives */}
                <span aria-hidden="true" className="absolute -top-px left-0 h-px w-full overflow-hidden">
                  <span
                    className="draw-line block h-px w-full bg-brand-500/70"
                    style={{ "--dd": `${index * 140 + 240}ms` } as React.CSSProperties}
                  />
                </span>
                <span
                  aria-hidden="true"
                  className="station absolute -top-[3.5px] left-0 h-[7px] w-[7px] rounded-full bg-ink-700 ring-2 ring-ink-950"
                  style={{ "--dd": `${index * 140 + 240}ms` } as React.CSSProperties}
                />

                <span className="font-mono text-xs text-brand-400">{step.n}</span>
                <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight text-paper">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-xs text-base leading-relaxed text-paper-dim">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>

        <Reveal delay={80}>
          <div className="mt-16 flex flex-col gap-6 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-display text-xl font-semibold tracking-tight text-paper sm:text-2xl">
              {IDEA.closing}
            </p>
            <Button href="/research" variant="outline">
              See the full process
            </Button>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
