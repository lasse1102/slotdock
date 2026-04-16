import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://slotdock.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/impressum", "/datenschutz", "/login", "/signup"],
        disallow: ["/dashboard", "/docks", "/bookings", "/settings", "/api", "/book"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
