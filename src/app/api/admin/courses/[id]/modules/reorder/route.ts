import { db } from "@/lib/db";
import { ok, badRequest, notFound } from "@/lib/http";
import { adminRoute, readJson } from "@/lib/admin-api";
import { reorderSchema } from "@/lib/validation";

export const POST = adminRoute<{ id: string }>(async ({ req, params }) => {
  const json = await readJson(req);
  if (!json) return badRequest("Send a valid JSON body.");
  const { ids } = reorderSchema.parse(json);

  const modules = await db.module.findMany({
    where: { courseId: params.id },
    select: { id: true },
  });
  const owned = new Set(modules.map((m) => m.id));
  if (ids.length !== modules.length || !ids.every((id) => owned.has(id))) {
    return badRequest("The reorder list must contain every module in this course exactly once.");
  }
  if (modules.length === 0) return notFound("That course has no modules.");

  await db.$transaction(
    ids.map((id, index) =>
      db.module.update({ where: { id }, data: { order: index + 1 } }),
    ),
  );
  return ok({ reordered: ids.length });
});
