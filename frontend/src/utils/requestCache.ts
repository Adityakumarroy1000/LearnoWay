export type CachedFetchOptions = {
  ttlMs?: number;
  cacheKey?: string;
};

type CacheEntry<T> = {
  timestamp: number;
  data: T;
};

const CACHE_PREFIX = "lms_cache_v1:";

function buildKey(url: string, init?: RequestInit, override?: string) {
  if (override) return `${CACHE_PREFIX}${override}`;
  const auth = typeof init?.headers === "object" && init?.headers
    ? JSON.stringify(init.headers)
    : "";
  return `${CACHE_PREFIX}${url}::${auth}`;
}

function readEntry<T>(key: string): CacheEntry<T> | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as CacheEntry<T>;
  } catch {
    return null;
  }
}

function writeEntry<T>(key: string, data: T) {
  try {
    const entry: CacheEntry<T> = { timestamp: Date.now(), data };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // best-effort cache only
  }
}

export async function cachedJsonFetch<T>(
  url: string,
  init?: RequestInit,
  options?: CachedFetchOptions
): Promise<T> {
  const ttlMs = options?.ttlMs ?? 60_000;
  const key = buildKey(url, init, options?.cacheKey);
  const now = Date.now();

  const cached = readEntry<T>(key);
  if (cached && now - cached.timestamp <= ttlMs) {
    return cached.data;
  }

  try {
    const res = await fetch(url, init);
    if (!res.ok) {
      throw new Error(`Request failed: ${res.status}`);
    }
    const data = (await res.json()) as T;
    writeEntry(key, data);
    return data;
  } catch (error) {
    // Gracefully fall back to stale data on transient failures.
    if (cached) return cached.data;
    throw error;
  }
}

export function clearCacheByPrefix(prefix: string) {
  try {
    const fullPrefix = `${CACHE_PREFIX}${prefix}`;
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && key.startsWith(fullPrefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch {
    // ignore cache clear failures
  }
}
