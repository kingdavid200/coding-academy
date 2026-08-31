import type { MetadataRoute } from "next";
import { absoluteUrl, siteUrl } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private application areas — never indexed.
        disallow: ["/admin", "/api/", "/dashboard", "/account", "/learn/", "/login", "/signup"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteUrl,
  };
}
