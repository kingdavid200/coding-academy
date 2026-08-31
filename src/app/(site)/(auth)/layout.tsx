import Link from "next/link";
import { Container } from "@/components/layout/PageShell";
import { Logo } from "@/components/layout/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main id="main">
      <Container width="narrow" className="flex min-h-[70vh] flex-col items-center justify-center py-16">
        <div className="w-full max-w-md">
          <div className="mb-6 flex justify-center">
            <Logo />
          </div>
          {children}
          <p className="mt-6 text-center text-xs text-[var(--color-ink-subtle)]">
            <Link href="/" className="hover:underline">
              Return to the homepage
            </Link>
          </p>
        </div>
      </Container>
    </main>
  );
}
