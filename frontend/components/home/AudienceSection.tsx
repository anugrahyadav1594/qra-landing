import { Reveal } from "@/components/Reveal";
import { Button, Section, SectionLabel } from "@/components/ui";
import { AUDIENCE } from "@/lib/content";

/** Who it is for, said in the visitor's own words. */
export function AudienceSection() {
  return (
    <Section id="for-investors" labelledBy="audience-heading">
      <Reveal>
        <SectionLabel tone="brand">{AUDIENCE.label}</SectionLabel>
        <h2
          id="audience-heading"
          className="mt-5 font-display text-3xl font-semibold tracking-tightest text-paper sm:text-4xl"
        >
          {AUDIENCE.statement}
        </h2>
      </Reveal>

      <ul className="mt-14 grid gap-8 md:grid-cols-3 md:gap-10">
        {AUDIENCE.quotes.map((quote, index) => (
          <Reveal as="li" key={quote} delay={index * 100}>
            <figure className="border-t border-line pt-6">
              <blockquote className="font-display text-lg font-medium leading-snug tracking-tight text-paper">
                “{quote}”
              </blockquote>
            </figure>
          </Reveal>
        ))}
      </ul>

      <Reveal delay={80}>
        <div className="mt-14 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-xl font-semibold tracking-tight text-paper">
            {AUDIENCE.closing}
          </p>
          <Button href="#waitlist" variant="outline">
            {AUDIENCE.cta}
          </Button>
        </div>
      </Reveal>
    </Section>
  );
}
