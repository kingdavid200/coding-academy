import { db } from "@/lib/db";
import { ok, noContent, badRequest, notFound } from "@/lib/http";
import { adminRoute, readJson } from "@/lib/admin-api";
import { questionUpdateSchema } from "@/lib/validation";

export const PATCH = adminRoute<{ id: string }>(async ({ req, params }) => {
  const json = await readJson(req);
  if (!json) return badRequest("Send a valid JSON body.");
  const data = questionUpdateSchema.parse(json);

  const question = await db.question.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!question) return notFound("That question could not be found.");

  await db.$transaction(async (tx) => {
    await tx.question.update({
      where: { id: params.id },
      data: {
        ...(data.prompt !== undefined ? { prompt: data.prompt } : {}),
        ...(data.explanation !== undefined ? { explanation: data.explanation } : {}),
      },
    });
    if (data.options !== undefined) {
      await tx.answerOption.deleteMany({ where: { questionId: params.id } });
      await tx.answerOption.createMany({
        data: data.options.map((option, index) => ({
          questionId: params.id,
          text: option.text,
          isCorrect: option.isCorrect,
          order: index + 1,
        })),
      });
    }
  });
  return ok({ id: params.id });
});

export const DELETE = adminRoute<{ id: string }>(async ({ params }) => {
  const question = await db.question.findUnique({
    where: { id: params.id },
    select: { id: true, quizId: true, order: true },
  });
  if (!question) return notFound("That question could not be found.");

  await db.$transaction([
    db.question.delete({ where: { id: params.id } }),
    db.question.updateMany({
      where: { quizId: question.quizId, order: { gt: question.order } },
      data: { order: { decrement: 1 } },
    }),
  ]);
  return noContent();
});
