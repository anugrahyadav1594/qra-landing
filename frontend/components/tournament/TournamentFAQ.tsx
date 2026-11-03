"use client";

import { useState, type ReactNode } from "react";

import { Reveal } from "@/components/Reveal";
import { ArenaSchematic, TickRule } from "@/components/tournament/motifs";
import { CoordNote, SectionIntro, TechLabel } from "@/components/tournament/primitives";
import { formatINR, type TournamentConfig } from "@/lib/tournament";

type Faq = { question: string; answer: string; category: Category };

type Category =
  | "Registration"
  | "Participation"
  | "Colleges"
  | "Competition"
  | "Prizes"
  | "Event information";

const CATEGORY_ORDER: Category[] = [
  "Registration",
  "Participation",
  "Colleges",
  "Competition",
  "Prizes",
  "Event information",
];

/**
 * SECTION F — Editorial FAQ.
 *
 * Two columns on wide screens: the section identity on the left (index,
 * eyebrow, heading, copy and an arena schematic) and the grouped accordion
 * on the right. The layout prop lets the dedicated /tournament/faq route
 * keep a single column inside its narrower container.
 *
 * Answers stay inside the confirmed facts: individual participation, college
 * selection from the onboarded list, the ₹1,00,000 pool and the fact that no
 * fee, date, venue or scoring system has been announced yet.
 */
export function faqItems(config: TournamentConfig): Faq[] {
  return [
    {
      category: "Registration",
      question: "Do I register as a team or as an individual?",
      answer:
        "Individually. There is no team creation, no team invitations and no team management. Each participant registers in their own name and selects the college they will represent.",
    },
    {
      category: "Registration",
      question: "Is there a registration fee?",
      answer:
        "No registration fee has been announced, and the registration form never asks for payment. Should a fee ever be introduced it would be announced officially before it applies to anyone.",
    },
    {
      category: "Registration",
      question: "Does registering guarantee me a slot?",
      answer:
        "No. Registration records your entry and, depending on the configured review process, it is then reviewed by the organisers. Your dashboard always shows the current status of your own entry.",
    },
    {
      category: "Participation",
      question: "Who can participate?",
      answer:
        config.eligibility ??
        "The tournament is designed for college students in Mumbai. The final eligibility criteria are published by the organisers — check the event details section for the current wording.",
    },
    {
      category: "Colleges",
      question: "Which colleges can I select?",
      answer:
        "Only colleges that the organisers have already onboarded. The dropdown in the registration form is driven directly by that list, so free-text college names are not accepted and every entry is attributable to a real campus.",
    },
    {
      category: "Colleges",
      question: "What if my college is not on the list yet?",
      answer:
        "College onboarding is handled by the organisers. If your institution is missing, write to us through the contact page and we will route the request to the onboarding team.",
    },
    {
      category: "Competition",
      question: "How does the qualifying round work?",
      answer:
        config.qualifying_round_info ??
        "Detailed qualifying-round guidelines will be announced soon. The confirmed structure is that registrations are grouped by college and college-level qualifying rounds are conducted.",
    },
    {
      category: "Prizes",
      question: "What is the prize pool?",
      answer: `₹${formatINR(config.prize_pool_total).replace("₹", "")} in total — ${formatINR(
        config.cash_prize_pool,
      )} in cash prizes (champion ${formatINR(config.champion_prize)}, first runner-up ${formatINR(
        config.first_runner_up_prize,
      )}, second runner-up ${formatINR(config.second_runner_up_prize)}, and ${
        config.merit_prize_count
      } merit prizes of ${formatINR(config.merit_prize_amount)} each) plus ${formatINR(
        config.goodies_and_merchandise,
      )} of goodies and merchandise.`,
    },
    {
      category: "Event information",
      question: "When and where is the tournament?",
      answer:
        config.event_starts_at && config.venue
          ? `The tournament is scheduled for ${config.event_starts_at} at ${config.venue}.`
          : "The date and venue have not been announced yet. They are published here and in the participant dashboard as soon as the organisers confirm them.",
    },
  ];
}

