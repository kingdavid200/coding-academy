import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "ca_session";

/**
 * Lightweight edge gate (Next.js "proxy"). This only checks that a session
 * cookie is present and redirects when it is not — a UX and defence-in-depth
 * layer. The authoritative checks (valid session, correct role, module
 * unlocked) all run again in the route handlers and server components, which is
 * where security is actually enforced.
 */
const PROTECTED_PREFIXES = ["/dashboard", "/account", "/learn", "/admin"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsAuth = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (!needsAuth) return NextResponse.next();

  const hasCookie = Boolean(req.cookies.get(COOKIE_NAME)?.value);
  if (hasCookie) return NextResponse.next();

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*", "/learn/:path*", "/admin/:path*"],
};
