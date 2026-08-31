import "server-only";
import { db } from "@/lib/db";
import { HttpError } from "@/lib/http";
import { computePercentage, didPass } from "@/lib/progression";
import { getModuleAccessById } from "@/lib/data/learning";
import type { QuizForTaking, GradedResult } from "@/lib/quiz-types";

export type { QuizForTaking, GradedResult };

/**
 * Opens a fresh attempt for a module's quiz. Verifies the student may access
 * the module first. Correct answers are never included in the payload.
 */
export async function startAttempt(
  userId: string,
  courseSlug: string,
  moduleSlug: string,
): Promise<QuizForTaking> {
  const mod = await db.module.findFirst({
    where: { slug: moduleSlug, published: true, course: { slug: courseSlug, published: true } },
    include: {
      course: true,
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

  if (!mod || !mod.quiz || mod.quiz.questions.length === 0) {
    throw new HttpError(404, "not_found", "This module does not have an assessment yet.");
  }

  const access = await getModuleAccessById(userId, mod.id);
  if (!access.allowed) {
    throw new HttpError(
      403,
      "module_locked",
      access.reason ?? "This module is locked. Complete the previous module first.",
    );
  }

  const attempt = await db.$transaction(async (tx) => {
    const created = await tx.quizAttempt.create({
      data: {
        userId,
        quizId: mod.quiz!.id,
        score: 0,
        total: mod.quiz!.questions.length,
        percentage: 0,
        passed: false,
        passingScore: mod.passingScore,
      },
    });
    await tx.moduleProgress.upsert({
      where: { userId_moduleId: { userId, moduleId: mod.id } },
      update: { lastActiveAt: new Date(), startedAt: access.progress?.startedAt ?? new Date() },
      create: { userId, moduleId: mod.id, state: "IN_PROGRESS", startedAt: new Date() },
    });
    return created;
  });

  return {
    attemptId: attempt.id,
    module: { slug: mod.slug, title: mod.title, passingScore: mod.passingScore },
    course: { slug: mod.course.slug, title: mod.course.title },
    quiz: { title: mod.quiz.title, description: mod.quiz.description },
    questions: mod.quiz.questions.map((q) => ({
      id: q.id,
      prompt: q.prompt,
      options: q.options.map((o) => ({ id: o.id, text: o.text })),
    })),
  };
}

/**
 * Grades an attempt entirely from the stored answer key. The browser only sends
 * which option it picked for each question; the score is computed here.
 */
export async function submitAttempt(
  userId: string,
  attemptId: string,
  responses: { questionId: string; optionId: string | null }[],
): Promise<GradedResult> {
  const attempt = await db.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: {
        include: {
          module: {
            include: {
              course: { include: { modules: { where: { published: true }, orderBy: { order: "asc" } } } },
            },
          },
          questions: { include: { options: true }, orderBy: { order: "asc" } },
        },
      },
    },
  });

  if (!attempt || attempt.userId !== userId) {
    throw new HttpError(404, "not_found", "That quiz attempt could not be found.");
  }
  if (attempt.submittedAt) {
    throw new HttpError(409, "already_submitted", "This attempt has already been submitted.");
  }

  const chosen = new Map(responses.map((r) => [r.questionId, r.optionId]));
  const questions = attempt.quiz.questions;

  let score = 0;
  const answerRows: {
    questionId: string;
    selectedOptionId: string | null;
    correct: boolean;
  }[] = [];

  for (const q of questions) {
    const correctOption = q.options.find((o) => o.isCorrect);
    const picked = chosen.get(q.id) ?? null;
    // Only accept an option id that actually belongs to this question.
    const validPick = picked && q.options.some((o) => o.id === picked) ? picked : null;
    const isCorrect = Boolean(validPick && correctOption && validPick === correctOption.id);
    if (isCorrect) score += 1;
    answerRows.push({ questionId: q.id, selectedOptionId: validPick, correct: isCorrect });
  }

  const total = questions.length;
  const percentage = computePercentage(score, total);
  const passingScore = attempt.passingScore;
  const passed = didPass(percentage, passingScore);

  const mod = attempt.quiz.module;
  const orderedModules = mod.course.modules;
  const modIndex = orderedModules.findIndex((m) => m.id === mod.id);
  const nextModule = orderedModules[modIndex + 1] ?? null;

  const existingProgress = await db.moduleProgress.findUnique({
    where: { userId_moduleId: { userId, moduleId: mod.id } },
  });
  const previousBest = existingProgress?.bestScore ?? 0;
  const bestScore = Math.max(previousBest, percentage);
  const alreadyPassed = existingProgress?.passed ?? false;
  const nowPassed = alreadyPassed || passed;

  await db.$transaction(async (tx) => {
    await tx.quizAttempt.update({
      where: { id: attempt.id },
      data: { score, total, percentage, passed, submittedAt: new Date() },
    });
    await tx.attemptAnswer.createMany({
      data: answerRows.map((row) => ({ attemptId: attempt.id, ...row })),
    });
    await tx.moduleProgress.upsert({
      where: { userId_moduleId: { userId, moduleId: mod.id } },
      update: {
        bestScore,
        attemptsCount: { increment: 1 },
        passed: nowPassed,
        state: nowPassed ? "COMPLETED" : "IN_PROGRESS",
        completedAt: nowPassed ? existingProgress?.completedAt ?? new Date() : null,
        lastActiveAt: new Date(),
      },
      create: {
        userId,
        moduleId: mod.id,
        bestScore,
        attemptsCount: 1,
        passed,
        state: passed ? "COMPLETED" : "IN_PROGRESS",
        startedAt: existingProgress?.startedAt ?? new Date(),
        completedAt: passed ? new Date() : null,
      },
    });
    await tx.enrollment.upsert({
      where: { userId_courseId: { userId, courseId: mod.courseId } },
      update: { lastActiveAt: new Date() },
      create: { userId, courseId: mod.courseId },
    });
    await tx.user.update({ where: { id: userId }, data: { lastActiveAt: new Date() } });

    // Mark the course complete once every module is passed.
    if (nowPassed) {
      const passedCount = await tx.moduleProgress.count({
        where: { userId, passed: true, moduleId: { in: orderedModules.map((m) => m.id) } },
      });
      if (passedCount === orderedModules.length) {
        await tx.enrollment.update({
          where: { userId_courseId: { userId, courseId: mod.courseId } },
          data: { completedAt: new Date() },
        });
      }
    }
  });

  const byId = new Map(questions.map((q) => [q.id, q]));

  return {
    attemptId: attempt.id,
    score,
    total,
    percentage,
    passed,
    passingScore,
    bestScore,
    moduleCompleted: nowPassed,
    nextModule: nextModule ? { slug: nextModule.slug, title: nextModule.title } : null,
    nextModuleUnlocked: Boolean(nextModule) && nowPassed,
    courseSlug: mod.course.slug,
    courseTitle: mod.course.title,
    moduleSlug: mod.slug,
    moduleTitle: mod.title,
    questions: answerRows.map((row) => {
      const q = byId.get(row.questionId)!;
      const correctOption = q.options.find((o) => o.isCorrect)!;
      return {
        id: q.id,
        prompt: q.prompt,
        explanation: q.explanation,
        yourOptionId: row.selectedOptionId,
        correctOptionId: correctOption.id,
        correct: row.correct,
        options: q.options
          .sort((a, b) => a.order - b.order)
          .map((o) => ({
            id: o.id,
            text: o.text,
            isCorrect: o.isCorrect,
            chosen: row.selectedOptionId === o.id,
          })),
      };
    }),
  };
}

