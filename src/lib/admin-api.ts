import type { NextRequest } from "next/server";
import { route } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import type { SessionUser } from "@/lib/session";

type Ctx<P> = { params: Promise<P> };
type Handler<P> = (args: {
  req: NextRequest;
  admin: SessionUser;
  params: P;
}) => Promise<Response>;

/**
 * Every admin API route goes through here. `requireAdmin()` runs before the
 * handler body, so a student hitting the URL directly gets a 403 regardless of
 * what the request contains.
 */
export function adminRoute<P = Record<string, never>>(handler: Handler<P>) {
  return route(async (req: NextRequest, ctx?: Ctx<P>) => {
    const admin = await requireAdmin();
    const params = ctx ? await ctx.params : ({} as P);
    return handler({ req, admin, params });
  });
}

export async function readJson(req: NextRequest): Promise<unknown> {
  return req.json().catch(() => null);
}
