/**
 * Edge-compatible in-memory sliding window rate limiter.
 * Works in Next.js Edge Runtime (no Node.js APIs).
 */

interface RateLimitEntry {
  count: number;
  lastReset: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Auto-cleanup old entries every 60 seconds
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

export function rateLimit(
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
