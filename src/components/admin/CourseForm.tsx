"use client";

import { useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Feedback";
import { useAdminMutation } from "@/components/admin/useAdminMutation";

export type CourseFormValues = {
  id?: string;
  slug: string;
  title: string;
  language: string;
  tagline: string;
  description: string;
  outcomes: string[];
  accent: string;
  order: number;
  published: boolean;
};

export function CourseForm({ initial }: { initial?: Partial<CourseFormValues> }) {
  const editing = Boolean(initial?.id);
  const { run, pending, error, fieldErrors, message } = useAdminMutation();

  const [values, setValues] = useState<CourseFormValues>({
    slug: initial?.slug ?? "",
    title: initial?.title ?? "",
    language: initial?.language ?? "",
    tagline: initial?.tagline ?? "",
    description: initial?.description ?? "",
    outcomes: initial?.outcomes ?? [],
    accent: initial?.accent ?? "#2563eb",
    order: initial?.order ?? 0,
    published: initial?.published ?? true,
  });

  function set<K extends keyof CourseFormValues>(key: K, value: CourseFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const payload = {
      slug: values.slug,
      title: values.title,
      language: values.language,
      tagline: values.tagline,
      description: values.description,
      outcomes: values.outcomes.map((o) => o.trim()).filter(Boolean),
      accent: values.accent,
      order: Number(values.order),
      published: values.published,
    };
    await run(
      editing ? `/api/admin/courses/${initial!.id}` : "/api/admin/courses",
      payload,
      {
        method: editing ? "PATCH" : "POST",
        successMessage: editing ? "Course saved." : undefined,
        redirectTo: editing ? undefined : "/admin/courses",
      },
    );
  }

  return (
    <Card>
      <CardBody>
        {error ? <Alert tone="danger" className="mb-4">{error}</Alert> : null}
        {message ? <Alert tone="success" className="mb-4">{message}</Alert> : null}
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" htmlFor="title" error={fieldErrors.title}>
              <Input id="title" value={values.title} onChange={(e) => set("title", e.target.value)} required />
            </Field>
            <Field label="Language label" htmlFor="language" error={fieldErrors.language}>
              <Input
                id="language"
                value={values.language}
                onChange={(e) => set("language", e.target.value)}
                required
              />
            </Field>
          </div>
          <Field
            label="Slug"
            htmlFor="slug"
            hint="Lowercase, hyphenated. Used in the URL, e.g. /courses/python."
            error={fieldErrors.slug}
          >
            <Input id="slug" value={values.slug} onChange={(e) => set("slug", e.target.value)} required />
          </Field>
          <Field label="Tagline" htmlFor="tagline" error={fieldErrors.tagline}>
            <Input id="tagline" value={values.tagline} onChange={(e) => set("tagline", e.target.value)} required />
          </Field>
          <Field label="Description" htmlFor="description" error={fieldErrors.description}>
            <Textarea
              id="description"
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
              required
            />
          </Field>
          <Field
            label="Learning outcomes"
            htmlFor="outcomes"
            hint="One per line. Shown as the 'what you'll be able to do' list."
            error={fieldErrors.outcomes}
          >
            <Textarea
              id="outcomes"
              value={values.outcomes.join("\n")}
              onChange={(e) => set("outcomes", e.target.value.split("\n"))}
              rows={5}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Accent colour" htmlFor="accent" error={fieldErrors.accent}>
              <Input
                id="accent"
                type="text"
                value={values.accent}
                onChange={(e) => set("accent", e.target.value)}
                placeholder="#2563eb"
              />
            </Field>
            <Field label="Sort order" htmlFor="order" error={fieldErrors.order}>
              <Input
                id="order"
                type="number"
                min={0}
                value={values.order}
                onChange={(e) => set("order", Number(e.target.value))}
              />
            </Field>
            <Field label="Visibility" htmlFor="published">
              <label className="flex items-center gap-2 text-sm">
                <input
                  id="published"
                  type="checkbox"
                  checked={values.published}
                  onChange={(e) => set("published", e.target.checked)}
                />
                Published
              </label>
            </Field>
          </div>

          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : editing ? "Save course" : "Create course"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
