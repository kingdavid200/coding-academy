"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api-client";

export function LessonCompleteButton({
  lessonId,
  completed,
  nextHref,
  nextLabel,
}: {
  lessonId: string;
  completed: boolean;
  nextHref: string;
  nextLabel: string;
}) {
  const router = useRouter();
  const [done, setDone] = useState(completed);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function markRead() {
    setPending(true);
    setError(null);
    const result = await apiFetch<{ completed: boolean }>(`/api/lessons/${lessonId}/complete`, {
      json: {},
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDone(true);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {done ? (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-success)]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m5 13 4 4 10-10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Marked as read
        </span>
      ) : (
        <Button onClick={markRead} disabled={pending} variant="secondary">
          {pending ? "Saving..." : "Mark as read"}
        </Button>
      )}
      <ButtonLink href={nextHref}>{nextLabel}</ButtonLink>
      {error ? (
        <p role="alert" className="w-full text-sm text-[var(--color-danger)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
