import { db } from "@/lib/db";
import { siteConfig, siteUrl, absoluteUrl } from "@/config/site";
import { isBuildPhase } from "@/lib/build-phase";

export const revalidate = 3600;

/**
 * llms.txt — a plain-text summary of the site for language models.
 * Describes only publicly accessible educational content.
 */
async function courseSection(): Promise<string[]> {
  if (isBuildPhase) return [];
  try {
    const courses = await db.course.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
      include: {
        modules: {
          where: { published: true },
          orderBy: { order: "asc" },
          select: { title: true },
        },
      },
    });
    return courses.flatMap((c) => [
      "",
      `### ${c.title}`,
      `${c.tagline}`,
      `URL: ${absoluteUrl(`/courses/${c.slug}`)}`,
      `Modules: ${c.modules.map((m) => m.title).join(", ")}`,
    ]);
  } catch {
    return [];
  }
}

export async function GET() {
  const courseLines = await courseSection();

  const body = [
    `# ${siteConfig.name}`,
    "",
    `> ${siteConfig.description}`,
    "",
    `${siteConfig.name} is a free online learning platform. Students create an account,`,
    "choose a language, and work through ordered modules. Each module ends with an",
    "assessment; scoring at least 80% unlocks the next module.",
    "",
    "## Public pages",
    "",
    `- Home: ${siteUrl}`,
    `- All courses: ${absoluteUrl("/courses")}`,
    `- How it works: ${absoluteUrl("/how-it-works")}`,
    `- About: ${absoluteUrl("/about")}`,
    "",
    "## Courses",
    ...courseLines,
    "",
    "## Not available to crawlers or models",
    "",
    "- Student dashboards, lesson content and assessments require an account.",
    "- Admin area and internal API endpoints are private.",
    "",
    `## Contact`,
    "",
    `- ${siteConfig.organization.email}`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
