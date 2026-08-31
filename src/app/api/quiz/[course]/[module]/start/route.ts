import type { NextRequest } from "next/server";
import { route, ok, tooMany } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { startAttempt } from "@/lib/data/quiz";
import { rateLimit } from "@/lib/rate-limit";

export const POST = route(
  async (_req: NextRequest, ctx: { params: Promise<{ course: string; module: string }> }) => {
    const user = await requireUser();
    const { course, module: moduleSlug } = await ctx.params;

    const limit = rateLimit(`quiz-start:${user.id}`, 30, 10 * 60_000);
    if (!limit.ok) return tooMany("You're starting assessments very quickly. Please wait a moment.");

    const quiz = await startAttempt(user.id, course, moduleSlug);
    return ok(quiz);
  },
);
