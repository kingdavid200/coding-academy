import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

const controlClass =
  "w-full rounded-[var(--radius)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-subtle)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] aria-[invalid=true]:border-[var(--color-danger)]";

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  const hintId = hint ? `${htmlFor}-hint` : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-[var(--color-ink)]">
        {label}
      </label>
      {hint ? (
        <p id={hintId} className="mt-0.5 text-xs text-[var(--color-ink-muted)]">
          {hint}
        </p>
      ) : null}
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p id={errorId} className="mt-1 text-xs font-medium text-[var(--color-danger)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(controlClass, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(controlClass, "min-h-24", className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select className={cn(controlClass, className)} {...props}>
      {children}
    </select>
  );
}
