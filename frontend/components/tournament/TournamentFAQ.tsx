"use client";

import { useState } from "react";

import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/tournament/ui";
import { formatINR, type TournamentConfig } from "@/lib/tournament";

type Faq = { question: string; answer: string };

/**
 * Answers stay inside the confirmed facts: individual participation, college
 * selection from the onboarded list, the ₹1,00,000 pool and the fact that no
 * fee, date, venue or scoring system has been announced yet.
 */
export function faqItems(config: TournamentConfig): Faq[] {
  return [
    {
      question: "Who can participate?",
      answer:
        config.eligibility ??
        "The tournament is designed for college students in Mumbai. The final eligibility criteria are published by the organisers — check the event details section for the current wording.",
    },
    {
      question: "Do I register as a team or as an individual?",
      answer:
        "Individually. There is no team creation, no team invitations and no team management. Each participant registers in their own name and selects the college they will represent.",
    },
    {
      question: "Which colleges can I select?",
      answer:
        "Only colleges that the organisers have already onboarded. The dropdown in the registration form is driven directly by that list, so free-text college names are not accepted and every entry is attributable to a real campus.",
    },
    {
      question: "What if my college is not on the list yet?",
      answer:
        "College onboarding is handled by the organisers. If your institution is missing, write to us through the contact page and we will route the request to the onboarding team.",
    },
    {
      question: "Is there a registration fee?",
      answer:
        "No registration fee has been announced, and the registration form never asks for payment. Should a fee ever be introduced it would be announced officially before it applies to anyone.",
    },
    {
      question: "How does the qualifying round work?",
      answer:
        config.qualifying_round_info ??
        "Detailed qualifying-round guidelines will be announced soon. The confirmed structure is that registrations are grouped by college and college-level qualifying rounds are conducted.",
    },
    {
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
      question: "When and where is the tournament?",
      answer:
        config.event_starts_at && config.venue
          ? `The tournament is scheduled for ${config.event_starts_at} at ${config.venue}.`
          : "The date and venue have not been announced yet. They are published here and in the participant dashboard as soon as the organisers confirm them.",
    },
    {
      question: "Does registering guarantee me a slot?",
      answer:
        "No. Registration records your entry and, depending on the configured review process, it is then reviewed by the organisers. Your dashboard always shows the current status of your own entry.",
    },
  ];
}

export function TournamentFAQ({ config }: { config: TournamentConfig }) {
  const items = faqItems(config);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative scroll-mt-20 border-t border-white/8 bg-arena-900 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHeader
            index="06"
            eyebrow="Frequently asked questions"
            title={
              <>
                Before you
                <br />
                enter the arena.
              </>
            }
          />
        </Reveal>

        <Reveal delay={80}>
          <ul className="mx-auto mt-12 max-w-3xl border-t border-white/8">
            {items.map((item, index) => {
              const open = openIndex === index;
              return (
                <li key={item.question} className="border-b border-white/8">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(open ? null : index)}
                    aria-expanded={open}
                    className="arena-focus flex w-full items-start justify-between gap-6 py-5 text-left"
                  >
                    <span className="font-display text-base font-medium text-bone sm:text-lg">
                      {item.question}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`mt-1 shrink-0 font-mono text-lg text-flare-500 transition-transform ${
                        open ? "rotate-45" : ""
                      }`}
                    >
                      +
                    </span>
                  </button>
                  {open && (
                    <p className="pb-6 pr-10 text-sm leading-relaxed text-ash">{item.answer}</p>
                  )}
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
