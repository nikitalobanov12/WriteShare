import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import { 
  generateCacheKey, 
  getCached, 
  setCached, 
  deleteCached,
  cacheOrFetch,
  userCache,
  postCache 
} from "./cache";
import { redis, closeRedis } from "~/server/redis";

// Mock environment variables for testing
vi.mock("~/env", () => ({
  env: {
    REDIS_URL: "redis://localhost:6379",
    NODE_ENV: "test",
  },
}));

describe("Cache Utilities", () => {
  beforeAll(async () => {
    // Ensure Redis is connected for tests
    if (!redis.isOpen) {
      await redis.connect();
    }
  });

  beforeEach(async () => {
    // Clear test keys before each test
    const testKeys = await redis.keys("test:*");
    if (testKeys.length > 0) {
      await redis.del(testKeys);
    }
  });

  afterAll(async () => {
    // Clean up Redis connection after tests
    await closeRedis();
  });

  describe("generateCacheKey", () => {
    it("should generate consistent cache keys", () => {
      const key1 = generateCacheKey("USER", "123");
      const key2 = generateCacheKey("USER", "123", "posts");
      
      expect(key1).toBe("user:123");
      expect(key2).toBe("user:123:posts");
    });
  });

  describe("getCached and setCached", () => {
    it("should set and get cached values", async () => {
      const key = "test:simple";
      const value = { id: 1, name: "Test User" };

      await setCached(key, value);
      const retrieved = await getCached<typeof value>(key);

      expect(retrieved).toEqual(value);
    });

    it("should return null for non-existent keys", async () => {
      const result = await getCached("test:nonexistent");
      expect(result).toBeNull();
    });

    it("should handle complex nested objects", async () => {
      const key = "test:complex";
      const value = {
        user: { id: 1, name: "John" },
        posts: [{ id: 1, title: "Post 1" }, { id: 2, title: "Post 2" }],
        metadata: { created: new Date().toISOString() }
      };

      await setCached(key, value);
      const retrieved = await getCached<typeof value>(key);

      expect(retrieved).toEqual(value);
    });
  });

  describe("deleteCached", () => {
    it("should delete cached values", async () => {
      const key = "test:delete";
      const value = "test-value";

      await setCached(key, value);
      expect(await getCached(key)).toBe(value);

      const deleted = await deleteCached(key);
      expect(deleted).toBe(true);
      expect(await getCached(key)).toBeNull();
    });

    it("should return false for non-existent keys", async () => {
      const deleted = await deleteCached("test:nonexistent");
      expect(deleted).toBe(false);
    });
  });

  describe("cacheOrFetch", () => {
    it("should fetch and cache data when not in cache", async () => {
      const key = "test:fetch";
      const expectedData = { id: 1, name: "Fetched Data" };
      const fetchFn = vi.fn().mockResolvedValue(expectedData);

      const result = await cacheOrFetch(key, fetchFn);

      expect(result).toEqual(expectedData);
      expect(fetchFn).toHaveBeenCalledTimes(1);

      // Verify it was cached
      const cached = await getCached(key);
      expect(cached).toEqual(expectedData);
    });

    it("should return cached data without calling fetch function", async () => {
      const key = "test:cached";
      const cachedData = { id: 2, name: "Cached Data" };
      const fetchFn = vi.fn();

      // Pre-populate cache
      await setCached(key, cachedData);

      const result = await cacheOrFetch(key, fetchFn);

      expect(result).toEqual(cachedData);
      expect(fetchFn).not.toHaveBeenCalled();
    });
  });

  describe("userCache", () => {
    it("should manage user-specific cache", async () => {
      const userId = "user123";
      const userData = { id: userId, name: "John Doe", email: "john@example.com" };

      await userCache.set(userId, userData);
      const retrieved = await userCache.get<typeof userData>(userId);

      expect(retrieved).toEqual(userData);
    });

    it("should handle user cache with suffixes", async () => {
      const userId = "user456";
      const userPosts = [{ id: 1, title: "Post 1" }, { id: 2, title: "Post 2" }];

      await userCache.set(userId, userPosts, 300, "posts");
      const retrieved = await userCache.get<typeof userPosts>(userId, "posts");

      expect(retrieved).toEqual(userPosts);
    });

    it("should delete user cache", async () => {
      const userId = "user789";
      const userData = { id: userId, name: "Jane Doe" };

      await userCache.set(userId, userData);
      expect(await userCache.get(userId)).toEqual(userData);

      const deleted = await userCache.delete(userId);
      expect(deleted).toBe(true);
      expect(await userCache.get(userId)).toBeNull();
    });
  });

  describe("postCache", () => {
    it("should manage post-specific cache", async () => {
      const postId = 123;
      const postData = { id: postId, title: "Test Post", content: "Test content" };

      await postCache.set(postId, postData);
      const retrieved = await postCache.get<typeof postData>(postId);

      expect(retrieved).toEqual(postData);
    });

    it("should handle string post IDs", async () => {
      const postId = "post-abc";
      const postData = { id: postId, title: "String ID Post" };

      await postCache.set(postId, postData);
      const retrieved = await postCache.get<typeof postData>(postId);

      expect(retrieved).toEqual(postData);
    });
  });
}); 