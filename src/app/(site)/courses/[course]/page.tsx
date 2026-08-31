import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { getCourseOutline } from "@/lib/data/courses";
import { getCurrentUser } from "@/lib/auth";
import { Container } from "@/components/layout/PageShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Card, CardBody } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Feedback";
import { CourseGlyph } from "@/components/CourseGlyph";
import { JsonLd, courseSchema } from "@/components/seo/JsonLd";

type Params = { params: Promise<{ course: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { course: slug } = await params;
  const course = await getCourseOutline(slug);
  if (!course) {
    return buildMetadata({
      title: "Course not found",
      description: "This course could not be found.",
      path: `/courses/${slug}`,
      noindex: true,
    });
  }
  return buildMetadata({
    title: `${course.title} course`,
    description: course.description,
    path: `/courses/${course.slug}`,
    keywords: [`${course.language} course`, `learn ${course.language}`, `${course.language} for beginners`],
  });
}

export default async function CourseOutlinePage({ params }: Params) {
  const { course: slug } = await params;
  const [course, user] = await Promise.all([getCourseOutline(slug), getCurrentUser()]);
  if (!course) notFound();

  const totalLessons = course.modules.reduce((n, m) => n + m.lessonCount, 0);

  return (
    <main id="main">
      <Container className="py-10">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Courses", path: "/courses" },
            { name: course.title, path: `/courses/${course.slug}` },
          ]}
        />
        <JsonLd
          data={courseSchema({
            title: course.title,
            description: course.description,
            slug: course.slug,
            language: course.language,
          })}
        />

        <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <CourseGlyph label={course.language} accent={course.accent} size={52} />
              <h1 className="text-3xl font-bold">{course.title}</h1>
            </div>
            <p className="mt-3 text-lg text-[var(--color-ink-muted)]">{course.tagline}</p>
            <p className="mt-3 text-sm text-[var(--color-ink-subtle)]">
              {course.modules.length} modules &middot; {totalLessons} lessons &middot; assessment after
              every module
            </p>
          </div>
          <Card className="w-full shrink-0 md:w-72">
            <CardBody>
              <p className="text-sm text-[var(--color-ink-muted)]">
                {user
                  ? "Open this course from your dashboard to track progress."
                  : "Create a free account to start this course and save your progress."}
              </p>
              <div className="mt-4">
                {user ? (
                  <ButtonLink href={`/learn/${course.slug}`} fullWidth>
                    Go to course
                  </ButtonLink>
                ) : (
                  <ButtonLink href="/signup" fullWidth>
                    Start learning
                  </ButtonLink>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {course.outcomes.length > 0 ? (
          <section className="mt-10" aria-labelledby="outcomes-heading">
            <h2 id="outcomes-heading" className="text-xl font-semibold">
              What you&rsquo;ll be able to do
            </h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {course.outcomes.map((outcome) => (
                <li key={outcome} className="flex items-start gap-2 text-sm text-[var(--color-ink-muted)]">
                  <span aria-hidden="true" className="mt-1 text-[var(--color-success)]">
                    &#10003;
                  </span>
                  {outcome}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-12" aria-labelledby="modules-heading">
          <h2 id="modules-heading" className="text-xl font-semibold">
            Course modules
          </h2>
          <ol className="mt-4 space-y-4">
            {course.modules.map((module) => (
              <li key={module.id}>
                <Card>
                  <CardBody>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="neutral">Module {module.order}</Badge>
                      <span className="text-xs text-[var(--color-ink-subtle)]">
                        {module.lessonCount} lessons &middot; {module.questionCount}-question assessment
                        &middot; pass at {module.passingScore}%
                      </span>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold">{module.title}</h3>
                    <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{module.summary}</p>
                    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--color-ink-subtle)]">
                      {module.lessons.map((lesson) => (
                        <li key={lesson.slug}>&middot; {lesson.title}</li>
                      ))}
                    </ul>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ol>
        </section>

        <p className="mt-8 text-sm text-[var(--color-ink-muted)]">
          New to how the platform works?{" "}
          <Link href="/how-it-works" className="font-medium text-[var(--color-primary)] underline">
            Read about the 80% progression system
          </Link>
          .
        </p>
      </Container>
    </main>
  );
}
