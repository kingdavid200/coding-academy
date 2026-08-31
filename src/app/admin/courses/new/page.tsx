import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageTitle } from "@/components/admin/AdminUI";
import { CourseForm } from "@/components/admin/CourseForm";

export const metadata: Metadata = { title: "New course" };

export default function NewCoursePage() {
  return (
    <div>
      <AdminPageTitle
        title="New course"
        description="After creating the course, open it to add modules, lessons and questions."
        actions={
          <Link
            href="/admin/courses"
            className="rounded-md border border-[var(--color-border-strong)] px-3 py-2 text-sm hover:bg-[var(--color-surface-muted)]"
          >
            Cancel
          </Link>
        }
      />
      <CourseForm />
    </div>
  );
}
