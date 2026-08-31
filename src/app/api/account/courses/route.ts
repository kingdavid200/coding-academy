import type { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { route, ok, badRequest } from "@/lib/http";
import { requireUser } from "@/lib/auth";

const bodySchema = z.object({
  courseSlug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, "Unknown course."),
  makeActive: z.boolean().default(true),
});

export const POST = route(async (req: NextRequest) => {
  const user = await requireUser();
  const json = await req.json().catch(() => null);
  if (!json) return badRequest("Send a valid JSON body.");
  const data = bodySchema.parse(json);

  const course = await db.course.findFirst({
    where: { slug: data.courseSlug, published: true },
    select: { id: true, slug: true },
  });
  if (!course) return badRequest("Choose one of the available courses.");

  await db.enrollment.upsert({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
    update: { lastActiveAt: new Date() },
    create: { userId: user.id, courseId: course.id },
  });

  if (data.makeActive) {
    await db.user.update({ where: { id: user.id }, data: { activeCourseId: course.id } });
  }

  return ok({ courseSlug: course.slug, active: data.makeActive });
});
