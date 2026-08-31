import type { NextRequest } from "next/server";
import { route, ok, badRequest, tooMany } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { submitAttempt } from "@/lib/data/quiz";
import { quizSubmissionSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

export const POST = route(
  async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const user = await requireUser();
    const { id } = await ctx.params;

    const limit = rateLimit(`quiz-submit:${user.id}`, 40, 10 * 60_000);
    if (!limit.ok) return tooMany("Too many submissions. Please wait a moment and try again.");

    const json = await req.json().catch(() => null);
    if (!json) return badRequest("Send a valid JSON body.");
    const data = quizSubmissionSchema.parse({ ...json, attemptId: id });

    // The score is computed entirely on the server from the stored answer key.
    const result = await submitAttempt(user.id, id, data.responses);
    return ok(result);
  },
);
