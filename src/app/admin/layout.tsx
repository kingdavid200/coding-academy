import type { Metadata } from "next";
import Link from "next/link";
import { requirePageAdmin } from "@/lib/auth";
import { Container } from "@/components/layout/PageShell";
import { logoutAction } from "@/app/actions/auth";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin | Coding Academy" },
  robots: { index: false, follow: false },
};

// Every admin page is per-request and auth-gated; never prerender.
export const dynamic = "force-dynamic";

const navItems = [
  { label: "Overview", href: "/admin" },
  { label: "Students", href: "/admin/students" },
  { label: "Courses", href: "/admin/courses" },
  { label: "Statistics", href: "/admin/stats" },
  { label: "Settings", href: "/admin/settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requirePageAdmin();

  return (
    <div className="min-h-full">
      <div className="border-b border-[var(--color-border)] bg-[var(--color-ink)] text-white">
        <Container className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">Coding Academy Admin</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-white/70 sm:inline">{admin.email}</span>
            <Link href="/" className="text-white/80 hover:text-white">
              View site
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="text-white/80 hover:text-white">
                Sign out
              </button>
            </form>
          </div>
        </Container>
      </div>

      <Container className="flex flex-col gap-8 py-8 lg:flex-row">
        <nav aria-label="Admin sections" className="lg:w-52 lg:shrink-0">
          <ul className="flex gap-1 overflow-x-auto lg:flex-col">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="min-w-0 flex-1">{children}</div>
      </Container>
    </div>
  );
}
