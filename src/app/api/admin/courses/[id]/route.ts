import { db } from "@/lib/db";
import { ok, noContent, badRequest, notFound, conflict } from "@/lib/http";
import { adminRoute, readJson } from "@/lib/admin-api";
import { courseUpdateSchema } from "@/lib/validation";
import { serializeStringArray } from "@/lib/json-array";

export const PATCH = adminRoute<{ id: string }>(async ({ req, params }) => {
  const json = await readJson(req);
  if (!json) return badRequest("Send a valid JSON body.");
  const data = courseUpdateSchema.parse(json);

  const course = await db.course.findUnique({ where: { id: params.id } });
  if (!course) return notFound("That course could not be found.");

  if (data.slug && data.slug !== course.slug) {
    const clash = await db.course.findUnique({ where: { slug: data.slug }, select: { id: true } });
    if (clash) return conflict("A course with that slug already exists.");
  }

  const updated = await db.course.update({
    where: { id: params.id },
    data: {
      ...(data.slug !== undefined ? { slug: data.slug } : {}),
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.language !== undefined ? { language: data.language } : {}),
      ...(data.tagline !== undefined ? { tagline: data.tagline } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.outcomes !== undefined ? { outcomes: serializeStringArray(data.outcomes) } : {}),
      ...(data.icon !== undefined ? { icon: data.icon } : {}),
      ...(data.accent !== undefined ? { accent: data.accent } : {}),
      ...(data.order !== undefined ? { order: data.order } : {}),
      ...(data.published !== undefined ? { published: data.published } : {}),
    },
  });
  return ok({ id: updated.id, slug: updated.slug });
});

export const DELETE = adminRoute<{ id: string }>(async ({ params }) => {
  const course = await db.course.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!course) return notFound("That course could not be found.");
  await db.course.delete({ where: { id: params.id } });
  return noContent();
});
