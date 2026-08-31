/**
 * Small fixed-window rate limiter kept in process memory. Good enough for a
 * single-node deployment; swap the store for Redis if you run multiple
 * instances. Used to slow down credential stuffing and quiz-submission abuse.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Opportunistic cleanup so the map cannot grow unbounded.
let lastSweep = 0;
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}

export type RateResult = { ok: boolean; retryAfterSeconds: number };

export function rateLimit(key: string, limit: number, windowMs: number): RateResult {
  const now = Date.now();
  sweep(now);
  const existing = buckets.get(key);

  if (!existing || existing.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return { ok: false, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfterSeconds: 0 };
}

/** Best-effort client IP from standard proxy headers. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip")?.trim() || "unknown";
}
