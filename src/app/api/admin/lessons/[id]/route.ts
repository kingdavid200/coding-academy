import { db } from "@/lib/db";
import { ok, noContent, badRequest, notFound, conflict } from "@/lib/http";
import { adminRoute, readJson } from "@/lib/admin-api";
import { lessonUpdateSchema } from "@/lib/validation";
import { serializeStringArray } from "@/lib/json-array";

export const PATCH = adminRoute<{ id: string }>(async ({ req, params }) => {
  const json = await readJson(req);
  if (!json) return badRequest("Send a valid JSON body.");
  const data = lessonUpdateSchema.parse(json);

  const lesson = await db.lesson.findUnique({ where: { id: params.id } });
  if (!lesson) return notFound("That lesson could not be found.");

  if (data.slug && data.slug !== lesson.slug) {
    const clash = await db.lesson.findUnique({
      where: { moduleId_slug: { moduleId: lesson.moduleId, slug: data.slug } },
      select: { id: true },
    });
    if (clash) return conflict("A lesson with that slug already exists in this module.");
  }

  const updated = await db.lesson.update({
    where: { id: params.id },
    data: {
      ...(data.slug !== undefined ? { slug: data.slug } : {}),
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.summary !== undefined ? { summary: data.summary } : {}),
      ...(data.objectives !== undefined ? { objectives: serializeStringArray(data.objectives) } : {}),
      ...(data.content !== undefined ? { content: data.content } : {}),
      ...(data.estimatedMinutes !== undefined ? { estimatedMinutes: data.estimatedMinutes } : {}),
    },
  });
  return ok({ id: updated.id, slug: updated.slug });
});

export const DELETE = adminRoute<{ id: string }>(async ({ params }) => {
  const lesson = await db.lesson.findUnique({
    where: { id: params.id },
    select: { id: true, moduleId: true, order: true },
  });
  if (!lesson) return notFound("That lesson could not be found.");

  await db.$transaction([
    db.lesson.delete({ where: { id: params.id } }),
    db.lesson.updateMany({
      where: { moduleId: lesson.moduleId, order: { gt: lesson.order } },
      data: { order: { decrement: 1 } },
    }),
  ]);
  return noContent();
});
