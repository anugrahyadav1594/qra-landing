import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/constants";

/** Allow public pages; disallow account/admin and the API surface (§18.9). */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/account/", "/admin/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
