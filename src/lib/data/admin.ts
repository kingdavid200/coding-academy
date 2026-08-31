import "server-only";
import { db } from "@/lib/db";
import { parseStringArray } from "@/lib/json-array";
import { deriveModuleStates, courseProgressPercent } from "@/lib/progression";

export async function getAdminOverview() {
  const [studentCount, adminCount, courseCount, moduleCount, lessonCount, attemptCount, passedAttempts, enrollmentCount, completedCourses] =
    await Promise.all([
      db.user.count({ where: { role: "STUDENT" } }),
      db.user.count({ where: { role: "ADMIN" } }),
      db.course.count(),
      db.module.count(),
      db.lesson.count(),
      db.quizAttempt.count({ where: { submittedAt: { not: null } } }),
      db.quizAttempt.count({ where: { submittedAt: { not: null }, passed: true } }),
      db.enrollment.count(),
      db.enrollment.count({ where: { completedAt: { not: null } } }),
    ]);

  const recentStudents = await db.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, name: true, email: true, createdAt: true, activeCourse: { select: { title: true } } },
  });

  return {
    studentCount,
    adminCount,
    courseCount,
    moduleCount,
    lessonCount,
    attemptCount,
    passRate: attemptCount > 0 ? Math.round((passedAttempts / attemptCount) * 100) : 0,
    enrollmentCount,
    completedCourses,
    recentStudents,
  };
}

export async function listStudents() {
  const students = await db.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      lastActiveAt: true,
      activeCourse: { select: { title: true } },
      _count: { select: { enrollments: true, quizAttempts: true } },
    },
  });
  return students;
}

export async function getStudentDetail(userId: string) {
  const student = await db.user.findFirst({
    where: { id: userId, role: "STUDENT" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      lastActiveAt: true,
      activeCourseId: true,
    },
  });
  if (!student) return null;

  const enrollments = await db.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: { modules: { where: { published: true }, orderBy: { order: "asc" } } },
      },
    },
    orderBy: { course: { order: "asc" } },
  });

  const moduleIds = enrollments.flatMap((e) => e.course.modules.map((m) => m.id));
  const [moduleProgress, attempts] = await Promise.all([
    db.moduleProgress.findMany({ where: { userId, moduleId: { in: moduleIds } } }),
    db.quizAttempt.findMany({
      where: { userId, submittedAt: { not: null } },
      orderBy: { submittedAt: "desc" },
      take: 25,
      include: { quiz: { include: { module: { include: { course: true } } } } },
    }),
  ]);

  const progressByModule = new Map(moduleProgress.map((p) => [p.moduleId, p]));

  const courses = enrollments.map((enrollment) => {
    const derived = deriveModuleStates(
      enrollment.course.modules.map((m) => ({
        id: m.id,
        order: m.order,
        title: m.title,
        passingScore: m.passingScore,
      })),
      moduleProgress,
    );
    return {
      courseId: enrollment.courseId,
      courseTitle: enrollment.course.title,
      isActive: enrollment.courseId === student.activeCourseId,
      completedAt: enrollment.completedAt,
      percent: courseProgressPercent(derived),
      modules: enrollment.course.modules.map((m, index) => {
        const p = progressByModule.get(m.id);
        return {
          id: m.id,
          title: m.title,
          order: m.order,
          state: derived[index].state,
          bestScore: p?.bestScore ?? 0,
          attemptsCount: p?.attemptsCount ?? 0,
          passed: p?.passed ?? false,
          passingScore: m.passingScore,
        };
      }),
    };
  });

  return {
    student,
    courses,
    attempts: attempts.map((a) => ({
      id: a.id,
      courseTitle: a.quiz.module.course.title,
      moduleTitle: a.quiz.module.title,
      percentage: a.percentage,
      score: a.score,
      total: a.total,
      passed: a.passed,
      submittedAt: a.submittedAt,
    })),
  };
}

export async function listCoursesForAdmin() {
  const courses = await db.course.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: { select: { modules: true, enrollments: true } },
    },
  });
  return courses;
}

export async function getCourseForAdmin(courseId: string) {
  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          _count: { select: { lessons: true } },
          quiz: { include: { _count: { select: { questions: true } } } },
        },
      },
    },
  });
  if (!course) return null;
  return {
    ...course,
    outcomes: parseStringArray(course.outcomes),
  };
}

export async function getModuleForAdmin(moduleId: string) {
  const mod = await db.module.findUnique({
    where: { id: moduleId },
    include: {
      course: { select: { id: true, title: true, slug: true } },
      lessons: { orderBy: { order: "asc" } },
      quiz: {
        include: {
          questions: {
            orderBy: { order: "asc" },
            include: { options: { orderBy: { order: "asc" } } },
          },
        },
      },
    },
  });
  if (!mod) return null;
  return {
    ...mod,
    objectives: parseStringArray(mod.objectives),
    lessons: mod.lessons.map((l) => ({ ...l, objectives: parseStringArray(l.objectives) })),
  };
}

export async function getCourseStatistics() {
  const courses = await db.course.findMany({
    orderBy: { order: "asc" },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          _count: { select: { moduleProgress: true } },
        },
      },
      _count: { select: { enrollments: true } },
    },
  });

  const stats = [];
  for (const course of courses) {
    const moduleStats = [];
    for (const mod of course.modules) {
      const [completed, attempts, passedAttempts] = await Promise.all([
        db.moduleProgress.count({ where: { moduleId: mod.id, passed: true } }),
        db.quizAttempt.count({ where: { quiz: { moduleId: mod.id }, submittedAt: { not: null } } }),
        db.quizAttempt.count({
          where: { quiz: { moduleId: mod.id }, submittedAt: { not: null }, passed: true },
        }),
      ]);
      moduleStats.push({
        id: mod.id,
        title: mod.title,
        order: mod.order,
        passingScore: mod.passingScore,
        completedBy: completed,
        attempts,
        attemptPassRate: attempts > 0 ? Math.round((passedAttempts / attempts) * 100) : 0,
      });
    }
    stats.push({
      id: course.id,
      title: course.title,
      enrollments: course._count.enrollments,
      completions: await db.enrollment.count({
        where: { courseId: course.id, completedAt: { not: null } },
      }),
      modules: moduleStats,
    });
  }
  return stats;
}
