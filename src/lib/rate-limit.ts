/**
 * In-memory sliding-window rate limiter.
 *
 * Pros: no external infra, zero setup, perfect for demo / single-server.
 * Cons: state lives per Node process. On Vercel that means per Lambda; on
 *       multi-instance prod swap this for Upstash Redis or similar.
 *
 * Use:
 *   const r = checkRateLimit({ key: `login:${ip}:${email}`, max: 5, windowMs: 5*60_000 });
 *   if (!r.allowed) return 429 with Retry-After: r.retryAfterSeconds;
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Background sweep so the map doesn't grow without bound. */
let lastSweep = 0;
function maybeSweep() {
  const now = Date.now();
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [k, b] of buckets) {
    if (b.resetAt < now) buckets.delete(k);
  }
}

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
};

export function checkRateLimit(opts: {
  key: string;
  max: number;
  windowMs: number;
}): RateLimitResult {
  maybeSweep();
  const now = Date.now();
  const bucket = buckets.get(opts.key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(opts.key, { count: 1, resetAt: now + opts.windowMs });
    return {
      allowed: true,
      remaining: opts.max - 1,
      resetAt: now + opts.windowMs,
      retryAfterSeconds: 0,
    };
  }

  if (bucket.count >= opts.max) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: bucket.resetAt,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return {
    allowed: true,
    remaining: opts.max - bucket.count,
    resetAt: bucket.resetAt,
    retryAfterSeconds: 0,
  };
}

/** Best-effort client identifier from headers. Falls back to a constant in dev. */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  return "local";
}

/** Manually reset a key — useful when a login succeeds to clear failed attempts. */
export function resetRateLimit(key: string) {
  buckets.delete(key);
}
