import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStudentDetail } from "@/lib/data/admin";
import { AdminPageTitle, AdminTable } from "@/components/admin/AdminUI";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge, ProgressBar } from "@/components/ui/Feedback";
import { ModuleStatusBadge } from "@/components/learn/ModuleStatus";

export const metadata: Metadata = { title: "Student progress" };

type Params = { params: Promise<{ id: string }> };

export default async function StudentDetailPage({ params }: Params) {
  const { id } = await params;
  const detail = await getStudentDetail(id);
  if (!detail) notFound();

  const { student, courses, attempts } = detail;

  return (
    <div>
      <AdminPageTitle
        title={student.name}
        description={
          <>
            {student.email} &middot; joined{" "}
            {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(student.createdAt)}
          </>
        }
        actions={
          <Link
            href="/admin/students"
            className="rounded-md border border-[var(--color-border-strong)] px-3 py-2 text-sm hover:bg-[var(--color-surface-muted)]"
          >
            Back to students
          </Link>
        }
      />

      <div className="space-y-6">
        {courses.length === 0 ? (
          <Card>
            <CardBody>
              <p className="text-sm text-[var(--color-ink-muted)]">
                This student is not enrolled in any course yet.
              </p>
            </CardBody>
          </Card>
        ) : (
          courses.map((course) => (
            <Card key={course.courseId}>
              <CardBody>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold">
                    {course.courseTitle}
                    {course.isActive ? (
                      <span className="ml-2 text-xs font-semibold text-[var(--color-primary)]">
                        Active
                      </span>
                    ) : null}
                  </h2>
                  {course.completedAt ? <Badge tone="success">Course complete</Badge> : null}
                </div>
                <ProgressBar
                  value={course.percent}
                  label={`${course.courseTitle} completion`}
                  className="mt-3"
                />
                <p className="mt-1 text-xs text-[var(--color-ink-subtle)]">
                  {course.percent}% complete
                </p>

                <ul className="mt-4 space-y-2">
                  {course.modules.map((module) => (
                    <li
                      key={module.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius)] border border-[var(--color-border)] px-3 py-2 text-sm"
                    >
                      <span className="font-medium">
                        {module.order}. {module.title}
                      </span>
                      <span className="flex items-center gap-2">
                        <ModuleStatusBadge state={module.state} />
                        <span className="text-[var(--color-ink-muted)]">
                          best {module.bestScore}% / need {module.passingScore}% &middot;{" "}
                          {module.attemptsCount}{" "}
                          {module.attemptsCount === 1 ? "attempt" : "attempts"}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ))
        )}

        <div>
          <h2 className="mb-3 text-lg font-semibold">Assessment history</h2>
          {attempts.length === 0 ? (
            <Card>
              <CardBody>
                <p className="text-sm text-[var(--color-ink-muted)]">No assessments submitted.</p>
              </CardBody>
            </Card>
          ) : (
            <AdminTable
              caption="Assessment attempts"
              head={
                <>
                  <th className="px-4 py-2.5 font-semibold">Course</th>
                  <th className="px-4 py-2.5 font-semibold">Module</th>
                  <th className="px-4 py-2.5 font-semibold">Score</th>
                  <th className="px-4 py-2.5 font-semibold">Result</th>
                  <th className="px-4 py-2.5 font-semibold">Submitted</th>
                </>
              }
            >
              {attempts.map((attempt) => (
                <tr key={attempt.id}>
                  <td className="px-4 py-2.5 text-[var(--color-ink-muted)]">{attempt.courseTitle}</td>
                  <td className="px-4 py-2.5">{attempt.moduleTitle}</td>
                  <td className="px-4 py-2.5 text-[var(--color-ink-muted)]">
                    {attempt.percentage}% ({attempt.score}/{attempt.total})
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge tone={attempt.passed ? "success" : "danger"}>
                      {attempt.passed ? "Passed" : "Not passed"}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5 text-[var(--color-ink-muted)]">
                    {attempt.submittedAt
                      ? new Intl.DateTimeFormat("en-GB", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(attempt.submittedAt)
                      : "—"}
                  </td>
                </tr>
              ))}
            </AdminTable>
          )}
        </div>
      </div>
    </div>
  );
}
