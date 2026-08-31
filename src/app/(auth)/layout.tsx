import { Container } from "@/components/layout/PageShell";
import { Logo } from "@/components/layout/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main id="main">
      <Container width="narrow" className="flex min-h-[70vh] flex-col items-center justify-center py-16">
        <div className="w-full max-w-md">
          <div className="mb-6 flex justify-center">
            <Logo href="/login" />
          </div>
          {children}
        </div>
      </Container>
    </main>
  );
}
