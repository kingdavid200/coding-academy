import type { Metadata } from "next";
import Link from "next/link";
import { getAdminOverview } from "@/lib/data/admin";
import { AdminPageTitle, StatTile } from "@/components/admin/AdminUI";
import { Card, CardBody } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Overview" };

export default async function AdminOverviewPage() {
  const data = await getAdminOverview();

  return (
    <div>
      <AdminPageTitle title="Overview" description="Platform activity at a glance." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatTile label="Students" value={data.studentCount} />
        <StatTile label="Course enrolments" value={data.enrollmentCount} />
        <StatTile
          label="Courses completed"
          value={data.completedCourses}
          hint="All modules passed"
        />
        <StatTile label="Courses" value={data.courseCount} hint={`${data.moduleCount} modules`} />
        <StatTile label="Lessons" value={data.lessonCount} />
        <StatTile
          label="Assessment pass rate"
          value={`${data.passRate}%`}
          hint={`${data.attemptCount} submitted attempts`}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardBody>
            <h2 className="text-sm font-semibold">Newest students</h2>
            {data.recentStudents.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--color-ink-muted)]">No students yet.</p>
            ) : (
              <ul className="mt-3 divide-y divide-[var(--color-border)]">
                {data.recentStudents.map((student) => (
                  <li key={student.id} className="flex items-center justify-between py-2 text-sm">
                    <Link
                      href={`/admin/students/${student.id}`}
                      className="font-medium hover:underline"
                    >
                      {student.name}
                    </Link>
                    <span className="text-[var(--color-ink-subtle)]">
                      {student.activeCourse?.title ?? "No course"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/admin/students"
              className="mt-3 inline-block text-sm font-medium text-[var(--color-primary)] hover:underline"
            >
              All students &rarr;
            </Link>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h2 className="text-sm font-semibold">Manage content</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/admin/courses" className="font-medium text-[var(--color-primary)] hover:underline">
                  Courses, modules, lessons and quizzes &rarr;
                </Link>
              </li>
              <li>
                <Link href="/admin/stats" className="font-medium text-[var(--color-primary)] hover:underline">
                  Module completion statistics &rarr;
                </Link>
              </li>
              <li>
                <Link href="/admin/settings" className="font-medium text-[var(--color-primary)] hover:underline">
                  Default passing percentage &rarr;
                </Link>
              </li>
            </ul>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
