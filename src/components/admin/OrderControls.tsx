"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Feedback";
import { useAdminMutation } from "@/components/admin/useAdminMutation";

type Item = { id: string; label: string };

/**
 * Move-up / move-down reordering. Accessible (real buttons), no drag-and-drop
 * dependency. Submits the full ordered id list to the server.
 */
export function OrderControls({
  url,
  items,
  noun,
}: {
  url: string;
  items: Item[];
  noun: string;
}) {
  const { run, pending, error } = useAdminMutation();
  const [order, setOrder] = useState(items);
  const dirty = order.map((i) => i.id).join() !== items.map((i) => i.id).join();

  function move(index: number, direction: -1 | 1) {
    const next = [...order];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
  }

  async function save() {
    await run(url, { ids: order.map((i) => i.id) }, { successMessage: `${noun} order saved.` });
  }

  return (
    <div>
      {error ? <Alert tone="danger" className="mb-3">{error}</Alert> : null}
      <ol className="space-y-2">
        {order.map((item, index) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
          >
            <span>
              <span className="mr-2 font-mono text-xs text-[var(--color-ink-subtle)]">
                {index + 1}
              </span>
              {item.label}
            </span>
            <span className="flex gap-1">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label={`Move ${item.label} up`}
                className="rounded border border-[var(--color-border-strong)] px-2 py-1 disabled:opacity-40"
              >
                &uarr;
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === order.length - 1}
                aria-label={`Move ${item.label} down`}
                className="rounded border border-[var(--color-border-strong)] px-2 py-1 disabled:opacity-40"
              >
                &darr;
              </button>
            </span>
          </li>
        ))}
      </ol>
      {dirty ? (
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={save} disabled={pending}>
            {pending ? "Saving..." : "Save new order"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setOrder(items)}>
            Reset
          </Button>
        </div>
      ) : null}
    </div>
  );
}
