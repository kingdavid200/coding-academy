import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Container } from "@/components/layout/PageShell";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you were looking for does not exist.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <Container width="narrow" className="py-24 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-primary)]">
            Error 404
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">We couldn&rsquo;t find that page</h1>
          <p className="mx-auto mt-3 max-w-md text-[var(--color-ink-muted)]">
            The link may be out of date, or the page may have moved. Here are some places to pick
            things back up.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/">Back to home</ButtonLink>
            <ButtonLink href="/courses" variant="secondary">
              Browse courses
            </ButtonLink>
            <ButtonLink href="/dashboard" variant="ghost">
              Your dashboard
            </ButtonLink>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
