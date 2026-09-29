/**
 * Shared social-preview metadata.
 *
 * Next merges page metadata over the layout's, and replaces nested objects
 * (openGraph, twitter) wholesale — so any page that declares its own
 * `openGraph` silently loses the image declared in the layout. Each page
 * therefore spreads these in, which keeps one definition of the preview card.
 */

import type { Metadata } from "next";

import { SITE_NAME, SITE_URL } from "@/lib/constants";

/**
 * The brand mark is the only permanent image the site ships, so it is also the
 * preview card. The generated photography is no longer referenced anywhere.
 */
const SOCIAL_IMAGE = {
  url: "/image.png",
  width: 1774,
  height: 887,
  alt: `${SITE_NAME} logo`,
};

type SocialCopy = { title: string; description: string; url?: string };

/**
 * The preview card for a page. Spread the result into that page's metadata —
 * spreading it is what keeps the image; overriding `openGraph` would drop it.
 */
export function socialMetadata({ title, description, url = SITE_URL }: SocialCopy): Metadata {
  return {
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_IN",
      url,
      title,
      description,
      images: [SOCIAL_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: SOCIAL_IMAGE.url, alt: SOCIAL_IMAGE.alt }],
    },
  };
}
