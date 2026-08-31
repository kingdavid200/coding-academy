import { db } from "@/lib/db";
import { created, badRequest, notFound, conflict } from "@/lib/http";
import { adminRoute, readJson } from "@/lib/admin-api";
import { moduleInputSchema } from "@/lib/validation";
import { serializeStringArray } from "@/lib/json-array";

export const POST = adminRoute(async ({ req }) => {
  const json = await readJson(req);
  if (!json) return badRequest("Send a valid JSON body.");
  const data = moduleInputSchema.parse(json);

  const course = await db.course.findUnique({ where: { id: data.courseId }, select: { id: true } });
  if (!course) return notFound("That course could not be found.");

  const clash = await db.module.findUnique({
    where: { courseId_slug: { courseId: data.courseId, slug: data.slug } },
    select: { id: true },
  });
  if (clash) return conflict("A module with that slug already exists in this course.");

  const last = await db.module.findFirst({
    where: { courseId: data.courseId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const mod = await db.module.create({
    data: {
      courseId: data.courseId,
      slug: data.slug,
      title: data.title,
      summary: data.summary,
      objectives: serializeStringArray(data.objectives),
      passingScore: data.passingScore,
      published: data.published,
      order: (last?.order ?? 0) + 1,
      quiz: {
        create: {
          title: `${data.title} Assessment`,
          description: "Complete this assessment to finish the module.",
        },
      },
    },
  });
  return created({ id: mod.id, slug: mod.slug });
});
