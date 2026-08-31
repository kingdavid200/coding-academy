import "server-only";
import { db } from "@/lib/db";
import { parseStringArray } from "@/lib/json-array";
import {
  courseProgressPercent,
  currentModuleId,
  deriveModuleStates,
  type DerivedModule,
  type ModuleState,
} from "@/lib/progression";

/** Create the enrollment row if the student is not already enrolled. */
export async function ensureEnrollment(userId: string, courseId: string) {
  return db.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: { lastActiveAt: new Date() },
    create: { userId, courseId },
  });
}

type CourseWithGraph = NonNullable<Awaited<ReturnType<typeof loadCourseGraph>>>;

async function loadCourseGraph(courseSlug: string) {
  return db.course.findFirst({
    where: { slug: courseSlug, published: true },
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
}

export type LearningModule = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  order: number;
  passingScore: number;
  objectives: string[];
  lessonCount: number;
  completedLessonCount: number;
  questionCount: number;
  state: ModuleState;
  bestScore: number;
  attemptsCount: number;
  passed: boolean;
  lockReason?: string;
};

export type LearningView = {
  course: {
    id: string;
    slug: string;
    title: string;
    language: string;
    tagline: string;
    accent: string;
    icon: string;
  };
  modules: LearningModule[];
  overallPercent: number;
  completedModules: number;
  totalModules: number;
  currentModuleSlug: string | null;
  courseCompleted: boolean;
  recentAttempts: {
    id: string;
    moduleTitle: string;
    moduleSlug: string;
    percentage: number;
    passed: boolean;
    submittedAt: Date | null;
  }[];
};

function buildModules(
  graph: CourseWithGraph,
  moduleProgress: { moduleId: string; bestScore: number; attemptsCount: number; passed: boolean; startedAt: Date | null }[],
  completedLessonIds: Set<string>,
): { modules: LearningModule[]; derived: DerivedModule[] } {
  const derived = deriveModuleStates(
    graph.modules.map((m) => ({
      id: m.id,
      order: m.order,
      title: m.title,
      passingScore: m.passingScore,
    })),
    moduleProgress,
  );
  const derivedById = new Map(derived.map((d) => [d.moduleId, d]));

  const modules: LearningModule[] = graph.modules.map((m) => {
    const d = derivedById.get(m.id)!;
    const completedLessonCount = m.lessons.filter((l) => completedLessonIds.has(l.id)).length;
    return {
      id: m.id,
      slug: m.slug,
      title: m.title,
      summary: m.summary,
      order: m.order,
      passingScore: m.passingScore,
      objectives: parseStringArray(m.objectives),
      lessonCount: m.lessons.length,
      completedLessonCount,
      questionCount: m.quiz?._count.questions ?? 0,
      state: d.state,
      bestScore: d.bestScore,
      attemptsCount: d.attemptsCount,
      passed: d.passed,
      lockReason: d.lockReason,
    };
  });

  return { modules, derived };
}

export async function getLearningView(
  userId: string,
  courseSlug: string,
): Promise<LearningView | null> {
  const graph = await loadCourseGraph(courseSlug);
  if (!graph) return null;

  const moduleIds = graph.modules.map((m) => m.id);
  const lessonIds = graph.modules.flatMap((m) => m.lessons.map((l) => l.id));
  const quizIds = graph.modules.map((m) => m.quiz?.id).filter((id): id is string => Boolean(id));

  const [moduleProgress, lessonProgress, recent] = await Promise.all([
    db.moduleProgress.findMany({ where: { userId, moduleId: { in: moduleIds } } }),
    db.lessonProgress.findMany({
      where: { userId, lessonId: { in: lessonIds } },
      select: { lessonId: true },
    }),
    quizIds.length
      ? db.quizAttempt.findMany({
          where: { userId, quizId: { in: quizIds }, submittedAt: { not: null } },
          orderBy: { submittedAt: "desc" },
          take: 5,
          include: { quiz: { include: { module: true } } },
        })
      : Promise.resolve([]),
  ]);

  const completedLessonIds = new Set(lessonProgress.map((lp) => lp.lessonId));
  const { modules, derived } = buildModules(graph, moduleProgress, completedLessonIds);

  const completedModules = derived.filter((d) => d.state === "COMPLETED").length;
  const currentId = currentModuleId(derived);
  const currentModuleSlug = graph.modules.find((m) => m.id === currentId)?.slug ?? null;
  const courseCompleted = modules.length > 0 && completedModules === modules.length;

  return {
    course: {
      id: graph.id,
      slug: graph.slug,
      title: graph.title,
      language: graph.language,
      tagline: graph.tagline,
      accent: graph.accent,
      icon: graph.icon,
    },
    modules,
    overallPercent: courseProgressPercent(derived),
    completedModules,
    totalModules: modules.length,
    currentModuleSlug,
    courseCompleted,
    recentAttempts: recent.map((a) => ({
      id: a.id,
      moduleTitle: a.quiz.module.title,
      moduleSlug: a.quiz.module.slug,
      percentage: a.percentage,
      passed: a.passed,
      submittedAt: a.submittedAt,
    })),
  };
}

export type ModuleView = {
  course: { slug: string; title: string; language: string; accent: string };
  module: {
    id: string;
    slug: string;
    title: string;
    summary: string;
    order: number;
    passingScore: number;
    objectives: string[];
    state: ModuleState;
    lockReason?: string;
    bestScore: number;
    attemptsCount: number;
    passed: boolean;
  };
  lessons: {
    slug: string;
    title: string;
    summary: string;
    order: number;
    estimatedMinutes: number;
    completed: boolean;
  }[];
  quiz: { exists: boolean; questionCount: number } | null;
  nextModuleSlug: string | null;
  prevModuleSlug: string | null;
};

export async function getModuleView(
  userId: string,
  courseSlug: string,
  moduleSlug: string,
): Promise<ModuleView | null> {
  const graph = await loadCourseGraph(courseSlug);
  if (!graph) return null;
  const target = graph.modules.find((m) => m.slug === moduleSlug);
  if (!target) return null;

  const moduleIds = graph.modules.map((m) => m.id);
  const [moduleProgress, lessonProgress] = await Promise.all([
    db.moduleProgress.findMany({ where: { userId, moduleId: { in: moduleIds } } }),
    db.lessonProgress.findMany({
      where: { userId, lessonId: { in: target.lessons.map((l) => l.id) } },
      select: { lessonId: true },
    }),
  ]);
  const completedLessonIds = new Set(lessonProgress.map((lp) => lp.lessonId));
  const { derived } = buildModules(graph, moduleProgress, completedLessonIds);
  const d = derived.find((x) => x.moduleId === target.id)!;

  const idx = graph.modules.findIndex((m) => m.id === target.id);

  return {
    course: {
      slug: graph.slug,
      title: graph.title,
      language: graph.language,
      accent: graph.accent,
    },
    module: {
      id: target.id,
      slug: target.slug,
      title: target.title,
      summary: target.summary,
      order: target.order,
      passingScore: target.passingScore,
      objectives: parseStringArray(target.objectives),
      state: d.state,
      lockReason: d.lockReason,
      bestScore: d.bestScore,
      attemptsCount: d.attemptsCount,
      passed: d.passed,
    },
    lessons: target.lessons.map((l) => ({
      slug: l.slug,
      title: l.title,
      summary: l.summary,
      order: l.order,
      estimatedMinutes: l.estimatedMinutes,
      completed: completedLessonIds.has(l.id),
    })),
    quiz: target.quiz
      ? { exists: true, questionCount: target.quiz._count.questions }
      : { exists: false, questionCount: 0 },
    nextModuleSlug: graph.modules[idx + 1]?.slug ?? null,
    prevModuleSlug: graph.modules[idx - 1]?.slug ?? null,
  };
}

export type LessonView = {
  course: { slug: string; title: string; language: string; accent: string };
  module: { slug: string; title: string; state: ModuleState; lockReason?: string };
  lesson: {
    id: string;
    slug: string;
    title: string;
    summary: string;
    objectives: string[];
    content: string;
    estimatedMinutes: number;
    order: number;
    completed: boolean;
  };
  prevLessonSlug: string | null;
  nextLessonSlug: string | null;
  /** When there is no next lesson, point students at the assessment. */
  quizIsNext: boolean;
};

export async function getLessonView(
  userId: string,
  courseSlug: string,
  moduleSlug: string,
  lessonSlug: string,
): Promise<LessonView | null> {
  const graph = await loadCourseGraph(courseSlug);
  if (!graph) return null;
  const mod = graph.modules.find((m) => m.slug === moduleSlug);
  if (!mod) return null;
  const lesson = mod.lessons.find((l) => l.slug === lessonSlug);
  if (!lesson) return null;

  const moduleIds = graph.modules.map((m) => m.id);
  const [moduleProgress, lessonDone] = await Promise.all([
    db.moduleProgress.findMany({ where: { userId, moduleId: { in: moduleIds } } }),
    db.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId: lesson.id } },
    }),
  ]);
  const { derived } = buildModules(graph, moduleProgress, new Set());
  const d = derived.find((x) => x.moduleId === mod.id)!;

  const lessonIdx = mod.lessons.findIndex((l) => l.id === lesson.id);

  return {
    course: {
      slug: graph.slug,
      title: graph.title,
      language: graph.language,
      accent: graph.accent,
    },
    module: { slug: mod.slug, title: mod.title, state: d.state, lockReason: d.lockReason },
    lesson: {
      id: lesson.id,
      slug: lesson.slug,
      title: lesson.title,
      summary: lesson.summary,
      objectives: parseStringArray(lesson.objectives),
      content: lesson.content,
      estimatedMinutes: lesson.estimatedMinutes,
      order: lesson.order,
      completed: Boolean(lessonDone),
    },
    prevLessonSlug: mod.lessons[lessonIdx - 1]?.slug ?? null,
    nextLessonSlug: mod.lessons[lessonIdx + 1]?.slug ?? null,
    quizIsNext: lessonIdx === mod.lessons.length - 1 && Boolean(mod.quiz),
  };
}

