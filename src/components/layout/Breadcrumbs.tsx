import Link from "next/link";
import { JsonLd, breadcrumbSchema } from "@/components/seo/JsonLd";

export type Crumb = { name: string; path: string };

/**
 * Breadcrumb trail. `items` must reflect the page's real position in the site,
 * e.g. Home > Python > Module 2 > Variables. The last item is the current page
 * and is not linked.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <JsonLd data={breadcrumbSchema(items)} />
      <ol className="flex flex-wrap items-center gap-1.5 text-[var(--color-ink-muted)]">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-1.5">
              {isLast ? (
                <span aria-current="page" className="font-medium text-[var(--color-ink)]">
                  {item.name}
                </span>
              ) : (
                <Link href={item.path} className="hover:text-[var(--color-ink)] hover:underline">
                  {item.name}
                </Link>
              )}
              {!isLast ? (
                <span aria-hidden="true" className="text-[var(--color-ink-subtle)]">
                  /
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
