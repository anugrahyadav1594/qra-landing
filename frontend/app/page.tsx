import type { Metadata } from "next";

import { AudienceSection } from "@/components/home/AudienceSection";
import { Hero } from "@/components/home/Hero";
import { IdeaSection } from "@/components/home/IdeaSection";
import { ProblemSection } from "@/components/home/ProblemSection";
import { ProductSection } from "@/components/home/ProductSection";
import { TrustSection } from "@/components/home/TrustSection";
import { WaitlistSection } from "@/components/home/WaitlistSection";
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
 * The homepage is deliberately short: problem → idea → product → trust → CTA.
 * Each section answers one question and says the important thing once.
 */
export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSONLD) }}
      />
      <Hero />
      <ProblemSection />
      <IdeaSection />
      <ProductSection />
      <AudienceSection />
      <TrustSection />
      <WaitlistSection />
    </>
  );
}
