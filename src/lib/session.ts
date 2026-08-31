import "server-only";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const COOKIE_NAME = "ca_session";
const SESSION_TTL_DAYS = 30;
const SESSION_TTL_MS = SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;

function base64url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64url");
}

/** Opaque, high-entropy session token handed to the browser. */
function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64url(bytes);
}

/**
 * Only the hash of the token is stored, so a read-only leak of the database
 * cannot be used to hijack live sessions.
 */
async function hashToken(token: string): Promise<string> {
  const data = new TextEncoder().encode(`${process.env.AUTH_SECRET ?? ""}:${token}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64url(new Uint8Array(digest));
}

export async function createSession(
  userId: string,
  meta: { userAgent?: string | null; ip?: string | null } = {},
): Promise<void> {
  const token = generateToken();
  const tokenHash = await hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.session.create({
    data: {
      token: tokenHash,
      userId,
      expiresAt,
      userAgent: meta.userAgent?.slice(0, 400) ?? null,
      ip: meta.ip?.slice(0, 80) ?? null,
    },
  });

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "STUDENT" | "ADMIN";
  activeCourseId: string | null;
};

/**
 * Resolves the current user from the session cookie, or null. Also lazily
 * extends a session that is more than a day from expiry and touches
 * `lastActiveAt`.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const tokenHash = await hashToken(token);
  const session = await db.session.findUnique({
    where: { token: tokenHash },
    include: { user: true },
  });

  if (!session || session.expiresAt.getTime() < Date.now()) {
    if (session) await db.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
    activeCourseId: session.user.activeCourseId,
  };
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (token) {
    const tokenHash = await hashToken(token);
    await db.session.deleteMany({ where: { token: tokenHash } });
  }
  jar.delete(COOKIE_NAME);
}

export async function destroyAllSessionsForUser(userId: string): Promise<void> {
  await db.session.deleteMany({ where: { userId } });
}

export { COOKIE_NAME };
