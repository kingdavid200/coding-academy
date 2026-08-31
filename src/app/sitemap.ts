import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";
import { db } from "@/lib/db";
import { isBuildPhase } from "@/lib/build-phase";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/courses"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/how-it-works"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/about"), changeFrequency: "yearly", priority: 0.4 },
  ];

  let courseEntries: MetadataRoute.Sitemap = [];
  if (isBuildPhase) return staticEntries;
  try {
    const courses = await db.course.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
      orderBy: { order: "asc" },
    });
    courseEntries = courses.map((c) => ({
      url: absoluteUrl(`/courses/${c.slug}`),
      lastModified: c.updatedAt,
      changeFrequency: "monthly",
      priority: 0.8,
    }));
  } catch {
    // If the database is unavailable at build time, still emit the static map.
  }

  return [...staticEntries, ...courseEntries];
}
