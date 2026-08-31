import Link from "next/link";
import type { CourseCard as CourseCardData } from "@/lib/data/courses";
import { Card } from "@/components/ui/Card";
import { CourseGlyph } from "@/components/CourseGlyph";

export function CourseCard({ course }: { course: CourseCardData }) {
  return (
    <Card as="article" className="relative flex h-full flex-col p-6 transition-shadow hover:shadow-lg">
      <div className="flex items-center gap-3">
        <CourseGlyph label={course.language} accent={course.accent} />
        <div>
          <h3 className="text-lg font-semibold">
            <Link
              href={`/courses/${course.slug}`}
              className="after:absolute after:inset-0 focus-visible:outline-none"
            >
              {course.title}
            </Link>
          </h3>
          <p className="text-xs text-[var(--color-ink-subtle)]">
            {course.moduleCount} modules &middot; {course.lessonCount} lessons
          </p>
        </div>
      </div>
      <p className="mt-3 flex-1 text-sm text-[var(--color-ink-muted)]">{course.tagline}</p>
      <p className="relative mt-4 text-sm font-medium text-[var(--color-primary)]">
        View the {course.title} course &rarr;
      </p>
    </Card>
  );
}
