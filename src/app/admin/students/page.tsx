import type { Metadata } from "next";
import Link from "next/link";
import { listStudents } from "@/lib/data/admin";
import { AdminPageTitle, AdminTable } from "@/components/admin/AdminUI";
import { EmptyState } from "@/components/ui/Feedback";

export const metadata: Metadata = { title: "Students" };

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(date);
}

export default async function AdminStudentsPage() {
  const students = await listStudents();

  return (
    <div>
      <AdminPageTitle
        title="Students"
        description={`${students.length} registered ${students.length === 1 ? "student" : "students"}.`}
      />

      {students.length === 0 ? (
        <EmptyState title="No students yet" description="Student accounts will appear here." />
      ) : (
        <AdminTable
          caption="Registered students"
          head={
            <>
              <th className="px-4 py-2.5 font-semibold">Name</th>
              <th className="px-4 py-2.5 font-semibold">Email</th>
              <th className="px-4 py-2.5 font-semibold">Active course</th>
              <th className="px-4 py-2.5 font-semibold">Courses</th>
              <th className="px-4 py-2.5 font-semibold">Attempts</th>
              <th className="px-4 py-2.5 font-semibold">Joined</th>
              <th className="px-4 py-2.5 font-semibold">Last active</th>
            </>
          }
        >
          {students.map((student) => (
            <tr key={student.id} className="hover:bg-[var(--color-surface-muted)]">
              <td className="px-4 py-2.5">
                <Link
                  href={`/admin/students/${student.id}`}
                  className="font-medium text-[var(--color-primary)] hover:underline"
                >
                  {student.name}
                </Link>
              </td>
              <td className="px-4 py-2.5 text-[var(--color-ink-muted)]">{student.email}</td>
              <td className="px-4 py-2.5 text-[var(--color-ink-muted)]">
                {student.activeCourse?.title ?? "—"}
              </td>
              <td className="px-4 py-2.5 text-[var(--color-ink-muted)]">
                {student._count.enrollments}
              </td>
              <td className="px-4 py-2.5 text-[var(--color-ink-muted)]">
                {student._count.quizAttempts}
              </td>
              <td className="px-4 py-2.5 text-[var(--color-ink-muted)]">
                {formatDate(student.createdAt)}
              </td>
              <td className="px-4 py-2.5 text-[var(--color-ink-muted)]">
                {formatDate(student.lastActiveAt)}
              </td>
            </tr>
          ))}
        </AdminTable>
      )}
    </div>
  );
}
