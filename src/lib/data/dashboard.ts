import "server-only";
import { db } from "@/lib/db";
import { deriveModuleStates, courseProgressPercent } from "@/lib/progression";

export type EnrollmentSummary = {
  courseSlug: string;
  courseTitle: string;
  accent: string;
  language: string;
  percent: number;
  completedModules: number;
  totalModules: number;
  completed: boolean;
  isActive: boolean;
};

export async function listEnrollmentSummaries(
  userId: string,
  activeCourseId: string | null,
): Promise<EnrollmentSummary[]> {
  const enrollments = await db.enrollment.findMany({
    where: { userId, course: { published: true } },
    include: {
      course: {
        include: { modules: { where: { published: true }, orderBy: { order: "asc" } } },
      },
    },
    orderBy: { course: { order: "asc" } },
  });

  const allModuleIds = enrollments.flatMap((e) => e.course.modules.map((m) => m.id));
  const progress = await db.moduleProgress.findMany({
    where: { userId, moduleId: { in: allModuleIds } },
  });

  return enrollments.map((enrollment) => {
    const derived = deriveModuleStates(
      enrollment.course.modules.map((m) => ({
        id: m.id,
        order: m.order,
        title: m.title,
        passingScore: m.passingScore,
      })),
      progress,
    );
    const completedModules = derived.filter((d) => d.state === "COMPLETED").length;
    return {
      courseSlug: enrollment.course.slug,
      courseTitle: enrollment.course.title,
      accent: enrollment.course.accent,
      language: enrollment.course.language,
      percent: courseProgressPercent(derived),
      completedModules,
      totalModules: enrollment.course.modules.length,
      completed: Boolean(enrollment.completedAt),
      isActive: enrollment.courseId === activeCourseId,
    };
  });
}
