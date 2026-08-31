import type { Metadata } from "next";
import { siteConfig, siteUrl, absoluteUrl } from "@/config/site";

type BuildMetadataInput = {
  title: string;
  description: string;
  /** Canonical path, e.g. "/courses/python". Omit for the home page. */
  path?: string;
  /** Accepted for call-site clarity; the whole platform is noindex regardless. */
  noindex?: boolean;
  /** Path to a page-specific OG image; falls back to the site default. */
  ogImagePath?: string;
  keywords?: string[];
};

/**
 * Single source of truth for page metadata. The platform is private, so every
 * page is `noindex`; this helper still gives each page a unique, well-formed
 * title and description.
 */
export function buildMetadata({
  title,
  description,
  path = "/",
  ogImagePath,
  keywords,
}: BuildMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const fullTitle = path === "/" ? title : `${title} | ${siteConfig.name}`;
  const ogImage = ogImagePath ? absoluteUrl(ogImagePath) : absoluteUrl("/opengraph-image");

  return {
    // `absolute` stops the parent layout's title template being appended, so
    // every page controls its own full <title> and there are no duplicates.
    title: { absolute: fullTitle },
    description,
    keywords,
    alternates: { canonical },
    robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title: fullTitle,
      description,
      url: canonical,
      locale: siteConfig.locale,
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${siteConfig.name} — ${title}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
      ...(siteConfig.social.twitter ? { site: siteConfig.social.twitter } : {}),
    },
  };
}

export const metadataBase = new URL(siteUrl);
