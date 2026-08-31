import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/layout/Logo";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-[var(--color-ink-muted)]">
            A free, structured way to learn programming. Work through modules in order and prove
            what you know before moving on.
          </p>
        </div>
        <nav aria-label="Courses">
          <h2 className="text-sm font-semibold text-[var(--color-ink)]">Courses</h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--color-ink-muted)]">
            <li><Link href="/courses/java" className="hover:text-[var(--color-ink)]">Java</Link></li>
            <li><Link href="/courses/python" className="hover:text-[var(--color-ink)]">Python</Link></li>
            <li><Link href="/courses/html" className="hover:text-[var(--color-ink)]">HTML</Link></li>
          </ul>
        </nav>
        <nav aria-label="Platform">
          <h2 className="text-sm font-semibold text-[var(--color-ink)]">Platform</h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--color-ink-muted)]">
            <li><Link href="/how-it-works" className="hover:text-[var(--color-ink)]">How it works</Link></li>
            <li><Link href="/about" className="hover:text-[var(--color-ink)]">About</Link></li>
            <li><Link href="/login" className="hover:text-[var(--color-ink)]">Sign in</Link></li>
            <li><Link href="/signup" className="hover:text-[var(--color-ink)]">Create account</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-[var(--color-border)]">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-[var(--color-ink-subtle)] sm:px-6">
          &copy; {year} {siteConfig.name}. Built as a learning platform.
        </p>
      </div>
    </footer>
  );
}
