import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { route, ok, badRequest } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { updateAccountSchema } from "@/lib/validation";

export const POST = route(async (req: NextRequest) => {
  const user = await requireUser();
  const json = await req.json().catch(() => null);
  if (!json) return badRequest("Send a valid JSON body.");
  const data = updateAccountSchema.parse(json);

  await db.user.update({ where: { id: user.id }, data: { name: data.name } });
  return ok({ name: data.name });
});
