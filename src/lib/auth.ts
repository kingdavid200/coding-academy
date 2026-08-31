import "server-only";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { HttpError } from "@/lib/http";
import { getSessionUser, type SessionUser } from "@/lib/session";

export type { SessionUser };

/** Current user or null. Safe to call from any Server Component. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  return getSessionUser();
}

// --- API guards: throw HttpError, converted to JSON by `route()` -----------

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new HttpError(401, "unauthorized", "You need to sign in to do that.");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new HttpError(401, "unauthorized", "You need to sign in to do that.");
  if (user.role !== "ADMIN") {
    throw new HttpError(403, "forbidden", "You do not have permission to do that.");
  }
  return user;
}

// --- Page guards: redirect ----------------------------------------------

export async function requirePageUser(returnTo?: string): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    const target = returnTo ? `/login?next=${encodeURIComponent(returnTo)}` : "/login";
    redirect(target);
  }
  return user;
}

export async function requirePageAdmin(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "ADMIN") redirect("/dashboard");
  return user;
}

export async function touchActivity(userId: string): Promise<void> {
  await db.user
    .update({ where: { id: userId }, data: { lastActiveAt: new Date() } })
    .catch(() => {});
}
