import type { Metadata } from "next";

import { AboutSection } from "@/components/home/AboutSection";
import { DifferenceSection } from "@/components/home/DifferenceSection";
import { EvidenceSection } from "@/components/home/EvidenceSection";
import { Hero } from "@/components/home/Hero";
import { PipelineSection } from "@/components/home/PipelineSection";
import { ProblemSection } from "@/components/home/ProblemSection";
import { ShowcaseSection } from "@/components/home/ShowcaseSection";
import { SignalStrip } from "@/components/home/SignalStrip";
import { WaitlistSection } from "@/components/home/WaitlistSection";
import { YouDecideSection } from "@/components/home/YouDecideSection";
import {
  COMPANY_NAME,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/constants";

const DEFAULT_TITLE = `${SITE_NAME} — QRA: AI-Powered Financial Research`;

export const metadata: Metadata = {
  title: { absolute: DEFAULT_TITLE },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    title: DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
  },
};

/** Truthful Organization JSON-LD — name, url, logo, description only. */
const ORGANIZATION_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: COMPANY_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/image.png`,
  description: SITE_DESCRIPTION,
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSONLD) }}
      />
      <Hero />
      <SignalStrip />
      <ProblemSection />
      <DifferenceSection />
      <PipelineSection />
      <ShowcaseSection />
      <EvidenceSection />
      <YouDecideSection />
      <WaitlistSection />
      <AboutSection />
    </>
  );
}
