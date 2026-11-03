import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/tournament/ui";
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

export function TournamentTimeline({ config }: { config: TournamentConfig }) {
  const steps = buildSteps(config);

  return (
    <section id="competition" className="relative scroll-mt-20 border-t border-white/8 bg-arena-900 py-20 sm:py-28">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHeader
            index="01"
            eyebrow="How the tournament works"
            title={
              <>
                Individual entries.
                <br />
                College-level qualifiers.
              </>
            }
            description="Participation is individual — you compete under your own name while representing your college. The steps below are the confirmed structure; anything the organisers have not published yet is marked as to be announced."
          />
        </Reveal>

        <Reveal delay={100}>
          <ol className="relative mt-14 space-y-px">
            {steps.map((step, index) => (
              <li key={step.title} className="timeline-node relative">
                <div className="group grid gap-4 border-t border-white/8 py-6 sm:grid-cols-[4.5rem_1fr_auto] sm:items-start sm:gap-8">
                  <span className="font-mono text-xs tracking-[0.24em] text-flare-500/80">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-semibold tracking-tight text-bone sm:text-2xl">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ash">{step.detail}</p>
                  </div>
                  <span
                    className={`mt-1 inline-flex h-fit items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] ${
                      step.state === "confirmed"
                        ? "border-flare-500/40 bg-flare-500/8 text-flare-300"
                        : "border-white/10 bg-white/4 text-ash"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        step.state === "confirmed" ? "bg-flare-500" : "bg-ash/50"
                      }`}
                    />
                    {step.state === "confirmed" ? "Confirmed" : "To be announced"}
                  </span>
                </div>
              </li>
            ))}
            <li className="border-t border-white/8" />
          </ol>
        </Reveal>

        <Reveal delay={140}>
          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 border-l-2 border-flare-500/50 pl-5">
            <p className="max-w-2xl text-sm leading-relaxed text-ash">
              Trading involves risk. The tournament is an educational competition run by{" "}
              {config.organizer}; it is not investment advice and does not involve real client
              capital.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
