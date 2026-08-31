import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { requirePageUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getLearningView } from "@/lib/data/learning";
import { listEnrollmentSummaries } from "@/lib/data/dashboard";
import { Container } from "@/components/layout/PageShell";
import { Card, CardBody } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { ProgressBar, Badge, EmptyState } from "@/components/ui/Feedback";
import { CourseModuleList } from "@/components/learn/CourseModuleList";
import { CourseGlyph } from "@/components/CourseGlyph";

export const metadata: Metadata = buildMetadata({
  title: "Your dashboard",
  description: "Your learning dashboard: current module, progress and recent results.",
  path: "/dashboard",
  noindex: true,
});

export default async function DashboardPage() {
  const user = await requirePageUser("/dashboard");

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { name: true, activeCourseId: true, activeCourse: { select: { slug: true } } },
  });

  const activeSlug = dbUser?.activeCourse?.slug ?? null;
  const [view, enrollments] = await Promise.all([
    activeSlug ? getLearningView(user.id, activeSlug) : Promise.resolve(null),
    listEnrollmentSummaries(user.id, dbUser?.activeCourseId ?? null),
  ]);

  const firstName = (dbUser?.name ?? user.name).split(" ")[0];

  return (
    <main id="main">
      <Container className="py-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Welcome back, {firstName}</h1>
          <p className="text-[var(--color-ink-muted)]">
            {view
              ? `You're studying ${view.course.title}. Here's where you left off.`
              : "Pick a course to get started."}
          </p>
        </div>

        {!view ? (
          <div className="mt-8">
            <EmptyState
              title="No active course"
              description="Choose a language to start learning. You can switch or add another at any time."
              action={<ButtonLink href="/courses">Browse courses</ButtonLink>}
            />
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
              <Card>
                <CardBody>
                  <div className="flex items-center gap-3">
                    <CourseGlyph label={view.course.language} accent={view.course.accent} />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-[var(--color-ink-subtle)]">
                        Current course
                      </p>
                      <h2 className="text-lg font-semibold">{view.course.title}</h2>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="font-medium">Overall progress</span>
                      <span className="font-semibold">{view.overallPercent}%</span>
                    </div>
                    <ProgressBar
                      value={view.overallPercent}
                      label="Overall course completion"
                      className="mt-2"
                    />
                    <p className="mt-2 text-xs text-[var(--color-ink-subtle)]">
                      {view.completedModules} of {view.totalModules} modules completed
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    {view.courseCompleted ? (
                      <Badge tone="success">You have completed this course</Badge>
                    ) : view.currentModuleSlug ? (
                      <ButtonLink href={`/learn/${view.course.slug}/${view.currentModuleSlug}`}>
                        Continue learning
                      </ButtonLink>
                    ) : null}
                    <ButtonLink href={`/learn/${view.course.slug}`} variant="secondary">
                      View full course
                    </ButtonLink>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <h2 className="text-sm font-semibold">Recent results</h2>
                  {view.recentAttempts.length === 0 ? (
                    <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
                      No assessments taken yet.
                    </p>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {view.recentAttempts.map((attempt) => (
                        <li key={attempt.id} className="flex items-center justify-between text-sm">
                          <span className="truncate pr-2">{attempt.moduleTitle}</span>
                          <span className="flex shrink-0 items-center gap-2">
                            {attempt.percentage}%
                            <Badge tone={attempt.passed ? "success" : "danger"}>
                              {attempt.passed ? "Pass" : "Fail"}
                            </Badge>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardBody>
              </Card>
            </div>

            <section className="mt-10" aria-labelledby="modules-heading">
              <div className="flex items-center justify-between">
                <h2 id="modules-heading" className="text-xl font-semibold">
                  Your modules
                </h2>
                <Link
                  href={`/learn/${view.course.slug}`}
                  className="text-sm font-medium text-[var(--color-primary)] hover:underline"
                >
                  Open course
                </Link>
              </div>
              <div className="mt-4">
                <CourseModuleList courseSlug={view.course.slug} modules={view.modules} />
              </div>
            </section>
          </>
        )}

        <section className="mt-12" aria-labelledby="enrollments-heading">
          <div className="flex items-center justify-between">
            <h2 id="enrollments-heading" className="text-xl font-semibold">
              All your courses
            </h2>
            <Link
              href="/account"
              className="text-sm font-medium text-[var(--color-primary)] hover:underline"
            >
              Manage
            </Link>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((enrollment) => (
              <Card key={enrollment.courseSlug}>
                <CardBody>
                  <div className="flex items-center gap-2">
                    <CourseGlyph label={enrollment.language} accent={enrollment.accent} size={36} />
                    <h3 className="font-semibold">{enrollment.courseTitle}</h3>
                  </div>
                  <ProgressBar
                    value={enrollment.percent}
                    label={`${enrollment.courseTitle} progress`}
                    className="mt-3"
                  />
                  <p className="mt-2 text-xs text-[var(--color-ink-subtle)]">
                    {enrollment.completedModules} / {enrollment.totalModules} modules
                    {enrollment.isActive ? " · active" : ""}
                  </p>
                  <Link
                    href={`/learn/${enrollment.courseSlug}`}
                    className="mt-3 inline-block text-sm font-medium text-[var(--color-primary)] hover:underline"
                  >
                    Open &rarr;
                  </Link>
                </CardBody>
              </Card>
            ))}
            <Card className="border-dashed">
              <CardBody className="flex h-full flex-col items-start justify-center">
                <p className="text-sm font-medium">Add another language</p>
                <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                  Start a second course alongside this one.
                </p>
                <Link
                  href="/account"
                  className="mt-3 text-sm font-medium text-[var(--color-primary)] hover:underline"
                >
                  Choose a course &rarr;
                </Link>
              </CardBody>
            </Card>
          </div>
        </section>
      </Container>
    </main>
  );
}
