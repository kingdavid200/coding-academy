import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseForAdmin } from "@/lib/data/admin";
import { absoluteUrl } from "@/config/site";
import { AdminPageTitle } from "@/components/admin/AdminUI";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Feedback";
import { CourseForm } from "@/components/admin/CourseForm";
import { ModuleForm } from "@/components/admin/ModuleForm";
import { OrderControls } from "@/components/admin/OrderControls";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const metadata: Metadata = { title: "Edit course" };

type Params = { params: Promise<{ id: string }> };

export default async function AdminCourseDetailPage({ params }: Params) {
  const { id } = await params;
  const course = await getCourseForAdmin(id);
  if (!course) notFound();

  return (
    <div className="space-y-8">
      <AdminPageTitle
        title={course.title}
        description={
          <>
            Public page:{" "}
            <a
              href={`/courses/${course.slug}`}
              className="text-[var(--color-primary)] hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              {absoluteUrl(`/courses/${course.slug}`)}
            </a>
          </>
        }
        actions={
          <Link
            href="/admin/courses"
            className="rounded-md border border-[var(--color-border-strong)] px-3 py-2 text-sm hover:bg-[var(--color-surface-muted)]"
          >
            All courses
          </Link>
        }
      />

      <section>
        <h2 className="mb-3 text-lg font-semibold">Course details</h2>
        <CourseForm
          initial={{
            id: course.id,
            slug: course.slug,
            title: course.title,
            language: course.language,
            tagline: course.tagline,
            description: course.description,
            outcomes: course.outcomes,
            accent: course.accent,
            order: course.order,
            published: course.published,
          }}
        />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Modules ({course.modules.length})</h2>
        {course.modules.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-muted)]">
            No modules yet. Add the first one below.
          </p>
        ) : (
          <ul className="space-y-2">
            {course.modules.map((module) => (
              <li key={module.id}>
                <Card>
                  <CardBody className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div>
                      <p className="text-xs text-[var(--color-ink-subtle)]">
                        Module {module.order} &middot; {module._count.lessons} lessons &middot;{" "}
                        {module.quiz?._count.questions ?? 0} questions &middot; pass{" "}
                        {module.passingScore}%
                      </p>
                      <p className="font-medium">
                        <Link
                          href={`/admin/modules/${module.id}`}
                          className="text-[var(--color-primary)] hover:underline"
                        >
                          {module.title}
                        </Link>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={module.published ? "success" : "neutral"}>
                        {module.published ? "Published" : "Draft"}
                      </Badge>
                      <DeleteButton
                        url={`/api/admin/modules/${module.id}`}
                        label="Delete"
                        confirmText="Delete this module and its lessons?"
                      />
                    </div>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        )}

        {course.modules.length > 1 ? (
          <div className="mt-5">
            <h3 className="mb-2 text-sm font-semibold">Reorder modules</h3>
            <OrderControls
              url={`/api/admin/courses/${course.id}/modules/reorder`}
              noun="Module"
              items={course.modules.map((m) => ({ id: m.id, label: m.title }))}
            />
          </div>
        ) : null}

        <details className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <summary className="cursor-pointer text-sm font-semibold">Add a module</summary>
          <div className="mt-4">
            <ModuleForm courseId={course.id} />
          </div>
        </details>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-[var(--color-danger)]">Danger zone</h2>
        <Card>
          <CardBody className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[var(--color-ink-muted)]">
              Deleting a course removes its modules, lessons, quizzes and every student&rsquo;s
              progress in it.
            </p>
            <DeleteButton
              url={`/api/admin/courses/${course.id}`}
              label="Delete course"
              confirmText="Permanently delete this course?"
              redirectTo="/admin/courses"
              size="md"
            />
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
