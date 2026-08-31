import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { listPublishedCourses } from "@/lib/data/courses";
import { getCurrentUser } from "@/lib/auth";
import { Container } from "@/components/layout/PageShell";
import { ButtonLink } from "@/components/ui/Button";
import { CourseCard } from "@/components/marketing/CourseCard";
import { JsonLd, courseSchema } from "@/components/seo/JsonLd";

export const metadata: Metadata = buildMetadata({
  title: "Coding Academy — Learn to code in Java, Python and HTML",
  description:
    "Free, structured coding courses. Create an account, pick Java, Python or HTML, and work through ordered modules. Pass each assessment at 80% to unlock the next.",
  path: "/",
  keywords: ["learn to code", "Java course", "Python course", "HTML course", "beginner programming"],
});

const steps = [
  {
    title: "Choose a language",
    body: "Start with Java, Python or HTML. Your choice becomes your learning path, and you can add another language later.",
  },
  {
    title: "Work through modules in order",
    body: "Each module has lessons with explanations, worked code examples and clear objectives. Read at your own pace.",
  },
  {
    title: "Pass the assessment to continue",
    body: "Every module ends with a quiz. Score at least 80% and the next module unlocks. Below that, review and retry as often as you need.",
  },
];

export default async function HomePage() {
  const [courses, user] = await Promise.all([listPublishedCourses(), getCurrentUser()]);

  return (
    <main id="main">
      <JsonLd data={courses.map((c) => courseSchema(c))} />

      <section className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <Container className="py-16 sm:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-primary)]">
              Learn to code, properly
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
              Structured programming courses that don&rsquo;t let you skip ahead
            </h1>
            <p className="mt-5 text-lg text-[var(--color-ink-muted)]">
              Coding Academy teaches Java, Python and HTML through ordered modules. You prove you
              understand each one, scoring 80% or more, before the next unlocks. No fluff, no
              lock-in, no cost.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {user ? (
                <ButtonLink href="/dashboard" size="lg">
                  Go to your dashboard
                </ButtonLink>
              ) : (
                <ButtonLink href="/signup" size="lg">
                  Create your free account
                </ButtonLink>
              )}
              <ButtonLink href="/courses" size="lg" variant="secondary">
                Browse the courses
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="courses-heading">
        <Container className="py-16">
          <h2 id="courses-heading" className="text-2xl font-bold">
            Three learning paths
          </h2>
          <p className="mt-2 max-w-2xl text-[var(--color-ink-muted)]">
            Each path is a full course with multiple modules, lessons and assessments.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </Container>
      </section>

      <section aria-labelledby="how-heading" className="border-y border-[var(--color-border)] bg-[var(--color-surface)]">
        <Container className="py-16">
          <h2 id="how-heading" className="text-2xl font-bold">
            How the 80% progression works
          </h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-canvas)] p-6">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{step.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-[var(--color-ink-muted)]">
            Read a fuller explanation on the{" "}
            <Link href="/how-it-works" className="font-medium text-[var(--color-primary)] underline">
              how it works
            </Link>{" "}
            page.
          </p>
        </Container>
      </section>

      <section>
        <Container className="py-16 text-center">
          <h2 className="text-2xl font-bold">Ready to start?</h2>
          <p className="mx-auto mt-2 max-w-xl text-[var(--color-ink-muted)]">
            Creating an account takes a moment and your progress is saved automatically as you go.
          </p>
          <div className="mt-6 flex justify-center">
            <ButtonLink href={user ? "/dashboard" : "/signup"} size="lg">
              {user ? "Continue learning" : "Create your free account"}
            </ButtonLink>
          </div>
        </Container>
      </section>
    </main>
  );
}
