"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { GradedResult, QuizForTaking } from "@/lib/quiz-types";
import { Card, CardBody } from "@/components/ui/Card";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Alert, Spinner } from "@/components/ui/Feedback";
import { QuizResult } from "@/components/learn/QuizResult";
import { apiFetch } from "@/lib/api-client";

type Phase = "loading" | "error" | "taking" | "submitting" | "done";

export function QuizRunner({ courseSlug, moduleSlug }: { courseSlug: string; moduleSlug: string }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<QuizForTaking | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<GradedResult | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await apiFetch<QuizForTaking>(
        `/api/quiz/${courseSlug}/${moduleSlug}/start`,
        { json: {} },
      );
      if (cancelled) return;
      if (!res.ok) {
        setError(res.error);
        setPhase("error");
        return;
      }
      setQuiz(res.data);
      setPhase("taking");
    })();
    return () => {
      cancelled = true;
    };
  }, [courseSlug, moduleSlug]);

  const unanswered = useMemo(() => {
    if (!quiz) return [];
    return quiz.questions.filter((q) => !answers[q.id]).map((q) => q.id);
  }, [quiz, answers]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!quiz) return;
    if (unanswered.length > 0) {
      setShowValidation(true);
      const first = document.getElementById(`question-${unanswered[0]}`);
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setPhase("submitting");
    setError(null);
    const res = await apiFetch<GradedResult>(
      `/api/quiz/attempts/${quiz.attemptId}/submit`,
      {
        json: {
          responses: quiz.questions.map((q) => ({
            questionId: q.id,
            optionId: answers[q.id] ?? null,
          })),
        },
      },
    );
    if (!res.ok) {
      setError(res.error);
      setPhase("taking");
      return;
    }
    setResult(res.data);
    setPhase("done");
    router.refresh();
  }

  if (phase === "loading") {
    return (
      <div className="flex items-center gap-3 text-sm text-[var(--color-ink-muted)]">
        <Spinner /> Preparing your assessment...
      </div>
    );
  }

  if (phase === "error") {
    return (
      <Alert tone="danger" title="Can't start this assessment">
        <p>{error}</p>
        <div className="mt-3">
          <ButtonLink href={`/learn/${courseSlug}/${moduleSlug}`} variant="secondary" size="sm">
            Back to the module
          </ButtonLink>
        </div>
      </Alert>
    );
  }

  if (phase === "done" && result) {
    return <QuizResult result={result} />;
  }

  if (!quiz) return null;

  return (
    <form onSubmit={onSubmit} noValidate>
      <p className="text-sm text-[var(--color-ink-muted)]">{quiz.quiz.description}</p>

      {showValidation && unanswered.length > 0 ? (
        <Alert tone="warning" className="mt-4">
          Please answer every question. {unanswered.length} still need an answer.
        </Alert>
      ) : null}
      {error ? (
        <Alert tone="danger" className="mt-4">
          {error}
        </Alert>
      ) : null}

      <ol className="mt-5 space-y-4">
        {quiz.questions.map((question, index) => {
          const missing = showValidation && !answers[question.id];
          return (
            <li key={question.id} id={`question-${question.id}`}>
              <Card className={missing ? "border-[var(--color-danger)]" : undefined}>
                <CardBody>
                  <fieldset>
                    <legend className="font-medium">
                      {index + 1}. {question.prompt}
                    </legend>
                    <div className="mt-3 space-y-2">
                      {question.options.map((option) => (
                        <label
                          key={option.id}
                          className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] px-3 py-2 text-sm hover:bg-[var(--color-surface-muted)] has-[:checked]:border-[var(--color-primary)] has-[:checked]:bg-[var(--color-primary-soft)]"
                        >
                          <input
                            type="radio"
                            name={question.id}
                            value={option.id}
                            checked={answers[question.id] === option.id}
                            onChange={() =>
                              setAnswers((prev) => ({ ...prev, [question.id]: option.id }))
                            }
                            className="mt-0.5"
                          />
                          <span>{option.text}</span>
                        </label>
                      ))}
                    </div>
                    {missing ? (
                      <p className="mt-2 text-xs font-medium text-[var(--color-danger)]">
                        Choose an answer for this question.
                      </p>
                    ) : null}
                  </fieldset>
                </CardBody>
              </Card>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={phase === "submitting"}>
          {phase === "submitting" ? "Submitting..." : "Submit assessment"}
        </Button>
        <ButtonLink href={`/learn/${courseSlug}/${moduleSlug}`} variant="ghost">
          Cancel
        </ButtonLink>
      </div>
    </form>
  );
}
