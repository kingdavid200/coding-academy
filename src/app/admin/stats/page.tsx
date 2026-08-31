import type { Metadata } from "next";
import { getCourseStatistics } from "@/lib/data/admin";
import { AdminPageTitle, AdminTable } from "@/components/admin/AdminUI";
import { Card, CardBody } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Statistics" };

export default async function AdminStatsPage() {
  const stats = await getCourseStatistics();

  return (
    <div className="space-y-8">
      <AdminPageTitle
        title="Statistics"
        description="Module completion and assessment performance per course."
      />

      {stats.map((course) => (
        <Card key={course.id}>
          <CardBody>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold">{course.title}</h2>
              <p className="text-sm text-[var(--color-ink-muted)]">
                {course.enrollments} enrolled &middot; {course.completions} completed the course
              </p>
            </div>

            <div className="mt-4">
              <AdminTable
                caption={`${course.title} module statistics`}
                head={
                  <>
                    <th className="px-4 py-2.5 font-semibold">Module</th>
                    <th className="px-4 py-2.5 font-semibold">Pass mark</th>
                    <th className="px-4 py-2.5 font-semibold">Students passed</th>
                    <th className="px-4 py-2.5 font-semibold">Attempts</th>
                    <th className="px-4 py-2.5 font-semibold">Attempt pass rate</th>
                  </>
                }
              >
                {course.modules.map((module) => (
                  <tr key={module.id}>
                    <td className="px-4 py-2.5">
                      {module.order}. {module.title}
                    </td>
                    <td className="px-4 py-2.5 text-[var(--color-ink-muted)]">
                      {module.passingScore}%
                    </td>
                    <td className="px-4 py-2.5 text-[var(--color-ink-muted)]">{module.completedBy}</td>
                    <td className="px-4 py-2.5 text-[var(--color-ink-muted)]">{module.attempts}</td>
                    <td className="px-4 py-2.5 text-[var(--color-ink-muted)]">
                      {module.attemptPassRate}%
                    </td>
                  </tr>
                ))}
              </AdminTable>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
