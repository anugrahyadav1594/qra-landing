import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = [
    "",
    "/product",
    "/research",
    "/about",
    "/careers",
    "/contact",
    "/feedback",
    "/waitlist",
    "/tournament",
    "/tournament/register",
    "/tournament/rules",
    "/tournament/faq",
    "/tournament/leaderboard",
    "/privacy",
    "/terms",
    "/security",
  ];
  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: route.startsWith("/tournament") ? ("weekly" as const) : ("monthly" as const),
    priority: route === "" ? 1 : route.startsWith("/tournament") ? 0.9 : 0.7,
  }));
}
