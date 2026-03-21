/**
 * Caching abstraction with Upstash Redis (prod) and in-memory LRU (dev) fallback.
 */

// In-memory LRU cache for development
const memoryCache = new Map<string, { value: string; expiresAt: number }>();
const MAX_MEMORY_ENTRIES = 500;

function cleanupMemoryCache() {
  const now = Date.now();
  for (const [key, entry] of memoryCache) {
    if (entry.expiresAt < now) memoryCache.delete(key);
  }
  // Evict oldest if over limit
  if (memoryCache.size > MAX_MEMORY_ENTRIES) {
    const keys = [...memoryCache.keys()];
    const toDelete = keys.slice(0, keys.length - MAX_MEMORY_ENTRIES);
    for (const key of toDelete) memoryCache.delete(key);
  }
}

// Check for Upstash Redis
function getRedis(): { get: (key: string) => Promise<string | null>; set: (key: string, value: string, options: { ex: number }) => Promise<unknown> } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  // Lazy import to avoid issues when Redis is not configured
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Redis } = require("@upstash/redis");
    return new Redis({ url, token });
  } catch {
    return null;
  }
}

let redis: ReturnType<typeof getRedis> | undefined;
function getRedisClient() {
  if (redis === undefined) redis = getRedis();
  return redis;
}

/**
 * Get a cached value by key.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = getRedisClient();

  if (client) {
    try {
      const value = await client.get(key);
      if (value === null) return null;
      return JSON.parse(typeof value === "string" ? value : JSON.stringify(value)) as T;
    } catch {
      return null;
    }
  }

  // Memory fallback
  const entry = memoryCache.get(key);
  if (!entry || entry.expiresAt < Date.now()) {
    if (entry) memoryCache.delete(key);
    return null;
  }
  return JSON.parse(entry.value) as T;
}

/**
 * Set a cached value with TTL in seconds.
 */
export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  const serialized = JSON.stringify(value);
  const client = getRedisClient();

  if (client) {
    try {
      await client.set(key, serialized, { ex: ttlSeconds });
      return;
    } catch {
      // Fall through to memory
    }
  }

  // Memory fallback
  memoryCache.set(key, {
    value: serialized,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
  cleanupMemoryCache();
}

/**
 * Invalidate cache entries matching a prefix.
 */
export async function cacheInvalidate(prefix: string): Promise<void> {
  // Memory cache
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) memoryCache.delete(key);
  }

  // Redis: we can't easily do prefix invalidation without SCAN
  // For now, only memory cache supports prefix invalidation
}

/**
 * Helper to wrap an async function with caching.
 */
export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) return cached;

  const result = await fn();
  await cacheSet(key, result, ttlSeconds);
  return result;
}
