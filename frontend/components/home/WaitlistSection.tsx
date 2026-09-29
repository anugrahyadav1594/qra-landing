import { QRADataField } from "@/components/motion/QRADataField";
import { QRAAtmosphere } from "@/components/motion/QRAAtmosphere";
import { QRASectionTransition } from "@/components/motion/QRASectionTransition";
import { QRAReveal } from "@/components/motion/QRAReveal";
import { WaitlistForm } from "@/components/WaitlistForm";
import { Section, SectionLabel } from "@/components/ui";
import { EARLY_ACCESS } from "@/lib/content";

/**
 * Early access — the end of the story.
 *
 * Every line the site has drawn converges here and then stops: the field is
 * quiet, nothing behind the form moves, and the form itself is left alone. The
 * calm is the design; after seven sections of motion it reads as resolution.
 */
export function WaitlistSection() {
  return (
    <Section id="waitlist" labelledBy="waitlist-heading" className="relative overflow-hidden">
      <QRASectionTransition label="Convergence" />

      {/* The last environment: everything drawing toward one point. */}
      <QRAAtmosphere variant="waitlist" />

      {/* The convergence: scattered → one point, and then stillness. */}
      <QRADataField variant="converge" intensity={0.55} density={0.6} speed={0.5} className="opacity-35" />

      <div className="relative z-10 grid gap-12 lg:grid-cols-[1fr_minmax(0,520px)] lg:gap-20">
        <QRAReveal>
          <SectionLabel tone="brand">{EARLY_ACCESS.label}</SectionLabel>
          <h2
            id="waitlist-heading"
            className="mt-5 font-display text-[2.2rem] font-semibold leading-[1.06] tracking-tightest text-paper sm:text-5xl"
          >
            {EARLY_ACCESS.statement.map((line, index) => (
              <span key={line} className="block">
                {line}
                {index < EARLY_ACCESS.statement.length - 1 ? " " : null}
              </span>
            ))}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-paper-dim">{EARLY_ACCESS.support}</p>
          <ul className="mt-8 space-y-3">
            {EARLY_ACCESS.points.map((point) => (
              <li key={point} className="flex gap-3 text-sm text-paper-mute">
                <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-positive" />
                {point}
              </li>
            ))}
          </ul>
        </QRAReveal>

        <QRAReveal delay={120} variant="scale">
          <div className="card-edge rounded-xl border border-line bg-ink-850/80 p-6 shadow-panel sm:p-7">
            <WaitlistForm />
          </div>
        </QRAReveal>
      </div>
    </Section>
  );
}
