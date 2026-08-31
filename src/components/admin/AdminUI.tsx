import type { ReactNode } from "react";
import { Card, CardBody } from "@/components/ui/Card";

export function AdminPageTitle({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex gap-2">{actions}</div> : null}
    </div>
  );
}

export function StatTile({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <Card>
      <CardBody className="p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-subtle)]">
          {label}
        </p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
        {hint ? <p className="mt-0.5 text-xs text-[var(--color-ink-muted)]">{hint}</p> : null}
      </CardBody>
    </Card>
  );
}

export function AdminTable({
  head,
  children,
  caption,
}: {
  head: ReactNode;
  children: ReactNode;
  caption?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
      <table className="w-full text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] text-left">
          <tr>{head}</tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">{children}</tbody>
      </table>
    </div>
  );
}
