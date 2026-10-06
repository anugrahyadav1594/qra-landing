import type { Metadata } from "next";

import { ArenaSection } from "@/components/home/ArenaSection";
import { LeaderboardSection } from "@/components/home/LeaderboardSection";
import { LevelModeSection } from "@/components/home/LevelModeSection";
import { ScoreSection } from "@/components/home/ScoreSection";
import { WaitlistSection } from "@/components/home/WaitlistSection";
import { Button, SectionLabel } from "@/components/ui";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { socialMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  title: "The Experience",
  description:
    "Level mode, the market arena, scoring and the leaderboard — the full QRA " +
    "market-learning experience, in detail.",
  alternates: { canonical: "/product" },
  ...socialMetadata({
    title: `The Experience · ${SITE_NAME}`,
    description: "Level mode, the market arena, scoring and the leaderboard.",
    url: `${SITE_URL}/product`,
  }),
};

/**
 * THE EXPERIENCE, IN FULL.
 *
 * The landing page shows the product once and links here; this page is the
 * tour. It is simply the four product sections in the order a player meets
 * them — learn a level, enter the arena, get scored, see where you stand —
 * each with its own environment and interface, exactly as they were built.
 *
 * Static and backend-independent: the product is pre-launch, so the tour never
 * waits on the API.
 */
export default function ProductPage() {
  return (
    <main>
      {/* A short page header so the tour has a door, then straight into it. */}
      <div className="relative overflow-hidden border-b border-line">
        <div className="relative z-10 mx-auto max-w-shell px-5 pb-14 pt-16 sm:px-6 sm:pt-20">
          <SectionLabel tone="brand">The experience</SectionLabel>
          <h1 className="mt-5 font-display text-[2.5rem] font-semibold leading-[1.03] tracking-tightest text-paper sm:text-5xl lg:text-6xl">
            The market is the syllabus.
            <br />
            The decisions are yours.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-paper-dim">
            Four connected surfaces. One loop. Learn a skill, practise it on a
            historical market, get scored on the decision, and see where that
            leaves you.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/waitlist" size="lg" className="btn-lift">
              Get early access
            </Button>
            <Button href="/product#level-mode" size="lg" variant="outline" className="btn-lift">
              Start at level one
              <span aria-hidden="true" className="btn-arrow">
                →
              </span>
            </Button>
          </div>
        </div>
      </div>

      <LevelModeSection />
      <ArenaSection />
      <ScoreSection />
      <LeaderboardSection />
      <WaitlistSection />
    </main>
  );
}
