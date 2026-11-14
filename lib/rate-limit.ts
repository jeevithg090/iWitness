type Bucket = { count: number; resetAt: number };

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

/**
 * Fixed-window, in-memory rate limiter. It is per server instance, which is
 * enough to blunt casual abuse of public endpoints; use a shared store (e.g.
 * Redis) when running multiple instances.
 */
export function createRateLimiter({
  limit,
  windowMs,
  now = () => Date.now(),
}: {
  limit: number;
  windowMs: number;
  now?: () => number;
}) {
  const buckets = new Map<string, Bucket>();

  return function check(key: string): RateLimitResult {
    const current = now();

    // Opportunistic cleanup so the map cannot grow without bound.
    if (buckets.size > 10_000) {
      for (const [k, b] of buckets) if (b.resetAt <= current) buckets.delete(k);
    }

    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= current) {
      bucket = { count: 0, resetAt: current + windowMs };
      buckets.set(key, bucket);
    }

    bucket.count += 1;
    const allowed = bucket.count <= limit;
    return {
      allowed,
      remaining: Math.max(0, limit - bucket.count),
      retryAfterSeconds: allowed
        ? 0
        : Math.ceil((bucket.resetAt - current) / 1000),
    };
  };
}

/**
 * Best-effort client key for rate limiting. Used only in memory and never
 * persisted, so reports stay anonymous.
 */
export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
