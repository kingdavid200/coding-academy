import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { requirePageUser } from "@/lib/auth";
import { getLearningView, ensureEnrollment } from "@/lib/data/learning";
import { getCourseBySlug } from "@/lib/data/courses";
import { Container } from "@/components/layout/PageShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Card, CardBody } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { ProgressBar, Badge, EmptyState } from "@/components/ui/Feedback";
import { CourseModuleList } from "@/components/learn/CourseModuleList";

type Params = { params: Promise<{ course: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { course: slug } = await params;
  const course = await getCourseBySlug(slug);
  return buildMetadata({
    title: course ? `${course.title} course` : "Course",
    description: course
      ? `Your progress through the ${course.title} course on Coding Academy.`
      : "Course",
    path: `/learn/${slug}`,
    noindex: true,
  });
}

export default async function LearnCoursePage({ params }: Params) {
  const { course: slug } = await params;
  const user = await requirePageUser(`/learn/${slug}`);
  const view = await getLearningView(user.id, slug);
  if (!view) notFound();

  await ensureEnrollment(user.id, view.course.id);

  const continueHref = view.currentModuleSlug
    ? `/learn/${view.course.slug}/${view.currentModuleSlug}`
    : null;

  return (
    <main id="main">
      <Container className="py-10">
        <Breadcrumbs
          items={[
            { name: "Dashboard", path: "/dashboard" },
            { name: view.course.title, path: `/learn/${view.course.slug}` },
          ]}
        />

        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{view.course.title}</h1>
            <p className="mt-2 max-w-xl text-[var(--color-ink-muted)]">{view.course.tagline}</p>
          </div>

          <Card className="w-full shrink-0 lg:w-80">
            <CardBody>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium">Course completion</span>
                <span className="text-2xl font-bold">{view.overallPercent}%</span>
              </div>
              <ProgressBar
                value={view.overallPercent}
                label="Overall course completion"
                className="mt-2"
              />
              <p className="mt-2 text-xs text-[var(--color-ink-subtle)]">
                {view.completedModules} of {view.totalModules} modules completed
              </p>
              {view.courseCompleted ? (
                <Badge tone="success" className="mt-3">
                  Course complete
                </Badge>
              ) : continueHref ? (
                <ButtonLink href={continueHref} fullWidth className="mt-4">
                  Continue learning
                </ButtonLink>
              ) : null}
            </CardBody>
          </Card>
        </div>

        <section className="mt-10" aria-labelledby="modules-heading">
          <h2 id="modules-heading" className="text-xl font-semibold">
            Modules
          </h2>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            Work through these in order. Each unlocks when you pass the previous assessment.
          </p>
          <div className="mt-4">
            <CourseModuleList courseSlug={view.course.slug} modules={view.modules} />
          </div>
        </section>

        <section className="mt-10" aria-labelledby="results-heading">
          <h2 id="results-heading" className="text-xl font-semibold">
            Recent assessment results
          </h2>
          <div className="mt-4">
            {view.recentAttempts.length === 0 ? (
              <EmptyState
                title="No assessments taken yet"
                description="Your results will appear here once you complete a module assessment."
              />
            ) : (
              <ul className="divide-y divide-[var(--color-border)] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
                {view.recentAttempts.map((attempt) => (
                  <li
                    key={attempt.id}
                    className="flex items-center justify-between gap-3 px-5 py-3 text-sm"
                  >
                    <Link
                      href={`/learn/${view.course.slug}/${attempt.moduleSlug}`}
                      className="font-medium hover:underline"
                    >
                      {attempt.moduleTitle}
                    </Link>
                    <span className="flex items-center gap-3">
                      <span className="text-[var(--color-ink-muted)]">{attempt.percentage}%</span>
                      <Badge tone={attempt.passed ? "success" : "danger"}>
                        {attempt.passed ? "Passed" : "Not passed"}
                      </Badge>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </Container>
    </main>
  );
}
