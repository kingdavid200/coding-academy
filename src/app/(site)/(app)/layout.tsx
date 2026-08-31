import { requirePageUser } from "@/lib/auth";

// Every page in this group is per-student and auth-gated; never prerender.
export const dynamic = "force-dynamic";

/**
 * Every route under (app) requires an authenticated student session. Admins can
 * view student pages too; the admin area has its own layout guard.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requirePageUser();
  return <>{children}</>;
}
