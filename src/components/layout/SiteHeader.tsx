import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/layout/Logo";
import { logoutAction } from "@/app/actions/auth";

const publicLinks = [
  { label: "Courses", href: "/courses" },
  { label: "How it works", href: "/how-it-works" },
  { label: "About", href: "/about" },
];

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-canvas)_88%,transparent)] backdrop-blur">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6"
      >
        <Logo />

        <div className="hidden items-center gap-1 md:flex">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              {user.role === "ADMIN" ? (
                <Link
                  href="/admin"
                  className="rounded-md px-3 py-2 text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                >
                  Admin
                </Link>
              ) : null}
              <Link
                href="/dashboard"
                className="rounded-[var(--radius)] bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-strong)]"
              >
                Dashboard
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-md px-3 py-2 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-3 py-2 text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-[var(--radius)] bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-strong)]"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu: JS-free disclosure */}
        <details className="group relative md:hidden">
          <summary
            className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-md border border-[var(--color-border-strong)] [&::-webkit-details-marker]:hidden"
            aria-label="Open menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </summary>
          <div className="absolute right-0 mt-2 w-56 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-[var(--shadow-card)]">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-md px-3 py-2 text-sm text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)]"
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-[var(--color-border)]" />
            {user ? (
              <>
                {user.role === "ADMIN" ? (
                  <Link href="/admin" className="block rounded-md px-3 py-2 text-sm hover:bg-[var(--color-surface-muted)]">
                    Admin
                  </Link>
                ) : null}
                <Link href="/dashboard" className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-[var(--color-surface-muted)]">
                  Dashboard
                </Link>
                <form action={logoutAction}>
                  <button type="submit" className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-[var(--color-surface-muted)]">
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="block rounded-md px-3 py-2 text-sm hover:bg-[var(--color-surface-muted)]">
                  Sign in
                </Link>
                <Link href="/signup" className="block rounded-md px-3 py-2 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-surface-muted)]">
                  Get started
                </Link>
              </>
            )}
          </div>
        </details>
      </nav>
      <span className="sr-only">{siteConfig.name}</span>
    </header>
  );
}