/** Marks a lesson complete after verifying the student can access its module. */
export async function markLessonComplete(userId: string, lessonId: string) {
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { course: true } } },
  });
  if (!lesson || !lesson.module.published || !lesson.module.course.published) {
    return { ok: false as const, reason: "not_found" as const };
  }

  const access = await getModuleAccessById(userId, lesson.moduleId);
  if (!access.allowed) return { ok: false as const, reason: "locked" as const };

  await db.$transaction([
    db.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: {},
      create: { userId, lessonId },
    }),
    db.moduleProgress.upsert({
      where: { userId_moduleId: { userId, moduleId: lesson.moduleId } },
      update: { lastActiveAt: new Date(), startedAt: access.progress?.startedAt ?? new Date() },
      create: {
        userId,
        moduleId: lesson.moduleId,
        state: "IN_PROGRESS",
        startedAt: new Date(),
      },
    }),
    db.enrollment.upsert({
      where: { userId_courseId: { userId, courseId: lesson.module.courseId } },
      update: { lastActiveAt: new Date() },
      create: { userId, courseId: lesson.module.courseId },
    }),
    db.user.update({ where: { id: userId }, data: { lastActiveAt: new Date() } }),
  ]);

  return { ok: true as const };
}

export type ModuleAccess = {
  allowed: boolean;
  state: ModuleState;
  reason?: string;
  progress?: { startedAt: Date | null } | null;
};

