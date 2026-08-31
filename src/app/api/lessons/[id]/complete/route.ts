import type { NextRequest } from "next/server";
import { route, ok, forbidden, notFound } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { markLessonComplete } from "@/lib/data/learning";

export const POST = route(
  async (_req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const user = await requireUser();
    const { id } = await ctx.params;

    const result = await markLessonComplete(user.id, id);
    if (!result.ok) {
      if (result.reason === "locked") {
        return forbidden("This lesson belongs to a module you haven't unlocked yet.");
      }
      return notFound("That lesson could not be found.");
    }
    return ok({ completed: true });
  },
);
