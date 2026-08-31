import { db } from "@/lib/db";
import { created, badRequest, notFound } from "@/lib/http";
import { adminRoute, readJson } from "@/lib/admin-api";
import { questionInputSchema } from "@/lib/validation";

export const POST = adminRoute(async ({ req }) => {
  const json = await readJson(req);
  if (!json) return badRequest("Send a valid JSON body.");
  const data = questionInputSchema.parse(json);

  const quiz = await db.quiz.findUnique({ where: { id: data.quizId }, select: { id: true } });
  if (!quiz) return notFound("That quiz could not be found.");

  const last = await db.question.findFirst({
    where: { quizId: data.quizId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const question = await db.question.create({
    data: {
      quizId: data.quizId,
      prompt: data.prompt,
      explanation: data.explanation,
      order: (last?.order ?? 0) + 1,
      options: {
        create: data.options.map((option, index) => ({
          text: option.text,
          isCorrect: option.isCorrect,
          order: index + 1,
        })),
      },
    },
  });
  return created({ id: question.id });
});
