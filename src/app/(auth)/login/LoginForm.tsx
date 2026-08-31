"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Feedback";
import { apiFetch } from "@/lib/api-client";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? undefined;
  const justSignedOut = params.get("signedout") === "1";

  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFormError(null);
    setFieldErrors({});

    const form = new FormData(event.currentTarget);
    const result = await apiFetch<{ redirectTo: string }>("/api/auth/login", {
      json: {
        email: form.get("email"),
        password: form.get("password"),
        next,
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
        <h1 className="text-xl font-bold">Sign in</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Welcome back. Enter your details to continue learning.
        </p>

        {justSignedOut ? (
          <Alert tone="success" className="mt-4">
            You have been signed out.
          </Alert>
        ) : null}

        {formError ? (
          <Alert tone="danger" className="mt-4">
            {formError}
          </Alert>
        ) : null}

        <form onSubmit={onSubmit} className="mt-5 space-y-4" noValidate>
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
          <Field label="Password" htmlFor="password" error={fieldErrors.password}>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              aria-invalid={Boolean(fieldErrors.password)}
            />
          </Field>
          <Button type="submit" fullWidth disabled={pending}>
            {pending ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="mt-4 text-sm text-[var(--color-ink-muted)]">
          New here?{" "}
          <a href="/signup" className="font-medium text-[var(--color-primary)] hover:underline">
            Create an account
          </a>
        </p>
      </CardBody>
    </Card>
  );
}
