import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { listPublishedCourses } from "@/lib/data/courses";
import { Container, PageHeader } from "@/components/layout/PageShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CourseCard } from "@/components/marketing/CourseCard";
import { JsonLd, courseSchema } from "@/components/seo/JsonLd";

export const metadata: Metadata = buildMetadata({
  title: "All courses",
  description:
    "Browse every Coding Academy course. Structured, module-by-module paths for Java, Python and HTML, each with lessons, worked examples and assessments.",
  path: "/courses",
});

export default async function CoursesPage() {
  const courses = await listPublishedCourses();

  return (
    <main id="main">
      <Container className="py-10">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Courses", path: "/courses" }]} />
        <JsonLd data={courses.map((c) => courseSchema(c))} />

        <div className="mt-6">
          <PageHeader
            title="Courses"
            description="Pick a language to see its full module structure. You can start any course for free after creating an account."
          />
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </Container>
    </main>
  );
}
