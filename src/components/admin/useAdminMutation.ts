"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";

type Options = {
  method?: "POST" | "PATCH" | "DELETE";
  onSuccess?: (data: unknown) => void;
  redirectTo?: string;
  successMessage?: string;
};

export function useAdminMutation() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  async function run(url: string, body: unknown, options: Options = {}) {
    setPending(true);
    setError(null);
    setFieldErrors({});
    setMessage(null);

    const res = await apiFetch<unknown>(url, {
      method: options.method ?? "POST",
      headers: { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    setPending(false);
    if (!res.ok) {
      if (res.fields) setFieldErrors(res.fields);
      setError(res.error);
      return { ok: false as const };
    }

    if (options.successMessage) setMessage(options.successMessage);
    options.onSuccess?.(res.data);
    if (options.redirectTo) {
      router.push(options.redirectTo);
    }
    router.refresh();
    return { ok: true as const, data: res.data };
  }

  return { run, pending, error, fieldErrors, message, setError };
}
