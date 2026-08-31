"use client";

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string; code: string; fields?: Record<string, string> };

/** Thin wrapper around fetch for our JSON API. Never throws on HTTP errors. */
export async function apiFetch<T>(
  input: string,
  init?: RequestInit & { json?: unknown },
): Promise<ApiResult<T>> {
  try {
    const { json, headers, ...rest } = init ?? {};
    const res = await fetch(input, {
      method: json ? "POST" : "GET",
      headers: {
        ...(json ? { "content-type": "application/json" } : {}),
        ...headers,
      },
      body: json ? JSON.stringify(json) : rest.body,
      ...rest,
    });

    const payload = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: payload.error ?? "Something went wrong. Please try again.",
        code: payload.code ?? "error",
        fields: payload.fields,
      };
    }
    return { ok: true, data: payload as T };
  } catch {
    return {
      ok: false,
      status: 0,
      error: "Could not reach the server. Check your connection and try again.",
      code: "network_error",
    };
  }
}
