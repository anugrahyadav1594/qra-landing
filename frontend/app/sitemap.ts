import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = [
    "",
    "/about",
    "/products",
    "/team",
    "/careers",
    "/updates",
    "/contact",
    "/feedback",
    "/waitlist",
    "/privacy",
    "/terms",
    "/security",
  ];
  return staticRoutes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === "/updates" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
