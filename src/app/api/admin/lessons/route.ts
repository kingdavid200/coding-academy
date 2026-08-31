import { db } from "@/lib/db";
import { created, badRequest, notFound, conflict } from "@/lib/http";
import { adminRoute, readJson } from "@/lib/admin-api";
import { lessonInputSchema } from "@/lib/validation";
import { serializeStringArray } from "@/lib/json-array";

export const POST = adminRoute(async ({ req }) => {
  const json = await readJson(req);
  if (!json) return badRequest("Send a valid JSON body.");
  const data = lessonInputSchema.parse(json);

  const mod = await db.module.findUnique({ where: { id: data.moduleId }, select: { id: true } });
  if (!mod) return notFound("That module could not be found.");

  const clash = await db.lesson.findUnique({
    where: { moduleId_slug: { moduleId: data.moduleId, slug: data.slug } },
    select: { id: true },
  });
  if (clash) return conflict("A lesson with that slug already exists in this module.");

  const last = await db.lesson.findFirst({
    where: { moduleId: data.moduleId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const lesson = await db.lesson.create({
    data: {
      moduleId: data.moduleId,
      slug: data.slug,
      title: data.title,
      summary: data.summary,
      objectives: serializeStringArray(data.objectives),
      content: data.content,
      estimatedMinutes: data.estimatedMinutes,
      order: (last?.order ?? 0) + 1,
    },
  });
  return created({ id: lesson.id, slug: lesson.slug });
});
