import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { route, ok, badRequest, unauthorized, tooMany } from "@/lib/http";
import { loginSchema } from "@/lib/validation";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/session";
import { rateLimit, clientIp } from "@/lib/rate-limit";

/** Only allow same-site relative paths as a post-login redirect target. */
function safeNext(next: string | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/dashboard";
  return next;
}

export const POST = route(async (req: NextRequest) => {
  const ip = clientIp(req.headers);
  const json = await req.json().catch(() => null);
  if (!json) return badRequest("Send a valid JSON body.");

  const data = loginSchema.parse(json);

  const ipLimit = rateLimit(`login:ip:${ip}`, 20, 15 * 60_000);
  const idLimit = rateLimit(`login:id:${data.email}`, 8, 15 * 60_000);
  if (!ipLimit.ok || !idLimit.ok) {
    return tooMany("Too many sign-in attempts. Please wait a few minutes and try again.");
  }

  const user = await db.user.findUnique({ where: { email: data.email } });

  // Constant-ish response: always run a hash comparison, always the same error.
  const passwordOk = user
    ? await verifyPassword(data.password, user.passwordHash)
    : await verifyPassword(data.password, "$2b$12$0000000000000000000000000000000000000000000000000000");

  if (!user || !passwordOk) {
    return unauthorized("Email or password is incorrect.");
  }

  await db.user.update({ where: { id: user.id }, data: { lastActiveAt: new Date() } });
  await createSession(user.id, { userAgent: req.headers.get("user-agent"), ip });

  const redirectTo = user.role === "ADMIN" ? safeNext(data.next) : safeNext(data.next);
  return ok({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    redirectTo: redirectTo === "/dashboard" && user.role === "ADMIN" ? "/admin" : redirectTo,
  });
});
