import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { javaCourse } from "./content/java";
import { pythonCourse } from "./content/python";
import { htmlCourse } from "./content/html";
import type { SeedCourse } from "./content/types";

const db = new PrismaClient();

const COURSES: SeedCourse[] = [javaCourse, pythonCourse, htmlCourse];

async function seedCourse(course: SeedCourse) {
  const existing = await db.course.findUnique({ where: { slug: course.slug } });

  // Replace the course graph on every seed run so content edits take effect.
  // Student progress lives in separate tables and is not touched here unless
  // a module/lesson is removed (cascade), which is expected during content dev.
  if (existing) {
    await db.course.delete({ where: { id: existing.id } });
  }

  const created = await db.course.create({
    data: {
      slug: course.slug,
      title: course.title,
      language: course.language,
      tagline: course.tagline,
      description: course.description,
      icon: course.icon,
      accent: course.accent,
      order: course.order,
      outcomes: JSON.stringify(course.outcomes),
      published: true,
      modules: {
        create: course.modules.map((mod, moduleIndex) => ({
          slug: mod.slug,
          title: mod.title,
          summary: mod.summary,
          objectives: JSON.stringify(mod.objectives),
          order: moduleIndex + 1,
          passingScore: mod.passingScore ?? 80,
          published: true,
          lessons: {
            create: mod.lessons.map((lesson, lessonIndex) => ({
              slug: lesson.slug,
              title: lesson.title,
              summary: lesson.summary,
              objectives: JSON.stringify(lesson.objectives),
              content: lesson.content,
              order: lessonIndex + 1,
              estimatedMinutes: lesson.estimatedMinutes,
            })),
          },
          quiz: {
            create: {
              title: mod.quiz.title,
              description: mod.quiz.description,
              questions: {
                create: mod.quiz.questions.map((q, qIndex) => {
                  const correctCount = q.options.filter((o) => o.correct).length;
                  if (correctCount !== 1) {
                    throw new Error(
                      `Question "${q.prompt}" in ${course.slug}/${mod.slug} must have exactly one correct option (has ${correctCount}).`,
                    );
                  }
                  return {
                    prompt: q.prompt,
                    explanation: q.explanation,
                    order: qIndex + 1,
                    options: {
                      create: q.options.map((o, oIndex) => ({
                        text: o.text,
                        isCorrect: Boolean(o.correct),
                        order: oIndex + 1,
                      })),
                    },
                  };
                }),
              },
            },
          },
        })),
      },
    },
    include: { modules: { include: { lessons: true, quiz: true } } },
  });

  const lessons = created.modules.reduce((n, m) => n + m.lessons.length, 0);
  console.log(
    `  ${course.title}: ${created.modules.length} modules, ${lessons} lessons, ${created.modules.length} quizzes`,
  );
}

async function seedAdmin() {
  const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@codingacademy.test").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? "Admin!Passw0rd";
  const name = process.env.SEED_ADMIN_NAME ?? "Platform Admin";
  const passwordHash = await bcrypt.hash(password, 12);

  await db.user.upsert({
    where: { email },
    update: { role: "ADMIN", name },
    create: { email, name, passwordHash, role: "ADMIN" },
  });
  console.log(`  Admin account: ${email}`);
}

async function main() {
  console.log("Seeding Coding Academy...");
  await db.appSetting.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, defaultPassingScore: 80 },
  });

  for (const course of COURSES) {
    await seedCourse(course);
  }
  await seedAdmin();
  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
