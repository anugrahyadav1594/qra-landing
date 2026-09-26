import type { Metadata } from "next";

import { AboutSection } from "@/components/home/AboutSection";
import { EvidenceSection } from "@/components/home/EvidenceSection";
import { ForInvestorsSection } from "@/components/home/ForInvestorsSection";
import { Hero } from "@/components/home/Hero";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { ProblemSection } from "@/components/home/ProblemSection";
import { ProductSection } from "@/components/home/ProductSection";
import { SolutionSection } from "@/components/home/SolutionSection";
import { TrustSection } from "@/components/home/TrustSection";
import { WaitlistSection } from "@/components/home/WaitlistSection";
import { WhyHardSection } from "@/components/home/WhyHardSection";
import {
  COMPANY_NAME,
  PRODUCT_NAME,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/constants";

export const metadata: Metadata = {
  title: { absolute: SITE_TITLE },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
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

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSONLD) }}
      />
      <Hero />
      <ProblemSection />
      <WhyHardSection />
      <SolutionSection />
      <HowItWorksSection />
      <ProductSection />
      <EvidenceSection />
      <ForInvestorsSection />
      <TrustSection />
      <WaitlistSection />
      <AboutSection />
    </>
  );
}
