import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { requirePageUser } from "@/lib/auth";
import { getModuleView } from "@/lib/data/learning";
import { Container } from "@/components/layout/PageShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Card, CardBody } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { Alert, Badge } from "@/components/ui/Feedback";
import { ModuleStatusBadge } from "@/components/learn/ModuleStatus";

type Params = { params: Promise<{ course: string; module: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { course, module: moduleSlug } = await params;
  const user = await requirePageUser();
  const view = await getModuleView(user.id, course, moduleSlug);
  return buildMetadata({
    title: view ? `${view.module.title} — ${view.course.title}` : "Module",
    description: view?.module.summary ?? "Module",
    path: `/learn/${course}/${moduleSlug}`,
    noindex: true,
  });
}

export default async function ModulePage({ params }: Params) {
  const { course, module: moduleSlug } = await params;
  const user = await requirePageUser(`/learn/${course}/${moduleSlug}`);
  const view = await getModuleView(user.id, course, moduleSlug);
  if (!view) notFound();

  const { module: mod } = view;
  const locked = mod.state === "LOCKED";
  const quizHref = `/learn/${course}/${moduleSlug}/quiz`;

  return (
    <main id="main">
      <Container width="narrow" className="py-10">
        <Breadcrumbs
          items={[
            { name: "Dashboard", path: "/dashboard" },
            { name: view.course.title, path: `/learn/${course}` },
            { name: mod.title, path: `/learn/${course}/${moduleSlug}` },
          ]}
        />

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[var(--color-ink-subtle)]">
            Module {mod.order}
          </span>
          <ModuleStatusBadge state={mod.state} />
          {mod.attemptsCount > 0 ? (
            <Badge tone={mod.passed ? "success" : "neutral"}>Best score {mod.bestScore}%</Badge>
          ) : null}
        </div>
        <h1 className="mt-2 text-3xl font-bold">{mod.title}</h1>
        <p className="mt-2 text-[var(--color-ink-muted)]">{mod.summary}</p>

        {locked ? (
          <Alert tone="warning" title="This module is locked" className="mt-6">
            {mod.lockReason}
          </Alert>
        ) : null}

        {mod.objectives.length > 0 ? (
          <section className="mt-8" aria-labelledby="objectives-heading">
            <h2 id="objectives-heading" className="text-lg font-semibold">
              Learning objectives
            </h2>
            <ul className="mt-3 space-y-1.5">
              {mod.objectives.map((objective) => (
                <li key={objective} className="flex items-start gap-2 text-sm text-[var(--color-ink-muted)]">
                  <span aria-hidden="true" className="mt-1 text-[var(--color-primary)]">
                    &bull;
                  </span>
                  {objective}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-8" aria-labelledby="lessons-heading">
          <h2 id="lessons-heading" className="text-lg font-semibold">
            Lessons
          </h2>
          <ol className="mt-3 space-y-2">
            {view.lessons.map((lesson) => (
              <li key={lesson.slug}>
                <Card>
                  <CardBody className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="text-xs text-[var(--color-ink-subtle)]">
                        Lesson {lesson.order} &middot; {lesson.estimatedMinutes} min
                      </p>
                      <p className="truncate font-medium">
                        {locked ? (
                          lesson.title
                        ) : (
                          <Link
                            href={`/learn/${course}/${moduleSlug}/${lesson.slug}`}
                            className="hover:underline"
                          >
                            {lesson.title}
                          </Link>
                        )}
                      </p>
                    </div>
                    {lesson.completed ? (
                      <Badge tone="success">Read</Badge>
                    ) : (
                      <span className="text-xs text-[var(--color-ink-subtle)]">Not read</span>
                    )}
                  </CardBody>
                </Card>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-8" aria-labelledby="assessment-heading">
          <h2 id="assessment-heading" className="text-lg font-semibold">
            Assessment
          </h2>
          <Card className="mt-3">
            <CardBody>
              {view.quiz?.exists ? (
                <>
                  <p className="text-sm text-[var(--color-ink-muted)]">
                    {view.quiz.questionCount} multiple-choice questions. You need{" "}
                    <strong>{mod.passingScore}%</strong> to complete this module and unlock the next
                    one. You can retake it as many times as you need.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {locked ? (
                      <ButtonLink href={`/learn/${course}`} variant="secondary">
                        Back to course
                      </ButtonLink>
                    ) : (
                      <ButtonLink href={quizHref}>
                        {mod.passed
                          ? "Retake assessment"
                          : mod.attemptsCount > 0
                            ? "Try the assessment again"
                            : "Start the assessment"}
                      </ButtonLink>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm text-[var(--color-ink-muted)]">
                  This module does not have an assessment yet.
                </p>
              )}
            </CardBody>
          </Card>
        </section>

        <nav className="mt-10 flex justify-between text-sm" aria-label="Module navigation">
          {view.prevModuleSlug ? (
            <Link
              href={`/learn/${course}/${view.prevModuleSlug}`}
              className="font-medium text-[var(--color-primary)] hover:underline"
            >
              &larr; Previous module
            </Link>
          ) : (
            <span />
          )}
          {view.nextModuleSlug && mod.passed ? (
            <Link
              href={`/learn/${course}/${view.nextModuleSlug}`}
              className="font-medium text-[var(--color-primary)] hover:underline"
            >
              Next module &rarr;
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </Container>
    </main>
  );
}
