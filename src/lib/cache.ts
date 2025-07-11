import { CacheManager } from "./cache-manager";

// Singleton instance
export const cacheManager = CacheManager.getInstance();

// Backward-compatible exports for previous usage
export const userCache = cacheManager.user;
export const postCache = cacheManager.post;
export const workspaceCache = cacheManager.workspace;
export const sessionCache = cacheManager.session;
export const invalidateCache = cacheManager.invalidate;

export const getCached = cacheManager.get.bind(cacheManager);
export const setCached = cacheManager.set.bind(cacheManager);
export const deleteCached = cacheManager.delete.bind(cacheManager);
export const deleteCachedByPattern = cacheManager.deleteByPattern.bind(cacheManager);
export const cacheOrFetch = cacheManager.cacheOrFetch.bind(cacheManager);

export const generateCacheKey = cacheManager.generateKey.bind(cacheManager);
