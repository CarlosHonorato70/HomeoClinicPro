/**
 * Rate limiter with Upstash Redis (production) or in-memory fallback (dev).
 * Edge-compatible — works in Next.js Edge Runtime.
 */

// --- In-memory fallback ---

interface RateLimitEntry {
  count: number;
  lastReset: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 60_000;

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, entry] of rateLimitMap) {
    if (now - entry.lastReset > windowMs) {
      rateLimitMap.delete(key);
    }
  }
}

function inMemoryRateLimit(
  ip: string,
  maxRequests: number,
  windowMs: number
): { success: boolean; remaining: number } {
  cleanup(windowMs);
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.lastReset > windowMs) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return { success: true, remaining: maxRequests - 1 };
  }

  entry.count += 1;

  if (entry.count > maxRequests) {
    return { success: false, remaining: 0 };
  }

  return { success: true, remaining: maxRequests - entry.count };
}

// --- Upstash Redis (production) ---

let upstashLimiters: Map<string, { limiter: unknown }> | null = null;

async function getUpstashLimiter(maxRequests: number, windowMs: number) {
  const key = `${maxRequests}:${windowMs}`;

  if (!upstashLimiters) {
    upstashLimiters = new Map();
  }

  if (!upstashLimiters.has(key)) {
    const { Ratelimit } = await import("@upstash/ratelimit");
    const { Redis } = await import("@upstash/redis");

    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(maxRequests, `${windowMs} ms`),
      analytics: true,
    });

    upstashLimiters.set(key, { limiter });
  }

  return upstashLimiters.get(key)!.limiter as {
    limit: (id: string) => Promise<{ success: boolean; remaining: number }>;
  };
}

const useUpstash = !!(
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
);

export async function rateLimitAsync(
  ip: string,
  maxRequests: number,
  windowMs: number
): Promise<{ success: boolean; remaining: number }> {
  if (useUpstash) {
    try {
      const limiter = await getUpstashLimiter(maxRequests, windowMs);
      return await limiter.limit(ip);
    } catch (e) {
      console.error("[rate-limit] Upstash error, falling back to in-memory:", e);
      return inMemoryRateLimit(ip, maxRequests, windowMs);
    }
  }
  return inMemoryRateLimit(ip, maxRequests, windowMs);
}

/**
 * Synchronous rate limiter (in-memory only).
 * Kept for backward compatibility with edge middleware.
 */
export function rateLimit(
  ip: string,
  maxRequests: number,
  windowMs: number
): { success: boolean; remaining: number } {
  return inMemoryRateLimit(ip, maxRequests, windowMs);
}
