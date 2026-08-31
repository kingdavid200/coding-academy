"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Feedback";
import { apiFetch } from "@/lib/api-client";

type Course = { slug: string; title: string; tagline: string; enrolled: boolean; active: boolean };

export function ProfileForm({ name }: { name: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    setError(null);
    const form = new FormData(event.currentTarget);
    const res = await apiFetch<{ name: string }>("/api/account/profile", {
      json: { name: form.get("name") },
    });
    setPending(false);
    if (!res.ok) {
      setError(res.fields?.name ?? res.error);
      return;
    }
    setMessage("Your name has been updated.");
    router.refresh();
  }

  return (
    <Card>
      <CardBody>
        <h2 className="text-lg font-semibold">Your details</h2>
        {message ? <Alert tone="success" className="mt-3">{message}</Alert> : null}
        {error ? <Alert tone="danger" className="mt-3">{error}</Alert> : null}
        <form onSubmit={onSubmit} className="mt-4 space-y-4" noValidate>
          <Field label="Name" htmlFor="name">
            <Input id="name" name="name" defaultValue={name} required />
          </Field>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}

export function PasswordForm() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    setError(null);
    setFieldErrors({});
    const form = event.currentTarget;
    const data = new FormData(form);
    const res = await apiFetch<{ updated: boolean }>("/api/account/password", {
      json: {
        currentPassword: data.get("currentPassword"),
        newPassword: data.get("newPassword"),
      },
    });
    setPending(false);
    if (!res.ok) {
      if (res.fields) setFieldErrors(res.fields);
      else setError(res.error);
      return;
    }
    form.reset();
    setMessage("Your password has been changed. Other devices have been signed out.");
  }

  return (
    <Card>
      <CardBody>
        <h2 className="text-lg font-semibold">Password</h2>
        {message ? <Alert tone="success" className="mt-3">{message}</Alert> : null}
        {error ? <Alert tone="danger" className="mt-3">{error}</Alert> : null}
        <form onSubmit={onSubmit} className="mt-4 space-y-4" noValidate>
          <Field label="Current password" htmlFor="currentPassword" error={fieldErrors.currentPassword}>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
            />
          </Field>
          <Field
            label="New password"
            htmlFor="newPassword"
            hint="At least 10 characters, with upper and lower case letters and a number."
            error={fieldErrors.newPassword}
          >
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              minLength={10}
              required
            />
          </Field>
          <Button type="submit" disabled={pending}>
            {pending ? "Updating..." : "Change password"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}

export function CoursesForm({ courses }: { courses: Course[] }) {
  const router = useRouter();
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(courseSlug: string) {
    setPendingSlug(courseSlug);
    setMessage(null);
    setError(null);
    const res = await apiFetch<{ courseSlug: string }>("/api/account/courses", {
      json: { courseSlug, makeActive: true },
    });
    setPendingSlug(null);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setMessage("Course updated. It is now your active course.");
    router.refresh();
  }

  return (
    <Card>
      <CardBody>
        <h2 className="text-lg font-semibold">Your languages</h2>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Switch your active course or add another. Each course keeps its own progress.
        </p>
        {message ? <Alert tone="success" className="mt-3">{message}</Alert> : null}
        {error ? <Alert tone="danger" className="mt-3">{error}</Alert> : null}
        <ul className="mt-4 space-y-3">
          {courses.map((course) => (
            <li
              key={course.slug}
              className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius)] border border-[var(--color-border)] p-3"
            >
              <div>
                <p className="text-sm font-medium">
                  {course.title}
                  {course.active ? (
                    <span className="ml-2 text-xs font-semibold text-[var(--color-primary)]">
                      Active
                    </span>
                  ) : null}
                </p>
                <p className="text-xs text-[var(--color-ink-muted)]">{course.tagline}</p>
              </div>
              {course.active ? (
                <span className="text-xs text-[var(--color-ink-subtle)]">Current course</span>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => act(course.slug)}
                  disabled={pendingSlug === course.slug}
                >
                  {pendingSlug === course.slug
                    ? "Working..."
                    : course.enrolled
                      ? "Make active"
                      : "Add & make active"}
                </Button>
              )}
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}
