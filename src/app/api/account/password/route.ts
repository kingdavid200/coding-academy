import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { route, ok, badRequest, unauthorized } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { changePasswordSchema } from "@/lib/validation";
import { hashPassword, verifyPassword, validatePasswordStrength } from "@/lib/password";
import { destroyAllSessionsForUser, createSession } from "@/lib/session";

export const POST = route(async (req: NextRequest) => {
  const user = await requireUser();
  const json = await req.json().catch(() => null);
  if (!json) return badRequest("Send a valid JSON body.");
  const data = changePasswordSchema.parse(json);

  const record = await db.user.findUnique({ where: { id: user.id } });
  if (!record) return unauthorized();

  const currentOk = await verifyPassword(data.currentPassword, record.passwordHash);
  if (!currentOk) {
    return badRequest("Your current password is incorrect.", {
      currentPassword: "This does not match your current password.",
    });
  }

  const problems = validatePasswordStrength(data.newPassword);
  if (problems.length > 0) {
    return badRequest("Please choose a stronger password.", { newPassword: problems.join(" ") });
  }

  const passwordHash = await hashPassword(data.newPassword);
  await db.user.update({ where: { id: user.id }, data: { passwordHash } });

  // Invalidate every existing session, then start a fresh one for this device.
  await destroyAllSessionsForUser(user.id);
  await createSession(user.id, { userAgent: req.headers.get("user-agent") });

  return ok({ updated: true });
});
