import type { Metadata } from "next";

import { ClassroomSection } from "@/components/home/ClassroomSection";
import { ExperienceSection } from "@/components/home/ExperienceSection";
import { Hero } from "@/components/home/Hero";
import { LearnersSection } from "@/components/home/LearnersSection";
import { ProblemSection } from "@/components/home/ProblemSection";
import { ResearchLabSection } from "@/components/home/ResearchLabSection";
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
 * The homepage is a pitch; the product page is the tour.
 *
 * The landing shows the product exactly once — a single confident screen plus
 * two doors — and spends the rest of its length on the argument and the ask:
 *
 *   hero         learn markets by playing through them
 *   problem      reading about markets is not practising them
 *   the loop     learn → practise → decide → reflect → level up
 *   experience   the product, once — level mode + market arena, linked
 *   research lab the company behind the chart
 *   learners     three entry points, one loop
 *   why          most platforms show you the market; we let you practise it
 *   trust        clarity over hype
 *   waitlist     the only thing we are asking for
 *
 * The level list, arena interface, scoring and leaderboard live on /product.
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
      <ExperienceSection />
      <ResearchLabSection />
      <LearnersSection />
      <WhySection />
      <TrustSection />
      <WaitlistSection />
    </>
  );
}
