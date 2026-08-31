import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "ca_session";

/**
 * The platform is fully private. Everything requires an account except the
 * paths below. This is the edge/UX layer — every page and API route also
 * re-checks the session (and role) server-side, which is where access is
 * actually enforced.
 */
const PUBLIC_PATHS = new Set([
  "/login",
  "/signup",
  "/robots.txt",
  "/sitemap.xml",
  "/llms.txt",
  "/manifest.webmanifest",
  "/opengraph-image",
  "/icon.svg",
  "/favicon.ico",
]);

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  // Auth endpoints must work signed-out; other API routes guard themselves and
  // should return JSON 401s rather than an HTML redirect.
  if (pathname.startsWith("/api/")) return true;
  if (pathname.startsWith("/_next/")) return true;
  return false;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();

  const hasCookie = Boolean(req.cookies.get(COOKIE_NAME)?.value);
  if (hasCookie) return NextResponse.next();

  const loginUrl = new URL("/login", req.url);
  if (pathname !== "/") loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Run on everything except Next internals and static asset files.
  matcher: ["/((?!_next/static|_next/image).*)"],
};
