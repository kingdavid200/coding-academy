import type { MetadataRoute } from "next";

/**
 * The platform is private, so there is nothing public to list. An empty sitemap
 * is served for well-behaved crawlers that request it.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [];
}
