import type { Metadata } from "next";
import Link from "next/link";
import { listCoursesForAdmin } from "@/lib/data/admin";
import { AdminPageTitle, AdminTable } from "@/components/admin/AdminUI";
import { Badge } from "@/components/ui/Feedback";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Courses" };

export default async function AdminCoursesPage() {
  const courses = await listCoursesForAdmin();

  return (
    <div>
      <AdminPageTitle
        title="Courses"
        description="Create and manage learning paths, their modules, lessons and assessments."
        actions={<ButtonLink href="/admin/courses/new" size="sm">New course</ButtonLink>}
      />

      <AdminTable
        caption="All courses"
        head={
          <>
            <th className="px-4 py-2.5 font-semibold">Course</th>
            <th className="px-4 py-2.5 font-semibold">Slug</th>
            <th className="px-4 py-2.5 font-semibold">Modules</th>
            <th className="px-4 py-2.5 font-semibold">Enrolments</th>
            <th className="px-4 py-2.5 font-semibold">Status</th>
          </>
        }
      >
        {courses.map((course) => (
          <tr key={course.id} className="hover:bg-[var(--color-surface-muted)]">
            <td className="px-4 py-2.5">
              <Link
                href={`/admin/courses/${course.id}`}
                className="font-medium text-[var(--color-primary)] hover:underline"
              >
                {course.title}
              </Link>
            </td>
            <td className="px-4 py-2.5 font-mono text-xs text-[var(--color-ink-muted)]">
              {course.slug}
            </td>
            <td className="px-4 py-2.5 text-[var(--color-ink-muted)]">{course._count.modules}</td>
            <td className="px-4 py-2.5 text-[var(--color-ink-muted)]">{course._count.enrollments}</td>
            <td className="px-4 py-2.5">
              <Badge tone={course.published ? "success" : "neutral"}>
                {course.published ? "Published" : "Draft"}
              </Badge>
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
