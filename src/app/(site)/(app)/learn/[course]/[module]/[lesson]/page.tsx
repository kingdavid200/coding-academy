import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { requirePageUser } from "@/lib/auth";
import { getLessonView } from "@/lib/data/learning";
import { renderMarkdown } from "@/lib/markdown";
import { Container } from "@/components/layout/PageShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Alert } from "@/components/ui/Feedback";
import { ButtonLink } from "@/components/ui/Button";
import { LessonCompleteButton } from "@/components/learn/LessonCompleteButton";

type Params = { params: Promise<{ course: string; module: string; lesson: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { course, module: moduleSlug, lesson: lessonSlug } = await params;
  const user = await requirePageUser();
  const view = await getLessonView(user.id, course, moduleSlug, lessonSlug);
  return buildMetadata({
    title: view ? `${view.lesson.title} — ${view.course.title}` : "Lesson",
    description: view?.lesson.summary ?? "Lesson",
    path: `/learn/${course}/${moduleSlug}/${lessonSlug}`,
    noindex: true,
  });
}

export default async function LessonPage({ params }: Params) {
  const { course, module: moduleSlug, lesson: lessonSlug } = await params;
  const user = await requirePageUser(`/learn/${course}/${moduleSlug}/${lessonSlug}`);
  const view = await getLessonView(user.id, course, moduleSlug, lessonSlug);
  if (!view) notFound();

  if (view.module.state === "LOCKED") {
    return (
      <main id="main">
        <Container width="narrow" className="py-10">
          <Breadcrumbs
            items={[
              { name: "Dashboard", path: "/dashboard" },
              { name: view.course.title, path: `/learn/${course}` },
              { name: view.module.title, path: `/learn/${course}/${moduleSlug}` },
            ]}
          />
          <Alert tone="warning" title="This lesson is locked" className="mt-6">
            {view.module.lockReason ??
              "Complete the previous module's assessment to unlock this content."}
          </Alert>
          <div className="mt-4">
            <ButtonLink href={`/learn/${course}`} variant="secondary">
              Back to course
            </ButtonLink>
          </div>
        </Container>
      </main>
    );
  }

  const html = await renderMarkdown(view.lesson.content);

  const nextHref = view.nextLessonSlug
    ? `/learn/${course}/${moduleSlug}/${view.nextLessonSlug}`
    : view.quizIsNext
      ? `/learn/${course}/${moduleSlug}/quiz`
      : `/learn/${course}/${moduleSlug}`;
  const nextLabel = view.nextLessonSlug
    ? "Next lesson"
    : view.quizIsNext
      ? "Go to the assessment"
      : "Back to module";

  return (
    <main id="main">
      <Container width="narrow" className="py-10">
        <Breadcrumbs
          items={[
            { name: "Dashboard", path: "/dashboard" },
            { name: view.course.title, path: `/learn/${course}` },
            { name: view.module.title, path: `/learn/${course}/${moduleSlug}` },
            { name: view.lesson.title, path: `/learn/${course}/${moduleSlug}/${lessonSlug}` },
          ]}
        />

        <article className="mt-6">
          <header>
            <p className="text-xs font-semibold text-[var(--color-ink-subtle)]">
              Lesson {view.lesson.order} &middot; {view.lesson.estimatedMinutes} min read
            </p>
            <h1 className="mt-1 text-3xl font-bold">{view.lesson.title}</h1>
            <p className="mt-2 text-[var(--color-ink-muted)]">{view.lesson.summary}</p>
          </header>

          {view.lesson.objectives.length > 0 ? (
            <div className="mt-6 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
              <h2 className="text-sm font-semibold">In this lesson</h2>
              <ul className="mt-2 space-y-1 text-sm text-[var(--color-ink-muted)]">
                {view.lesson.objectives.map((objective) => (
                  <li key={objective} className="flex items-start gap-2">
                    <span aria-hidden="true" className="mt-1 text-[var(--color-primary)]">
                      &bull;
                    </span>
                    {objective}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div
            className="lesson-content mt-8"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>

        <hr className="my-8 border-[var(--color-border)]" />

        <LessonCompleteButton
          lessonId={view.lesson.id}
          completed={view.lesson.completed}
          nextHref={nextHref}
          nextLabel={nextLabel}
        />

        <nav className="mt-8 flex justify-between text-sm" aria-label="Lesson navigation">
          {view.prevLessonSlug ? (
            <Link
              href={`/learn/${course}/${moduleSlug}/${view.prevLessonSlug}`}
              className="font-medium text-[var(--color-primary)] hover:underline"
            >
              &larr; Previous lesson
            </Link>
          ) : (
            <Link
              href={`/learn/${course}/${moduleSlug}`}
              className="font-medium text-[var(--color-primary)] hover:underline"
            >
              &larr; Module overview
            </Link>
          )}
        </nav>
      </Container>
    </main>
  );
}
