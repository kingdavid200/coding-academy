"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAdminMutation } from "@/components/admin/useAdminMutation";

export function DeleteButton({
  url,
  label = "Delete",
  confirmText,
  redirectTo,
  size = "sm",
}: {
  url: string;
  label?: string;
  confirmText: string;
  redirectTo?: string;
  size?: "sm" | "md";
}) {
  const { run, pending, error } = useAdminMutation();
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Button variant="ghost" size={size} onClick={() => setConfirming(true)}>
        {label}
      </Button>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-xs text-[var(--color-ink-muted)]">{confirmText}</span>
      <Button
        variant="danger"
        size={size}
        disabled={pending}
        onClick={() => run(url, undefined, { method: "DELETE", redirectTo })}
      >
        {pending ? "Deleting..." : "Confirm"}
      </Button>
      <Button variant="ghost" size={size} onClick={() => setConfirming(false)}>
        Cancel
      </Button>
      {error ? <span className="text-xs text-[var(--color-danger)]">{error}</span> : null}
    </span>
  );
}
