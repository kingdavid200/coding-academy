import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { requirePageUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { listPublishedCourses } from "@/lib/data/courses";
import { Container, PageHeader } from "@/components/layout/PageShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ProfileForm, PasswordForm, CoursesForm } from "./AccountForms";

export const metadata: Metadata = buildMetadata({
  title: "Account settings",
  description: "Manage your Coding Academy account, password and active course.",
  path: "/account",
  noindex: true,
});

export default async function AccountPage() {
  const user = await requirePageUser("/account");

  const [record, enrollments, courses] = await Promise.all([
    db.user.findUnique({ where: { id: user.id }, select: { name: true, email: true, activeCourseId: true } }),
    db.enrollment.findMany({ where: { userId: user.id }, select: { courseId: true } }),
    listPublishedCourses(),
  ]);

  const enrolledIds = new Set(enrollments.map((e) => e.courseId));

  const courseRows = courses.map((c) => ({
    slug: c.slug,
    title: c.title,
    tagline: c.tagline,
    enrolled: enrolledIds.has(c.id),
    active: c.id === record?.activeCourseId,
  }));

  return (
    <main id="main">
      <Container width="narrow" className="py-10">
        <Breadcrumbs
          items={[
            { name: "Dashboard", path: "/dashboard" },
            { name: "Account", path: "/account" },
          ]}
        />
        <div className="mt-6">
          <PageHeader
            title="Account settings"
            description={`Signed in as ${record?.email ?? user.email}`}
          />
        </div>

        <div className="mt-8 space-y-6">
          <ProfileForm name={record?.name ?? user.name} />
          <CoursesForm courses={courseRows} />
          <PasswordForm />
        </div>
      </Container>
    </main>
  );
}
