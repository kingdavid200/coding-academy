import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "info" | "success" | "danger" | "warning";

const toneStyles: Record<Tone, string> = {
  neutral: "bg-[var(--color-surface-muted)] text-[var(--color-ink-muted)] border-[var(--color-border)]",
  info: "bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)] border-[color-mix(in_srgb,var(--color-primary)_25%,white)]",
  success: "bg-[var(--color-success-soft)] text-[var(--color-success)] border-[color-mix(in_srgb,var(--color-success)_25%,white)]",
  danger: "bg-[var(--color-danger-soft)] text-[var(--color-danger)] border-[color-mix(in_srgb,var(--color-danger)_25%,white)]",
  warning: "bg-[var(--color-warning-soft)] text-[var(--color-warning)] border-[color-mix(in_srgb,var(--color-warning)_30%,white)]",
};

export function Alert({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: Tone;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn("rounded-[var(--radius)] border px-4 py-3 text-sm", toneStyles[tone], className)}
    >
      {title ? <p className="font-semibold">{title}</p> : null}
      {children ? <div className={title ? "mt-1" : undefined}>{children}</div> : null}
    </div>
  );
}

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        toneStyles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ProgressBar({
  value,
  label,
  className,
}: {
  value: number;
  label: string;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={className}>
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-muted)]"
      >
        <div
          className="h-full rounded-full bg-[var(--color-primary)] transition-[width] duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <span
      role="status"
      aria-label={label}
      className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-border-strong)] border-t-[var(--color-primary)]"
    />
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)] px-6 py-12 text-center">
      <p className="text-base font-semibold text-[var(--color-ink)]">{title}</p>
      {description ? (
        <p className="mx-auto mt-1 max-w-md text-sm text-[var(--color-ink-muted)]">{description}</p>
      ) : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
