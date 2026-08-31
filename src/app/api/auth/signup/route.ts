import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { route, ok, badRequest, conflict, tooMany } from "@/lib/http";
import { signupSchema } from "@/lib/validation";
import { hashPassword, validatePasswordStrength } from "@/lib/password";
import { createSession } from "@/lib/session";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const POST = route(async (req: NextRequest) => {
  const ip = clientIp(req.headers);
  const limit = rateLimit(`signup:${ip}`, 8, 15 * 60_000);
  if (!limit.ok) return tooMany("Too many sign-up attempts. Please wait a few minutes.");

  const json = await req.json().catch(() => null);
  if (!json) return badRequest("Send a valid JSON body.");

  const data = signupSchema.parse(json);

  const strength = validatePasswordStrength(data.password);
  if (strength.length > 0) {
    return badRequest("Please choose a stronger password.", { password: strength.join(" ") });
  }

  const course = await db.course.findFirst({
    where: { slug: data.courseSlug, published: true },
    select: { id: true },
  });
  if (!course) return badRequest("Choose one of the available courses.", { courseSlug: "Unknown course." });

  const existing = await db.user.findUnique({ where: { email: data.email }, select: { id: true } });
  if (existing) {
    return conflict("An account with that email address already exists. Try signing in instead.");
  }

  const passwordHash = await hashPassword(data.password);

  const user = await db.user.create({
    data: {
      email: data.email,
      name: data.name,
      passwordHash,
      role: "STUDENT",
      activeCourseId: course.id,
      enrollments: { create: { courseId: course.id } },
    },
    select: { id: true, email: true, name: true, role: true },
  });

  await createSession(user.id, {
    userAgent: req.headers.get("user-agent"),
    ip,
  });

  return ok({ user, redirectTo: "/dashboard" });
});
