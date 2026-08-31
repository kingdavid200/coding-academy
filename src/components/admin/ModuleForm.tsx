"use client";

import { useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Feedback";
import { useAdminMutation } from "@/components/admin/useAdminMutation";

export type ModuleFormValues = {
  id?: string;
  slug: string;
  title: string;
  summary: string;
  objectives: string[];
  passingScore: number;
  published: boolean;
};

export function ModuleForm({
  courseId,
  initial,
  onDone,
}: {
  courseId: string;
  initial?: Partial<ModuleFormValues>;
  onDone?: () => void;
}) {
  const editing = Boolean(initial?.id);
  const { run, pending, error, fieldErrors, message } = useAdminMutation();

  const [values, setValues] = useState<ModuleFormValues>({
    slug: initial?.slug ?? "",
    title: initial?.title ?? "",
    summary: initial?.summary ?? "",
    objectives: initial?.objectives ?? [],
    passingScore: initial?.passingScore ?? 80,
    published: initial?.published ?? true,
  });

  function set<K extends keyof ModuleFormValues>(key: K, value: ModuleFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const payload = {
      ...(editing ? {} : { courseId }),
      slug: values.slug,
      title: values.title,
      summary: values.summary,
      objectives: values.objectives.map((o) => o.trim()).filter(Boolean),
      passingScore: Number(values.passingScore),
      published: values.published,
    };
    const result = await run(
      editing ? `/api/admin/modules/${initial!.id}` : "/api/admin/modules",
      payload,
      { method: editing ? "PATCH" : "POST", successMessage: editing ? "Module saved." : "Module created." },
    );
    if (result.ok && !editing) {
      setValues({ slug: "", title: "", summary: "", objectives: [], passingScore: 80, published: true });
      onDone?.();
    }
  }

  return (
    <Card>
      <CardBody>
        {error ? <Alert tone="danger" className="mb-4">{error}</Alert> : null}
        {message ? <Alert tone="success" className="mb-4">{message}</Alert> : null}
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Field label="Title" htmlFor="m-title" error={fieldErrors.title}>
            <Input id="m-title" value={values.title} onChange={(e) => set("title", e.target.value)} required />
          </Field>
          <Field label="Slug" htmlFor="m-slug" error={fieldErrors.slug} hint="Unique within the course.">
            <Input id="m-slug" value={values.slug} onChange={(e) => set("slug", e.target.value)} required />
          </Field>
          <Field label="Summary" htmlFor="m-summary" error={fieldErrors.summary}>
            <Textarea
              id="m-summary"
              value={values.summary}
              onChange={(e) => set("summary", e.target.value)}
              rows={3}
              required
            />
          </Field>
          <Field
            label="Learning objectives"
            htmlFor="m-objectives"
            hint="One per line."
            error={fieldErrors.objectives}
          >
            <Textarea
              id="m-objectives"
              value={values.objectives.join("\n")}
              onChange={(e) => set("objectives", e.target.value.split("\n"))}
              rows={4}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Passing score (%)"
              htmlFor="m-passing"
              error={fieldErrors.passingScore}
              hint="Minimum assessment score to unlock the next module."
            >
              <Input
                id="m-passing"
                type="number"
                min={1}
                max={100}
                value={values.passingScore}
                onChange={(e) => set("passingScore", Number(e.target.value))}
              />
            </Field>
            <Field label="Visibility" htmlFor="m-published">
              <label className="flex items-center gap-2 text-sm">
                <input
                  id="m-published"
                  type="checkbox"
                  checked={values.published}
                  onChange={(e) => set("published", e.target.checked)}
                />
                Published
              </label>
            </Field>
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : editing ? "Save module" : "Add module"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
