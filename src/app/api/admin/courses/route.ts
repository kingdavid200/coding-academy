import { db } from "@/lib/db";
import { created, badRequest, conflict } from "@/lib/http";
import { adminRoute, readJson } from "@/lib/admin-api";
import { courseInputSchema } from "@/lib/validation";
import { serializeStringArray } from "@/lib/json-array";

export const POST = adminRoute(async ({ req }) => {
  const json = await readJson(req);
  if (!json) return badRequest("Send a valid JSON body.");
  const data = courseInputSchema.parse(json);

  const existing = await db.course.findUnique({ where: { slug: data.slug }, select: { id: true } });
  if (existing) return conflict("A course with that slug already exists.");

  const course = await db.course.create({
    data: {
      slug: data.slug,
      title: data.title,
      language: data.language,
      tagline: data.tagline,
      description: data.description,
      outcomes: serializeStringArray(data.outcomes),
      icon: data.icon,
      accent: data.accent,
      order: data.order,
      published: data.published,
    },
  });
  return created({ id: course.id, slug: course.slug });
});