export function TournamentFAQ({
  config,
  layout = "split",
  footerAction,
}: {
  config: TournamentConfig;
  layout?: "split" | "stacked";
  footerAction?: ReactNode;
}) {
  const items = faqItems(config);
  const [openId, setOpenId] = useState<string | null>(items[0]?.question ?? null);
  const split = layout === "split";

  const groups = CATEGORY_ORDER.map((category) => ({
    category,
    items: items.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0);

  return (
    <section
      id="faq"
      className="mtt-section mtt-grid scroll-mt-20 overflow-hidden bg-arena-900"
    >
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div
          className={`grid gap-10 ${split ? "lg:grid-cols-12 lg:gap-14" : ""}`}
        >
          {/* ── Left: section identity ───────────────────────────────── */}
          <div className={split ? "lg:col-span-5" : ""}>
            <Reveal>
              <div className={split ? "lg:sticky lg:top-24" : ""}>
                <SectionIntro
                  index="06"
                  eyebrow="Frequently asked questions"
                  title={
                    <>
                      Before you
                      <br />
                      enter the arena.
                    </>
                  }
                  description="Entries, colleges, prizes and the parts of the tournament that are still being confirmed. If something is not answered here, the organisers can be reached through the contact page."
                  titleClassName="text-[2rem] sm:text-[2.4rem] lg:text-[2.7rem]"
                />

                <div className="relative mt-10 hidden sm:block">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-70"
                    style={{
                      background:
                        "radial-gradient(ellipse at 30% 40%, rgba(255,121,47,0.10), transparent 70%)",
                    }}
                  />
                  <ArenaSchematic className="relative h-52 w-52 text-flare-500/60" />
                  <div className="mt-4 flex items-center gap-3">
                    <TickRule className="text-white/20" ticks={10} />
                    <CoordNote className="whitespace-nowrap">MTT / FAQ</CoordNote>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* ── Right: grouped accordion ─────────────────────────────── */}
          <div className={split ? "lg:col-span-7" : ""}>
            <Reveal>
              <div className="mt-2 space-y-10">
                {groups.map((group) => (
                  <div key={group.category}>
                    <div className="flex items-center gap-4">
                      <TechLabel className="text-ash">{group.category}</TechLabel>
                      <span className="h-px flex-1 bg-white/[0.09]" />
                      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted">
                        {String(group.items.length).padStart(2, "0")}
                      </span>
                    </div>

                    <ul className="mt-2 border-t border-white/[0.08]">
                      {group.items.map((item) => {
                        const open = openId === item.question;
                        const panelId = `faq-panel-${slug(item.question)}`;
                        return (
                          <li key={item.question} className="border-b border-white/[0.08]">
                            <h3>
                              <button
                                type="button"
                                id={`${panelId}-trigger`}
                                aria-expanded={open}
                                aria-controls={panelId}
                                onClick={() => setOpenId(open ? null : item.question)}
                                className="arena-focus group flex w-full items-start justify-between gap-6 py-5 text-left transition-colors duration-200 hover:text-flare-200"
                              >
                                <span
                                  className={`font-display text-base font-medium leading-snug transition-colors duration-200 sm:text-[1.0625rem] ${
                                    open ? "text-flare-200" : "text-bone group-hover:text-flare-100"
                                  }`}
                                >
                                  {item.question}
                                </span>
                                <span
                                  aria-hidden="true"
                                  className={`relative mt-1 grid h-6 w-6 shrink-0 place-items-center border transition-colors duration-200 ${
                                    open
                                      ? "border-flare-500/70 text-flare-300"
                                      : "border-white/15 text-ash group-hover:border-flare-500/50"
                                  }`}
                                >
                                  <span className="absolute h-px w-3 bg-current" />
                                  <span
                                    className={`absolute h-3 w-px bg-current transition-transform duration-300 ${
                                      open ? "scale-y-0" : "scale-y-100"
                                    }`}
                                  />
                                </span>
                              </button>
                            </h3>
                            <div
                              id={panelId}
                              role="region"
                              aria-labelledby={`${panelId}-trigger`}
                              data-open={open}
                              className="mtt-accordion-panel"
                            >
                              <div>
                                <p className="max-w-2xl pb-6 pr-8 text-sm leading-relaxed text-ash">
                                  {item.answer}
                                </p>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}

                {footerAction ? (
                  <div className="mt-8 border-t border-white/[0.08] pt-6">{footerAction}</div>
                ) : null}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}
