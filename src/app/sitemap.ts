import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://slotdock.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${siteUrl}/`, lastModified: now, priority: 1.0 },
    { url: `${siteUrl}/login`, lastModified: now, priority: 0.5 },
    { url: `${siteUrl}/signup`, lastModified: now, priority: 0.8 },
    { url: `${siteUrl}/impressum`, lastModified: now, priority: 0.3 },
    { url: `${siteUrl}/datenschutz`, lastModified: now, priority: 0.3 },
  ];
}
