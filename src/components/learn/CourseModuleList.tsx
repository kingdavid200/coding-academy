import Link from "next/link";
import type { LearningModule } from "@/lib/data/learning";
import { Card, CardBody } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/Feedback";
import { ModuleStatusBadge } from "@/components/learn/ModuleStatus";

export function CourseModuleList({
  courseSlug,
  modules,
}: {
  courseSlug: string;
  modules: LearningModule[];
}) {
  return (
    <ol className="space-y-3">
      {modules.map((module) => {
        const locked = module.state === "LOCKED";
        const href = `/learn/${courseSlug}/${module.slug}`;
        const lessonProgressLabel = `${module.completedLessonCount} of ${module.lessonCount} lessons read`;

        return (
          <li key={module.id}>
            <Card className={locked ? "opacity-80" : undefined}>
              <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-[var(--color-ink-subtle)]">
                      Module {module.order}
                    </span>
                    <ModuleStatusBadge state={module.state} />
                    {module.attemptsCount > 0 ? (
                      <span className="text-xs text-[var(--color-ink-subtle)]">
                        Best score {module.bestScore}%
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-1 truncate text-base font-semibold">
                    {locked ? (
                      module.title
                    ) : (
                      <Link href={href} className="hover:underline">
                        {module.title}
                      </Link>
                    )}
                  </h3>
                  {locked ? (
                    <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{module.lockReason}</p>
                  ) : (
                    <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{lessonProgressLabel}</p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-3 sm:w-44 sm:flex-col sm:items-stretch">
                  {!locked ? (
                    <>
                      <ProgressBar
                        value={
                          module.lessonCount === 0
                            ? module.passed
                              ? 100
                              : 0
                            : (module.completedLessonCount / module.lessonCount) * 100
                        }
                        label={`${module.title} lesson progress`}
                      />
                      <Link
                        href={href}
                        className="text-sm font-medium text-[var(--color-primary)] hover:underline"
                      >
                        {module.state === "COMPLETED"
                          ? "Review module"
                          : module.state === "IN_PROGRESS"
                            ? "Continue"
                            : "Start module"}
                        <span aria-hidden="true"> &rarr;</span>
                      </Link>
                    </>
                  ) : (
                    <span className="text-sm text-[var(--color-ink-subtle)]">Locked</span>
                  )}
                </div>
              </CardBody>
            </Card>
          </li>
        );
      })}
    </ol>
  );
}
