"use client";

import { useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Feedback";
import { useAdminMutation } from "@/components/admin/useAdminMutation";

export type LessonFormValues = {
  id?: string;
  slug: string;
  title: string;
  summary: string;
  objectives: string[];
  content: string;
  estimatedMinutes: number;
};

export function LessonForm({
  moduleId,
  initial,
  onDone,
}: {
  moduleId: string;
  initial?: Partial<LessonFormValues>;
  onDone?: () => void;
}) {
  const editing = Boolean(initial?.id);
  const { run, pending, error, fieldErrors, message } = useAdminMutation();

  const [values, setValues] = useState<LessonFormValues>({
    slug: initial?.slug ?? "",
    title: initial?.title ?? "",
    summary: initial?.summary ?? "",
    objectives: initial?.objectives ?? [],
    content: initial?.content ?? "",
    estimatedMinutes: initial?.estimatedMinutes ?? 8,
  });

  function set<K extends keyof LessonFormValues>(key: K, value: LessonFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const payload = {
      ...(editing ? {} : { moduleId }),
      slug: values.slug,
      title: values.title,
      summary: values.summary,
      objectives: values.objectives.map((o) => o.trim()).filter(Boolean),
      content: values.content,
      estimatedMinutes: Number(values.estimatedMinutes),
    };
    const result = await run(
      editing ? `/api/admin/lessons/${initial!.id}` : "/api/admin/lessons",
      payload,
      { method: editing ? "PATCH" : "POST", successMessage: editing ? "Lesson saved." : "Lesson added." },
    );
    if (result.ok && !editing) {
      setValues({ slug: "", title: "", summary: "", objectives: [], content: "", estimatedMinutes: 8 });
      onDone?.();
    }
  }

  return (
    <Card>
      <CardBody>
        {error ? <Alert tone="danger" className="mb-4">{error}</Alert> : null}
        {message ? <Alert tone="success" className="mb-4">{message}</Alert> : null}
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" htmlFor="l-title" error={fieldErrors.title}>
              <Input id="l-title" value={values.title} onChange={(e) => set("title", e.target.value)} required />
            </Field>
            <Field label="Slug" htmlFor="l-slug" error={fieldErrors.slug}>
              <Input id="l-slug" value={values.slug} onChange={(e) => set("slug", e.target.value)} required />
            </Field>
          </div>
          <Field label="Summary" htmlFor="l-summary" error={fieldErrors.summary} hint="Used in lists and as the meta description.">
            <Textarea id="l-summary" value={values.summary} onChange={(e) => set("summary", e.target.value)} rows={2} required />
          </Field>
          <Field label="Objectives" htmlFor="l-objectives" hint="One per line." error={fieldErrors.objectives}>
            <Textarea
              id="l-objectives"
              value={values.objectives.join("\n")}
              onChange={(e) => set("objectives", e.target.value.split("\n"))}
              rows={3}
            />
          </Field>
          <Field
            label="Content (Markdown)"
            htmlFor="l-content"
            hint="Markdown. Use fenced code blocks with a language for syntax highlighting. Raw HTML is not allowed."
            error={fieldErrors.content}
          >
            <Textarea
              id="l-content"
              value={values.content}
              onChange={(e) => set("content", e.target.value)}
              rows={16}
              className="font-mono text-xs"
              required
            />
          </Field>
          <Field label="Estimated minutes" htmlFor="l-mins" error={fieldErrors.estimatedMinutes}>
            <Input
              id="l-mins"
              type="number"
              min={1}
              max={180}
              value={values.estimatedMinutes}
              onChange={(e) => set("estimatedMinutes", Number(e.target.value))}
            />
          </Field>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : editing ? "Save lesson" : "Add lesson"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
