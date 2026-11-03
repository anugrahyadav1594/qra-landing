import { Reveal } from "@/components/Reveal";
import { StageGlyph } from "@/components/tournament/motifs";
import {
  CoordNote,
  SectionIntro,
  StatusTag,
  TechLabel,
} from "@/components/tournament/primitives";
import type { TournamentConfig } from "@/lib/tournament";

type Step = {
  title: string;
  detail: string;
  state: "confirmed" | "pending";
};

/**
 * How the tournament works.
 *
 * Only the seven confirmed structural facts are stated. Everything the
 * organisers have not yet fixed — scoring, capital, round lengths, quotas,
 * dates — is labelled "to be announced" instead of being invented.
 */
export function buildSteps(config: TournamentConfig): Step[] {
  return [
    {
      title: "Register individually",
      detail:
        "Every participant registers in their own name. There is no team creation and no team management — one entry, one participant.",
      state: "confirmed",
    },
    {
      title: "Select your onboarded college",
      detail:
        "You choose your institution from our onboarded college list. Free-text college names are not accepted, so every entry is attributable to a real campus.",
      state: "confirmed",
    },
    {
      title: "Entries are grouped by college",
      detail:
        "Registrations are grouped against the college you selected, which is how the qualifying rounds are organised.",
      state: "confirmed",
    },
    {
      title: "College-level qualifying rounds",
      detail: config.qualifying_round_info || "Detailed qualifying-round guidelines will be announced soon.",
      state: "pending",
    },
    {
      title: "Progression to the final rounds",
      detail:
        config.final_round_info ||
        "The progression criteria for the final competition will be published with the tournament rules.",
      state: "pending",
    },
    {
      title: "The final competition",
      detail:
        config.competition_format ||
        "The final competition format will be announced by the organisers.",
      state: "pending",
    },
    {
      title: "Winners and prizes",
      detail: `Prizes are awarded for the announced pool: champion, runners-up, merit winners and participant goodies. No new categories are added without an announcement.`,
      state: "confirmed",
    },
  ];
}

/**
 * SECTION A — Tournament Journey.
 *
 * A competition progression system rather than a list: a continuous rail
 * runs through the seven stages, each with its own index, marker glyph and
 * status. Confirmed stages read solid and warm; unannounced stages stay
 * outlined and dashed so the distinction is obvious before a word is read.
 */
export function TournamentTimeline({ config }: { config: TournamentConfig }) {
  const steps = buildSteps(config);
  const confirmed = steps.filter((step) => step.state === "confirmed").length;

  return (
    <section
      id="competition"
      className="mtt-section mtt-grid scroll-mt-20 overflow-hidden bg-arena-900"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-1/3 h-96 w-96 opacity-60"
        style={{
          background:
            "radial-gradient(circle, rgba(255,121,47,0.08), transparent 68%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-8">
              <SectionIntro
                index="01"
                eyebrow="How the tournament works"
                title={
                  <>
                    Individual entries.
                    <br />
                    College-level qualifiers.
                  </>
                }
                description="Participation is individual — you compete under your own name while representing your college. The path below is the confirmed structure; anything the organisers have not published yet is marked as to be announced."
              />
            </div>

            {/* Progression meter — how much of the structure is locked */}
            <div className="lg:col-span-4 lg:pt-2">
              <div className="border-t border-white/10 pt-5">
                <div className="flex items-baseline justify-between gap-4">
                  <TechLabel>Structure status</TechLabel>
                  <span className="mtt-figure font-display text-2xl font-semibold text-bone">
                    {String(confirmed).padStart(2, "0")}
                    <span className="text-muted">/{String(steps.length).padStart(2, "0")}</span>
                  </span>
                </div>
                <div className="mt-4 flex gap-1" aria-hidden="true">
                  {steps.map((step, index) => (
                    <span
                      key={index}
                      className={`h-1.5 flex-1 ${
                        step.state === "confirmed"
                          ? "bg-gradient-to-r from-flare-600 to-flare-300"
                          : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-4 font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] text-muted">
                  Stages confirmed · remaining stages to be announced
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="mtt-tag mtt-tag-confirmed">
                    <span className="mtt-dot" />
                    Confirmed
                  </span>
                  <span className="mtt-tag mtt-tag-pending">
                    <span className="mtt-dot mtt-dot-hollow" />
                    To be announced
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── The journey ────────────────────────────────────────────── */}
        <Reveal>
          <ol className="mtt-stagger mt-14">
            {steps.map((step, index) => {
              const isLast = index === steps.length - 1;
              const confirmedStep = step.state === "confirmed";
              return (
                <li
                  key={step.title}
                  className={`mtt-journey-row grid grid-cols-[2.5rem_1fr] gap-x-3 border-t border-white/[0.07] sm:grid-cols-[3.5rem_1fr] sm:gap-x-6 lg:grid-cols-[4rem_1fr_3.5rem] lg:gap-x-8 ${
                    isLast ? "border-b border-white/[0.07]" : ""
                  }`}
                >
                  {/* Rail: node + connecting line to the next stage */}
                  <div className="relative flex justify-center py-7">
                    {!isLast && (
                      <span
                        aria-hidden="true"
                        className={`absolute left-1/2 top-[3.1rem] -bottom-px w-px -translate-x-1/2 ${
                          confirmedStep
                            ? "bg-gradient-to-b from-flare-500/45 to-white/10"
                            : "bg-white/8"
                        }`}
                      />
                    )}
                    <span
                      aria-hidden="true"
                      className={`mtt-node relative mt-1.5 grid h-3.5 w-3.5 rotate-45 place-items-center border ${
                        confirmedStep
                          ? "border-flare-300 bg-flare-500 shadow-[0_0_14px_-2px_rgba(255,121,47,0.8)]"
                          : "border-dashed border-white/25 bg-arena-900"
                      }`}
                    />
                  </div>

                  {/* Stage content */}
                  <div className="py-6 sm:py-7">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <span
                        className={`mtt-figure font-display text-2xl font-semibold sm:text-3xl ${
                          confirmedStep ? "text-bone/90" : "mtt-figure-outline"
                        }`}
                        aria-hidden="true"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="h-px w-6 bg-white/12" aria-hidden="true" />
                      <StatusTag state={confirmedStep ? "confirmed" : "pending"}>
                        {confirmedStep ? "Confirmed" : "To be announced"}
                      </StatusTag>
                    </div>

                    <h3 className="mt-4 max-w-2xl font-display text-lg font-semibold leading-snug tracking-tight text-bone sm:text-xl lg:text-[1.375rem]">
                      {step.title}
                    </h3>
                    <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-ash">
                      {step.detail}
                    </p>
                  </div>

                  {/* Stage mark */}
                  <div className="hidden py-7 lg:block">
                    <StageGlyph
                      index={index}
                      className={`ml-auto h-10 w-10 ${
                        confirmedStep ? "text-flare-500/80" : "text-white/25"
                      }`}
                    />
                  </div>
                </li>
              );
            })}
          </ol>
        </Reveal>

        {/* ── Footnote ───────────────────────────────────────────────── */}
        <Reveal>
          <div className="mt-10 flex flex-col gap-4 border-t border-white/[0.07] pt-6 sm:flex-row sm:items-start sm:gap-8">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-flare-500/60" aria-hidden="true" />
              <TechLabel>Note</TechLabel>
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-ash">
              Trading involves risk. The tournament is an educational competition run by{" "}
              {config.organizer}; it is not investment advice and does not involve real client
              capital.
            </p>
            <CoordNote className="sm:ml-auto sm:pt-1">MTT / Journey 01—07</CoordNote>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
