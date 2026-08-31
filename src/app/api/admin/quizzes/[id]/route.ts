import { db } from "@/lib/db";
import { ok, badRequest, notFound } from "@/lib/http";
import { adminRoute, readJson } from "@/lib/admin-api";
import { quizUpdateSchema } from "@/lib/validation";

/**
 * A quiz is created automatically with its module. This endpoint edits the
 * quiz title and description. Deleting a quiz is done by deleting its module.
 */
export const PATCH = adminRoute<{ id: string }>(async ({ req, params }) => {
  const json = await readJson(req);
  if (!json) return badRequest("Send a valid JSON body.");
  const data = quizUpdateSchema.parse(json);

  const quiz = await db.quiz.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!quiz) return notFound("That quiz could not be found.");

  const updated = await db.quiz.update({
    where: { id: params.id },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
    },
  });
  return ok({ id: updated.id });
});
