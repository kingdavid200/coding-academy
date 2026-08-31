import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { requirePageUser } from "@/lib/auth";
import { getModuleView } from "@/lib/data/learning";
import { Container } from "@/components/layout/PageShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Alert } from "@/components/ui/Feedback";
import { ButtonLink } from "@/components/ui/Button";
import { QuizRunner } from "@/components/learn/QuizRunner";

type Params = { params: Promise<{ course: string; module: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { course, module: moduleSlug } = await params;
  const user = await requirePageUser();
  const view = await getModuleView(user.id, course, moduleSlug);
  return buildMetadata({
    title: view ? `${view.module.title} assessment — ${view.course.title}` : "Assessment",
    description: "Module assessment.",
    path: `/learn/${course}/${moduleSlug}/quiz`,
    noindex: true,
  });
}

export default async function QuizPage({ params }: Params) {
  const { course, module: moduleSlug } = await params;
  const user = await requirePageUser(`/learn/${course}/${moduleSlug}/quiz`);
  const view = await getModuleView(user.id, course, moduleSlug);
  if (!view) notFound();

  const locked = view.module.state === "LOCKED";
  const hasQuiz = view.quiz?.exists;

  return (
    <main id="main">
      <Container width="narrow" className="py-10">
        <Breadcrumbs
          items={[
            { name: "Dashboard", path: "/dashboard" },
            { name: view.course.title, path: `/learn/${course}` },
            { name: view.module.title, path: `/learn/${course}/${moduleSlug}` },
            { name: "Assessment", path: `/learn/${course}/${moduleSlug}/quiz` },
          ]}
        />

        <h1 className="mt-6 text-3xl font-bold">{view.module.title} assessment</h1>
        <p className="mt-2 text-[var(--color-ink-muted)]">
          Pass mark: {view.module.passingScore}%. Answer every question, then submit to see your
          result and explanations.
        </p>

        <div className="mt-8">
          {locked ? (
            <Alert tone="warning" title="This assessment is locked">
              <p>{view.module.lockReason}</p>
              <div className="mt-3">
                <ButtonLink href={`/learn/${course}`} variant="secondary" size="sm">
                  Back to course
                </ButtonLink>
              </div>
            </Alert>
          ) : !hasQuiz ? (
            <Alert tone="neutral">This module does not have an assessment yet.</Alert>
          ) : (
            <QuizRunner courseSlug={course} moduleSlug={moduleSlug} />
          )}
        </div>
      </Container>
    </main>
  );
}
