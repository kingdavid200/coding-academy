import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getModuleForAdmin } from "@/lib/data/admin";
import { AdminPageTitle } from "@/components/admin/AdminUI";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Feedback";
import { ModuleForm } from "@/components/admin/ModuleForm";
import { LessonForm } from "@/components/admin/LessonForm";
import { QuestionForm } from "@/components/admin/QuestionForm";
import { QuizMetaForm } from "@/components/admin/QuizMetaForm";
import { OrderControls } from "@/components/admin/OrderControls";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const metadata: Metadata = { title: "Edit module" };

type Params = { params: Promise<{ id: string }> };

export default async function AdminModuleDetailPage({ params }: Params) {
  const { id } = await params;
  const mod = await getModuleForAdmin(id);
  if (!mod) notFound();

  return (
    <div className="space-y-10">
      <AdminPageTitle
        title={mod.title}
        description={
          <>
            In{" "}
            <Link
              href={`/admin/courses/${mod.course.id}`}
              className="text-[var(--color-primary)] hover:underline"
            >
              {mod.course.title}
            </Link>{" "}
            &middot; module {mod.order}
          </>
        }
        actions={
          <Link
            href={`/admin/courses/${mod.course.id}`}
            className="rounded-md border border-[var(--color-border-strong)] px-3 py-2 text-sm hover:bg-[var(--color-surface-muted)]"
          >
            Back to course
          </Link>
        }
      />

      <section>
        <h2 className="mb-3 text-lg font-semibold">Module details</h2>
        <ModuleForm
          courseId={mod.course.id}
          initial={{
            id: mod.id,
            slug: mod.slug,
            title: mod.title,
            summary: mod.summary,
            objectives: mod.objectives,
            passingScore: mod.passingScore,
            published: mod.published,
          }}
        />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Lessons ({mod.lessons.length})</h2>
        {mod.lessons.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-muted)]">No lessons yet.</p>
        ) : (
          <ul className="space-y-2">
            {mod.lessons.map((lesson) => (
              <li key={lesson.id}>
                <details className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
                  <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3">
                    <span className="text-sm">
                      <span className="mr-2 font-mono text-xs text-[var(--color-ink-subtle)]">
                        {lesson.order}
                      </span>
                      <span className="font-medium">{lesson.title}</span>
                    </span>
                    <span className="text-xs text-[var(--color-ink-subtle)]">
                      {lesson.estimatedMinutes} min
                    </span>
                  </summary>
                  <div className="border-t border-[var(--color-border)] p-4">
                    <LessonForm
                      moduleId={mod.id}
                      initial={{
                        id: lesson.id,
                        slug: lesson.slug,
                        title: lesson.title,
                        summary: lesson.summary,
                        objectives: lesson.objectives,
                        content: lesson.content,
                        estimatedMinutes: lesson.estimatedMinutes,
                      }}
                    />
                    <div className="mt-3">
                      <DeleteButton
                        url={`/api/admin/lessons/${lesson.id}`}
                        label="Delete this lesson"
                        confirmText="Delete this lesson?"
                      />
                    </div>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        )}

        {mod.lessons.length > 1 ? (
          <div className="mt-5">
            <h3 className="mb-2 text-sm font-semibold">Reorder lessons</h3>
            <OrderControls
              url={`/api/admin/modules/${mod.id}/lessons/reorder`}
              noun="Lesson"
              items={mod.lessons.map((l) => ({ id: l.id, label: l.title }))}
            />
          </div>
        ) : null}

        <details className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <summary className="cursor-pointer text-sm font-semibold">Add a lesson</summary>
          <div className="mt-4">
            <LessonForm moduleId={mod.id} />
          </div>
        </details>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Assessment</h2>
        {mod.quiz ? (
          <>
            <Card>
              <CardBody>
                <QuizMetaForm
                  quizId={mod.quiz.id}
                  title={mod.quiz.title}
                  description={mod.quiz.description}
                />
              </CardBody>
            </Card>

            <h3 className="mb-2 mt-6 text-sm font-semibold">
              Questions ({mod.quiz.questions.length})
            </h3>
            {mod.quiz.questions.length < 5 ? (
              <p className="mb-3 text-xs text-[var(--color-warning)]">
                An assessment should have at least 5 questions so an 80% pass mark is meaningful.
              </p>
            ) : null}
            <ul className="space-y-2">
              {mod.quiz.questions.map((question, index) => (
                <li key={question.id}>
                  <details className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
                    <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3">
                      <span className="text-sm font-medium">
                        {index + 1}. {question.prompt}
                      </span>
                      <Badge tone="neutral">{question.options.length} options</Badge>
                    </summary>
                    <div className="border-t border-[var(--color-border)] p-4">
                      <QuestionForm
                        quizId={mod.quiz!.id}
                        initial={{
                          id: question.id,
                          prompt: question.prompt,
                          explanation: question.explanation,
                          options: question.options.map((o) => ({
                            text: o.text,
                            isCorrect: o.isCorrect,
                          })),
                        }}
                      />
                      <div className="mt-3">
                        <DeleteButton
                          url={`/api/admin/questions/${question.id}`}
                          label="Delete this question"
                          confirmText="Delete this question?"
                        />
                      </div>
                    </div>
                  </details>
                </li>
              ))}
            </ul>

            <details className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <summary className="cursor-pointer text-sm font-semibold">Add a question</summary>
              <div className="mt-4">
                <QuestionForm quizId={mod.quiz.id} />
              </div>
            </details>
          </>
        ) : (
          <p className="text-sm text-[var(--color-ink-muted)]">
            This module has no assessment record. Recreate the module to add one.
          </p>
        )}
      </section>
    </div>
  );
}
