import Link from "next/link";
import type { GradedResult } from "@/lib/quiz-types";
import { Card, CardBody } from "@/components/ui/Card";
import { Alert, Badge } from "@/components/ui/Feedback";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export function QuizResult({ result }: { result: GradedResult }) {
  const moduleHref = `/learn/${result.courseSlug}/${result.moduleSlug}`;

  return (
    <div>
      <Card>
        <CardBody>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-[var(--color-ink-muted)]">Your score</p>
              <p className="text-4xl font-bold">
                {result.percentage}%
                <span className="ml-2 align-middle text-base font-normal text-[var(--color-ink-subtle)]">
                  {result.score} of {result.total} correct
                </span>
              </p>
            </div>
            <Badge tone={result.passed ? "success" : "danger"} className="text-sm">
              {result.passed ? "Passed" : "Not passed"}
            </Badge>
          </div>

          <div className="mt-4">
            {result.passed ? (
              <Alert tone="success" title="Module complete">
                You scored at or above the {result.passingScore}% pass mark.{" "}
                {result.nextModule
                  ? result.nextModuleUnlocked
                    ? `The next module, "${result.nextModule.title}", is now unlocked.`
                    : ""
                  : "You have finished the last module in this course."}
              </Alert>
            ) : (
              <Alert tone="warning" title="Not quite there yet">
                You need {result.passingScore}% to complete this module. Review the lessons and the
                explanations below, then retake the assessment. Your best score so far is{" "}
                {result.bestScore}%.
              </Alert>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {!result.passed ? (
              <ButtonLink href={`${moduleHref}/quiz`}>Retake assessment</ButtonLink>
            ) : result.nextModule && result.nextModuleUnlocked ? (
              <ButtonLink href={`/learn/${result.courseSlug}/${result.nextModule.slug}`}>
                Start the next module
              </ButtonLink>
            ) : (
              <ButtonLink href={`/learn/${result.courseSlug}`}>Back to course</ButtonLink>
            )}
            <ButtonLink href={moduleHref} variant="secondary">
              Module overview
            </ButtonLink>
          </div>
        </CardBody>
      </Card>

      <h2 className="mt-8 text-lg font-semibold">Question review</h2>
      <ol className="mt-3 space-y-4">
        {result.questions.map((question, index) => (
          <li key={question.id}>
            <Card>
              <CardBody>
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium">
                    {index + 1}. {question.prompt}
                  </p>
                  <Badge tone={question.correct ? "success" : "danger"}>
                    {question.correct ? "Correct" : "Incorrect"}
                  </Badge>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {question.options.map((option) => {
                    const isAnswer = option.isCorrect;
                    const isYours = option.chosen;
                    return (
                      <li
                        key={option.id}
                        className={cn(
                          "rounded-[var(--radius-sm)] border px-3 py-2 text-sm",
                          isAnswer
                            ? "border-[var(--color-success)] bg-[var(--color-success-soft)]"
                            : isYours
                              ? "border-[var(--color-danger)] bg-[var(--color-danger-soft)]"
                              : "border-[var(--color-border)]",
                        )}
                      >
                        <span>{option.text}</span>
                        {isAnswer ? (
                          <span className="ml-2 text-xs font-semibold text-[var(--color-success)]">
                            Correct answer
                          </span>
                        ) : null}
                        {isYours && !isAnswer ? (
                          <span className="ml-2 text-xs font-semibold text-[var(--color-danger)]">
                            Your answer
                          </span>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
                  <span className="font-semibold text-[var(--color-ink)]">Why: </span>
                  {question.explanation}
                </p>
              </CardBody>
            </Card>
          </li>
        ))}
      </ol>

      <p className="mt-6 text-sm">
        <Link href={moduleHref} className="font-medium text-[var(--color-primary)] hover:underline">
          &larr; Back to {result.moduleTitle}
        </Link>
      </p>
    </div>
  );
}
