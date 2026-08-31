import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({
  as: Tag = "div",
  className,
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("p-5 sm:p-6", className)}>{children}</div>;
}

export function SectionHeading({
  title,
  description,
  as: Tag = "h2",
}: {
  title: ReactNode;
  description?: ReactNode;
  as?: ElementType;
}) {
  return (
    <div className="mb-5">
      <Tag className="text-xl font-semibold text-[var(--color-ink)]">{title}</Tag>
      {description ? (
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{description}</p>
      ) : null}
    </div>
  );
}
