"use client";

import { useState } from "react";
import { Field, Input, Textarea } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Feedback";
import { useAdminMutation } from "@/components/admin/useAdminMutation";

export function QuizMetaForm({
  quizId,
  title,
  description,
}: {
  quizId: string;
  title: string;
  description: string;
}) {
  const { run, pending, error, fieldErrors, message } = useAdminMutation();
  const [values, setValues] = useState({ title, description });

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    await run(`/api/admin/quizzes/${quizId}`, values, {
      method: "PATCH",
      successMessage: "Assessment details saved.",
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {error ? <Alert tone="danger">{error}</Alert> : null}
      {message ? <Alert tone="success">{message}</Alert> : null}
      <Field label="Assessment title" htmlFor="quiz-title" error={fieldErrors.title}>
        <Input
          id="quiz-title"
          value={values.title}
          onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
          required
        />
      </Field>
      <Field label="Assessment description" htmlFor="quiz-desc" error={fieldErrors.description}>
        <Textarea
          id="quiz-desc"
          value={values.description}
          onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
          rows={2}
          required
        />
      </Field>
      <Button type="submit" disabled={pending} size="sm">
        {pending ? "Saving..." : "Save assessment details"}
      </Button>
    </form>
  );
}
