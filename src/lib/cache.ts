import { redis, CACHE_KEYS, CACHE_TTL } from "~/server/redis";

/**
 * Generate a cache key with consistent formatting
 */
export const generateCacheKey = (
  prefix: keyof typeof CACHE_KEYS,
  id: string | number,
  suffix?: string,
): string => {
  const base = `${CACHE_KEYS[prefix]}:${id}`;
  return suffix ? `${base}:${suffix}` : base;
};

/**
 * Generic cache get function with JSON parsing
 */
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    if (!redis.isOpen) {
      await redis.connect();
    }

    const cached = await redis.get(key);
    if (!cached) return null;

    return JSON.parse(cached) as T;
  } catch (error) {
    console.error(`Cache get error for key ${key}:`, error);
    return null;
  }
}

/**
 * Generic cache set function with JSON stringification
 */
export async function setCached<T>(
  key: string,
  value: T,
  ttl: number = CACHE_TTL.MEDIUM,
): Promise<boolean> {
  try {
    if (!redis.isOpen) {
      await redis.connect();
    }

    await redis.setEx(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Cache set error for key ${key}:`, error);
    return false;
  }
}

/**
 * Delete a cache entry
 */
export async function deleteCached(key: string): Promise<boolean> {
  try {
    if (!redis.isOpen) {
      await redis.connect();
    }

    const result = await redis.del(key);
    return result > 0;
  } catch (error) {
    console.error(`Cache delete error for key ${key}:`, error);
    return false;
  }
}

/**
 * Delete multiple cache entries by pattern
 */
export async function deleteCachedByPattern(pattern: string): Promise<number> {
  try {
    if (!redis.isOpen) {
      await redis.connect();
    }

    const keys = await redis.keys(pattern);
    if (keys.length === 0) return 0;

    const result = await redis.del(keys);
    return result;
  } catch (error) {
    console.error(
      `Cache delete by pattern error for pattern ${pattern}:`,
      error,
    );
    return 0;
  }
}

/**
 * Cache or fetch pattern - tries cache first, then fetches and caches
 */
export async function cacheOrFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = CACHE_TTL.MEDIUM,
): Promise<T> {
  // Try to get from cache first
  const cached = await getCached<T>(key);
  if (cached !== null) {
    return cached;
  }

  // If not in cache, fetch the data
  const data = await fetchFn();

  // Cache the result
  await setCached(key, data, ttl);

  return data;
}

/**
 * User-specific cache utilities
 */
export const userCache = {
  get: async <T>(userId: string, suffix?: string): Promise<T | null> => {
    const key = generateCacheKey("USER", userId, suffix);
    return getCached<T>(key);
  },

  set: async <T>(
    userId: string,
    value: T,
    ttl: number = CACHE_TTL.LONG,
    suffix?: string,
  ): Promise<boolean> => {
    const key = generateCacheKey("USER", userId, suffix);
    return setCached(key, value, ttl);
  },

  delete: async (userId: string, suffix?: string): Promise<boolean> => {
    const key = generateCacheKey("USER", userId, suffix);
    return deleteCached(key);
  },

  deleteAll: async (userId: string): Promise<number> => {
    const pattern = generateCacheKey("USER", userId, "*");
    return deleteCachedByPattern(pattern);
  },
};

/**
 * Post-specific cache utilities
 */
export const postCache = {
  get: async <T>(
    postId: string | number,
    suffix?: string,
  ): Promise<T | null> => {
    const key = generateCacheKey("POST", postId, suffix);
    return getCached<T>(key);
  },

  set: async <T>(
    postId: string | number,
    value: T,
    ttl: number = CACHE_TTL.MEDIUM,
    suffix?: string,
  ): Promise<boolean> => {
    const key = generateCacheKey("POST", postId, suffix);
    return setCached(key, value, ttl);
  },

  delete: async (
    postId: string | number,
    suffix?: string,
  ): Promise<boolean> => {
    const key = generateCacheKey("POST", postId, suffix);
    return deleteCached(key);
  },

  deleteAll: async (postId: string | number): Promise<number> => {
    const pattern = generateCacheKey("POST", postId, "*");
    return deleteCachedByPattern(pattern);
  },
};

/**
 * Workspace-specific cache utilities
 */
export const workspaceCache = {
  get: async <T>(workspaceId: string, suffix?: string): Promise<T | null> => {
    const key = generateCacheKey("WORKSPACE", workspaceId, suffix);
    return getCached<T>(key);
  },

  set: async <T>(
    workspaceId: string,
    value: T,
    ttl: number = CACHE_TTL.LONG,
    suffix?: string,
  ): Promise<boolean> => {
    const key = generateCacheKey("WORKSPACE", workspaceId, suffix);
    return setCached(key, value, ttl);
  },

  delete: async (workspaceId: string, suffix?: string): Promise<boolean> => {
    const key = generateCacheKey("WORKSPACE", workspaceId, suffix);
    return deleteCached(key);
  },

  deleteAll: async (workspaceId: string): Promise<number> => {
    const pattern = generateCacheKey("WORKSPACE", workspaceId, "*");
    return deleteCachedByPattern(pattern);
  },
};

/**
 * Page-specific cache utilities
 */
export const pageCache = {
  get: async <T>(pageId: string, suffix?: string): Promise<T | null> => {
    const key = generateCacheKey("PAGE", pageId, suffix);
    return getCached<T>(key);
  },

  set: async <T>(
    pageId: string,
    value: T,
    ttl: number = CACHE_TTL.MEDIUM,
    suffix?: string,
  ): Promise<boolean> => {
    const key = generateCacheKey("PAGE", pageId, suffix);
    return setCached(key, value, ttl);
  },

  delete: async (pageId: string, suffix?: string): Promise<boolean> => {
    const key = generateCacheKey("PAGE", pageId, suffix);
    return deleteCached(key);
  },

  deleteAll: async (pageId: string): Promise<number> => {
    const pattern = generateCacheKey("PAGE", pageId, "*");
    return deleteCachedByPattern(pattern);
  },
};

/**
 * Session cache utilities
 */
export const sessionCache = {
  get: async <T>(sessionId: string): Promise<T | null> => {
    const key = generateCacheKey("SESSION", sessionId);
    return getCached<T>(key);
  },

  set: async <T>(
    sessionId: string,
    value: T,
    ttl: number = CACHE_TTL.VERY_LONG,
  ): Promise<boolean> => {
    const key = generateCacheKey("SESSION", sessionId);
    return setCached(key, value, ttl);
  },

  delete: async (sessionId: string): Promise<boolean> => {
    const key = generateCacheKey("SESSION", sessionId);
    return deleteCached(key);
  },
};

/**
 * Invalidate related caches when data changes
 */
export const invalidateCache = {
  user: async (userId: string): Promise<void> => {
    await userCache.deleteAll(userId);
    // Also invalidate user's posts cache
    await deleteCachedByPattern(`${CACHE_KEYS.POST}:*:user:${userId}`);
  },

  post: async (postId: string | number, userId?: string): Promise<void> => {
    await postCache.deleteAll(postId);
    if (userId) {
      await userCache.delete(userId, "posts");
    }
  },

  workspace: async (workspaceId: string): Promise<void> => {
    await workspaceCache.deleteAll(workspaceId);
    // Invalidate all pages in this workspace
    await deleteCachedByPattern(
      `${CACHE_KEYS.PAGE}:*:workspace:${workspaceId}`,
    );
  },

  page: async (pageId: string, workspaceId?: string): Promise<void> => {
    await pageCache.deleteAll(pageId);
    if (workspaceId) {
      await workspaceCache.delete(workspaceId, "pages");
    }
  },
};
