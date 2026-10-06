import type { Metadata } from "next";

import { ArenaSection } from "@/components/home/ArenaSection";
import { ClassroomSection } from "@/components/home/ClassroomSection";
import { Hero } from "@/components/home/Hero";
import { LearnersSection } from "@/components/home/LearnersSection";
import { LeaderboardSection } from "@/components/home/LeaderboardSection";
import { LevelModeSection } from "@/components/home/LevelModeSection";
import { ProblemSection } from "@/components/home/ProblemSection";
import { ResearchLabSection } from "@/components/home/ResearchLabSection";
import { ScoreSection } from "@/components/home/ScoreSection";
import { TrustSection } from "@/components/home/TrustSection";
import { WaitlistSection } from "@/components/home/WaitlistSection";
import { WhySection } from "@/components/home/WhySection";
import { QRASkillTicker } from "@/components/motion/QRASkillTicker";
import {
  COMPANY_NAME,
  PRODUCT_NAME,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/constants";
import { socialMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: SITE_TITLE },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  ...socialMetadata({ title: SITE_TITLE, description: SITE_DESCRIPTION }),
};

/** Truthful Organization JSON-LD — identity, url, logo, description only. */
const ORGANIZATION_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  legalName: COMPANY_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/image.png`,
  description: SITE_DESCRIPTION,
  brand: { "@type": "Brand", name: PRODUCT_NAME },
};

/**
 * The homepage, in the order the argument has to be made.
 *
 *   hero         learn markets by playing through them
 *   problem      reading about markets is not practising them
 *   the loop     learn → practise → decide → reflect → level up
 *   level mode   one market skill at a time
 *   arena        then decide on a historical market, future hidden
 *   score        measured on the decision, not the luck
 *   leaderboard  where that leaves you
 *   research lab the company behind the chart
 *   learners     three entry points, one loop
 *   why          most platforms show you the market; we let you practise it
 *   trust        clarity over hype
 *   waitlist     the only thing we are asking for
 *
 * Each section answers one question and says the important thing once. Nothing
 * here is a feature list — every part exists to make the next one legible.
 */
export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSONLD) }}
      />
      <Hero />
      <QRASkillTicker />
      <ProblemSection />
      <ClassroomSection />
      <LevelModeSection />
      <ArenaSection />
      <ScoreSection />
      <LeaderboardSection />
      <ResearchLabSection />
      <LearnersSection />
      <WhySection />
      <TrustSection />
      <WaitlistSection />
    </>
  );
}
