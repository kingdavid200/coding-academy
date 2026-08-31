import { route, ok } from "@/lib/http";
import { destroySession } from "@/lib/session";

export const POST = route(async () => {
  await destroySession();
  return ok({ redirectTo: "/login" });
});
