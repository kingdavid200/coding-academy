import { db } from "@/lib/db";
import { ok, noContent, badRequest, notFound, conflict } from "@/lib/http";
import { adminRoute, readJson } from "@/lib/admin-api";
import { moduleUpdateSchema } from "@/lib/validation";
import { serializeStringArray } from "@/lib/json-array";

export const PATCH = adminRoute<{ id: string }>(async ({ req, params }) => {
  const json = await readJson(req);
  if (!json) return badRequest("Send a valid JSON body.");
  const data = moduleUpdateSchema.parse(json);

  const mod = await db.module.findUnique({ where: { id: params.id } });
  if (!mod) return notFound("That module could not be found.");

  if (data.slug && data.slug !== mod.slug) {
    const clash = await db.module.findUnique({
      where: { courseId_slug: { courseId: mod.courseId, slug: data.slug } },
      select: { id: true },
    });
    if (clash) return conflict("A module with that slug already exists in this course.");
  }

  const updated = await db.module.update({
    where: { id: params.id },
    data: {
      ...(data.slug !== undefined ? { slug: data.slug } : {}),
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.summary !== undefined ? { summary: data.summary } : {}),
      ...(data.objectives !== undefined ? { objectives: serializeStringArray(data.objectives) } : {}),
      ...(data.passingScore !== undefined ? { passingScore: data.passingScore } : {}),
      ...(data.published !== undefined ? { published: data.published } : {}),
    },
  });
  return ok({ id: updated.id, slug: updated.slug });
});

export const DELETE = adminRoute<{ id: string }>(async ({ params }) => {
  const mod = await db.module.findUnique({
    where: { id: params.id },
    select: { id: true, courseId: true, order: true },
  });
  if (!mod) return notFound("That module could not be found.");

  await db.$transaction([
    db.module.delete({ where: { id: params.id } }),
    // Close the gap in the ordering.
    db.module.updateMany({
      where: { courseId: mod.courseId, order: { gt: mod.order } },
      data: { order: { decrement: 1 } },
    }),
  ]);
  return noContent();
});
