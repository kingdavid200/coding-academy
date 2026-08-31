import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

// The header reflects the signed-in user on every page, so nothing here can be
// static HTML. Rendering per-request also keeps the build free of DB access.
export const dynamic = "force-dynamic";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </>
  );
}
