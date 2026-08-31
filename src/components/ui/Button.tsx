import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius)] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-55 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--color-primary)] text-[var(--color-primary-contrast)] hover:bg-[var(--color-primary-strong)]",
  secondary:
    "bg-[var(--color-surface)] text-[var(--color-ink)] border border-[var(--color-border-strong)] hover:bg-[var(--color-surface-muted)]",
  ghost: "text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)]",
  danger: "bg-[var(--color-danger)] text-white hover:brightness-95",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  children: ReactNode;
  className?: string;
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  ...props
}: CommonProps & ComponentProps<"button">) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], fullWidth && "w-full", className)}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  ...props
}: CommonProps & ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(base, variants[variant], sizes[size], fullWidth && "w-full", className)}
      {...props}
    />
  );
}