/** Fetches a previously graded attempt for the results page (own attempts only). */
export async function getAttemptResult(
  userId: string,
  attemptId: string,
): Promise<GradedResult | null> {
  const attempt = await db.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      answers: true,
      quiz: {
        include: {
          module: {
            include: {
              course: { include: { modules: { where: { published: true }, orderBy: { order: "asc" } } } },
            },
          },
          questions: { include: { options: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } },
        },
      },
    },
  });

  if (!attempt || attempt.userId !== userId || !attempt.submittedAt) return null;

  const mod = attempt.quiz.module;
  const orderedModules = mod.course.modules;
  const modIndex = orderedModules.findIndex((m) => m.id === mod.id);
  const nextModule = orderedModules[modIndex + 1] ?? null;

  const progress = await db.moduleProgress.findUnique({
    where: { userId_moduleId: { userId, moduleId: mod.id } },
  });
  const answersByQuestion = new Map(attempt.answers.map((a) => [a.questionId, a]));

  return {
    attemptId: attempt.id,
    score: attempt.score,
    total: attempt.total,
    percentage: attempt.percentage,
    passed: attempt.passed,
    passingScore: attempt.passingScore,
    bestScore: progress?.bestScore ?? attempt.percentage,
    moduleCompleted: progress?.passed ?? attempt.passed,
    nextModule: nextModule ? { slug: nextModule.slug, title: nextModule.title } : null,
    nextModuleUnlocked: Boolean(nextModule) && (progress?.passed ?? attempt.passed),
    courseSlug: mod.course.slug,
    courseTitle: mod.course.title,
    moduleSlug: mod.slug,
    moduleTitle: mod.title,
    questions: attempt.quiz.questions.map((q) => {
      const answer = answersByQuestion.get(q.id);
      const correctOption = q.options.find((o) => o.isCorrect)!;
      return {
        id: q.id,
        prompt: q.prompt,
        explanation: q.explanation,
        yourOptionId: answer?.selectedOptionId ?? null,
        correctOptionId: correctOption.id,
        correct: answer?.correct ?? false,
        options: q.options.map((o) => ({
          id: o.id,
          text: o.text,
          isCorrect: o.isCorrect,
          chosen: answer?.selectedOptionId === o.id,
        })),
      };
    }),
  };
}
