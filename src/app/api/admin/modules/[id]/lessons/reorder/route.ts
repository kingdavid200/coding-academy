import { db } from "@/lib/db";
import { ok, badRequest, notFound } from "@/lib/http";
import { adminRoute, readJson } from "@/lib/admin-api";
import { reorderSchema } from "@/lib/validation";

export const POST = adminRoute<{ id: string }>(async ({ req, params }) => {
  const json = await readJson(req);
  if (!json) return badRequest("Send a valid JSON body.");
  const { ids } = reorderSchema.parse(json);

  const lessons = await db.lesson.findMany({
    where: { moduleId: params.id },
    select: { id: true },
  });
  const owned = new Set(lessons.map((l) => l.id));
  if (lessons.length === 0) return notFound("That module has no lessons.");
  if (ids.length !== lessons.length || !ids.every((id) => owned.has(id))) {
    return badRequest("The reorder list must contain every lesson in this module exactly once.");
  }

  await db.$transaction(
    ids.map((id, index) => db.lesson.update({ where: { id }, data: { order: index + 1 } })),
  );
  return ok({ reordered: ids.length });
});
