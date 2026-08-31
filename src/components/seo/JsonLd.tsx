import { siteConfig, siteUrl, absoluteUrl } from "@/config/site";

/** Renders a JSON-LD script tag. Data is serialised safely (no closing-tag break-out). */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": siteConfig.organization.type,
    name: siteConfig.organization.name,
    legalName: siteConfig.organization.legalName,
    url: siteUrl,
    email: siteConfig.organization.email,
    description: siteConfig.description,
    logo: absoluteUrl("/icon.svg"),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteUrl,
    description: siteConfig.description,
  };
}

export function courseSchema(course: {
  title: string;
  description: string;
  slug: string;
  language: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `${course.title} for Beginners`,
    description: course.description,
    url: absoluteUrl(`/courses/${course.slug}`),
    inLanguage: "en",
    teaches: `${course.language} programming`,
    provider: {
      "@type": siteConfig.organization.type,
      name: siteConfig.organization.name,
      url: siteUrl,
    },
    isAccessibleForFree: true,
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: "PT4H",
    },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
