import "server-only";
import { db } from "@/lib/db";
import { parseStringArray } from "@/lib/json-array";

export type CourseCard = {
  id: string;
  slug: string;
  title: string;
  language: string;
  tagline: string;
  description: string;
  icon: string;
  accent: string;
  outcomes: string[];
  moduleCount: number;
  lessonCount: number;
};

export async function listPublishedCourses(): Promise<CourseCard[]> {
  const courses = await db.course.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
    include: {
      modules: {
        where: { published: true },
        select: { _count: { select: { lessons: true } } },
      },
    },
  });

  return courses.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    language: c.language,
    tagline: c.tagline,
    description: c.description,
    icon: c.icon,
    accent: c.accent,
    outcomes: parseStringArray(c.outcomes),
    moduleCount: c.modules.length,
    lessonCount: c.modules.reduce((sum, m) => sum + m._count.lessons, 0),
  }));
}

export async function getPublishedCourseSlugs(): Promise<string[]> {
  const courses = await db.course.findMany({
    where: { published: true },
    select: { slug: true },
    orderBy: { order: "asc" },
  });
  return courses.map((c) => c.slug);
}

export type CourseOutline = {
  id: string;
  slug: string;
  title: string;
  language: string;
  tagline: string;
  description: string;
  icon: string;
  accent: string;
  outcomes: string[];
  modules: {
    id: string;
    slug: string;
    title: string;
    summary: string;
    order: number;
    passingScore: number;
    objectives: string[];
    lessonCount: number;
    questionCount: number;
    lessons: { slug: string; title: string; summary: string; order: number; estimatedMinutes: number }[];
  }[];
};

/** Public course structure — no per-user state. */
export async function getCourseOutline(slug: string): Promise<CourseOutline | null> {
  const course = await db.course.findFirst({
    where: { slug, published: true },
    include: {
      modules: {
        where: { published: true },
        orderBy: { order: "asc" },
        include: {
          lessons: { orderBy: { order: "asc" } },
          quiz: { include: { _count: { select: { questions: true } } } },
        },
      },
    },
  });
  if (!course) return null;

  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    language: course.language,
    tagline: course.tagline,
    description: course.description,
    icon: course.icon,
    accent: course.accent,
    outcomes: parseStringArray(course.outcomes),
    modules: course.modules.map((m) => ({
      id: m.id,
      slug: m.slug,
      title: m.title,
      summary: m.summary,
      order: m.order,
      passingScore: m.passingScore,
      objectives: parseStringArray(m.objectives),
      lessonCount: m.lessons.length,
      questionCount: m.quiz?._count.questions ?? 0,
      lessons: m.lessons.map((l) => ({
        slug: l.slug,
        title: l.title,
        summary: l.summary,
        order: l.order,
        estimatedMinutes: l.estimatedMinutes,
      })),
    })),
  };
}

export async function getCourseBySlug(slug: string) {
  return db.course.findUnique({ where: { slug } });
}
