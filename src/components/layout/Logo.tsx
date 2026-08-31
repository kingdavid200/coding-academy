import Link from "next/link";
import { siteConfig } from "@/config/site";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 font-semibold text-[var(--color-ink)]">
      <span
        aria-hidden="true"
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)] font-mono text-sm text-white"
      >
        {"{ }"}
      </span>
      <span className="text-[0.95rem]">{siteConfig.name}</span>
    </Link>
  );
}
