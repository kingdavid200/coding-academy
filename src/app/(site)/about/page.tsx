import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { Container, PageHeader } from "@/components/layout/PageShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description:
    "Coding Academy is a free online learning platform that teaches programming through ordered modules and assessments, built to be accessible and honest about what it covers.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <main id="main">
      <Container width="narrow" className="py-10">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
          ]}
        />
        <div className="mt-6">
          <PageHeader title={`About ${siteConfig.name}`} />
        </div>

        <div className="mt-6 space-y-5 text-[var(--color-ink-muted)]">
          <p>
            {siteConfig.name} is a free online platform for learning to program. It exists to give
            beginners a clear, ordered path through a language rather than a pile of disconnected
            tutorials.
          </p>
          <p>
            The teaching model is simple. Each course is a sequence of modules. You read the lessons
            in a module, then take a short assessment. Score at least 80% and the next module opens.
            Score less and you review and try again. The platform tracks your attempts, your best
            score and your overall progress so you always know where you are.
          </p>
          <p>
            The first three courses cover Java, Python and HTML. Every lesson is written for this
            platform, with real code examples rather than filler. The content is maintained through
            an admin system, so courses can grow and improve over time without shipping new code.
          </p>
          <p>
            Accessibility is a first-class concern: semantic HTML, keyboard support, visible focus,
            labelled forms and sensible colour contrast throughout.
          </p>
        </div>

        <h2 className="mt-10 text-lg font-semibold">Contact</h2>
        <p className="mt-2 text-[var(--color-ink-muted)]">
          Questions or feedback:{" "}
          <a
            href={`mailto:${siteConfig.organization.email}`}
            className="font-medium text-[var(--color-primary)] underline"
          >
            {siteConfig.organization.email}
          </a>
        </p>
      </Container>
    </main>
  );
}
