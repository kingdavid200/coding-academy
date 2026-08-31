/**
 * Centralised site configuration.
 *
 * The production URL comes from NEXT_PUBLIC_SITE_URL. Everything SEO-related
 * (canonical tags, sitemap, robots, Open Graph, JSON-LD) is derived from
 * `siteUrl` so a custom domain only needs to be set in one place.
 */

function readSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

export const siteUrl = readSiteUrl();

export const siteConfig = {
  name: "Coding Academy",
  shortName: "Coding Academy",
  description:
    "Learn to code with structured, hands-on courses in Java, Python and HTML. Work through ordered modules, pass each assessment at 80% to unlock the next, and track your progress.",
  url: siteUrl,
  locale: "en_GB",
  themeColor: "#2563eb",
  // Used for JSON-LD and the footer. This is an online-only learning platform,
  // not a physical business, so it is modelled as an EducationalOrganization
  // rather than a LocalBusiness.
  organization: {
    name: "Coding Academy",
    legalName: "Coding Academy",
    type: "EducationalOrganization" as const,
    email: "hello@codingacademy.example",
  },
  social: {
    // No real social accounts are claimed. Add handles here when they exist.
    twitter: "" as string,
  },
  nav: [
    { label: "Home", href: "/" },
    { label: "Courses", href: "/courses" },
    { label: "How it works", href: "/how-it-works" },
  ],
} as const;

export function absoluteUrl(path = "/"): string {
  if (!path.startsWith("/")) path = `/${path}`;
  return `${siteUrl}${path}`;
}

/** The default pass mark. The admin can override this per-deployment in Settings. */
export const DEFAULT_PASSING_SCORE = 80;
