"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Feedback";
import { apiFetch } from "@/lib/api-client";

type CourseChoice = { slug: string; title: string; tagline: string };

export function SignupForm({ courses }: { courses: CourseChoice[] }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [courseSlug, setCourseSlug] = useState(courses[0]?.slug ?? "");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFormError(null);
    setFieldErrors({});

    const form = new FormData(event.currentTarget);
    const result = await apiFetch<{ redirectTo: string }>("/api/auth/signup", {
      json: {
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
        courseSlug,
      },
    });

    if (!result.ok) {
      setPending(false);
      if (result.fields) setFieldErrors(result.fields);
      setFormError(result.error);
      return;
    }

    router.push(result.data.redirectTo || "/dashboard");
    router.refresh();
  }

  return (
    <Card>
      <CardBody>
        <h1 className="text-xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Free forever. Your progress is saved automatically.
        </p>

        {formError ? (
          <Alert tone="danger" className="mt-4">
            {formError}
          </Alert>
        ) : null}

        <form onSubmit={onSubmit} className="mt-5 space-y-4" noValidate>
          <Field label="Name" htmlFor="name" error={fieldErrors.name}>
            <Input id="name" name="name" autoComplete="name" required aria-invalid={Boolean(fieldErrors.name)} />
          </Field>
          <Field label="Email address" htmlFor="email" error={fieldErrors.email}>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              aria-invalid={Boolean(fieldErrors.email)}
            />
          </Field>
          <Field
            label="Password"
            htmlFor="password"
            hint="At least 10 characters, with an uppercase letter, a lowercase letter and a number."
            error={fieldErrors.password}
          >
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={10}
              aria-invalid={Boolean(fieldErrors.password)}
            />
          </Field>

          <fieldset className="border-0 p-0">
            <legend className="text-sm font-medium text-[var(--color-ink)]">
              Which language do you want to learn first?
            </legend>
            {fieldErrors.courseSlug ? (
              <p className="mt-1 text-xs font-medium text-[var(--color-danger)]">
                {fieldErrors.courseSlug}
              </p>
            ) : null}
            <div className="mt-2 space-y-2">
              {courses.map((course) => (
                <label
                  key={course.slug}
                  className="flex cursor-pointer items-start gap-3 rounded-[var(--radius)] border border-[var(--color-border-strong)] p-3 hover:bg-[var(--color-surface-muted)] has-[:checked]:border-[var(--color-primary)] has-[:checked]:bg-[var(--color-primary-soft)]"
                >
                  <input
                    type="radio"
                    name="courseSlug"
                    value={course.slug}
                    checked={courseSlug === course.slug}
                    onChange={() => setCourseSlug(course.slug)}
                    className="mt-1"
                  />
                  <span>
                    <span className="block text-sm font-medium text-[var(--color-ink)]">
                      {course.title}
                    </span>
                    <span className="block text-xs text-[var(--color-ink-muted)]">
                      {course.tagline}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <Button type="submit" fullWidth disabled={pending}>
            {pending ? "Creating your account..." : "Create account"}
          </Button>
        </form>

        <p className="mt-4 text-sm text-[var(--color-ink-muted)]">
          Already have an account?{" "}
          <a href="/login" className="font-medium text-[var(--color-primary)] hover:underline">
            Sign in
          </a>
        </p>
      </CardBody>
    </Card>
  );
}