/**
 * Server-authoritative access check for a module by id. Used by every route
 * that serves lesson or quiz content so URL guessing cannot skip the sequence.
 */
export async function getModuleAccessById(
  userId: string,
  moduleId: string,
): Promise<ModuleAccess> {
  const mod = await db.module.findUnique({
    where: { id: moduleId },
    include: { course: { include: { modules: { where: { published: true }, orderBy: { order: "asc" } } } } },
  });
  if (!mod || !mod.published || !mod.course.published) {
    return { allowed: false, state: "LOCKED", reason: "not_found" };
  }

  const moduleIds = mod.course.modules.map((m) => m.id);
  const moduleProgress = await db.moduleProgress.findMany({
    where: { userId, moduleId: { in: moduleIds } },
  });
  const derived = deriveModuleStates(
    mod.course.modules.map((m) => ({
      id: m.id,
      order: m.order,
      title: m.title,
      passingScore: m.passingScore,
    })),
    moduleProgress,
  );
  const d = derived.find((x) => x.moduleId === moduleId)!;
  const progress = moduleProgress.find((p) => p.moduleId === moduleId) ?? null;

  return {
    allowed: d.state !== "LOCKED",
    state: d.state,
    reason: d.lockReason,
    progress: progress ? { startedAt: progress.startedAt } : null,
  };
}
