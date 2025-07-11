import { redis, CACHE_KEYS, CACHE_TTL } from "~/server/redis";

export type CacheKeyPrefix = keyof typeof CACHE_KEYS;

export class CacheManager {
  private static instance: CacheManager;
  private client = redis;

  static getInstance() {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  generateKey(prefix: CacheKeyPrefix, id: string | number, suffix?: string): string {
    const base = `${CACHE_KEYS[prefix]}:${id}`;
    return suffix ? `${base}:${suffix}` : base;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const cached = await this.client.get(key);
      if (!cached) return null;
      return JSON.parse(cached) as T;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl: number = CACHE_TTL.MEDIUM): Promise<boolean> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  async deleteByPattern(pattern: string): Promise<number> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) return 0;
      const result = await this.client.del(keys);
      return result;
    } catch (error) {
      console.error(`Cache delete by pattern error for pattern ${pattern}:`, error);
      return 0;
    }
  }

  async cacheOrFetch<T>(key: string, fetchFn: () => Promise<T>, ttl: number = CACHE_TTL.MEDIUM): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    const data = await fetchFn();
    await this.set(key, data, ttl);
    return data;
  }

  // Entity-specific helpers
  user = {
    get: async <T>(userId: string, suffix?: string) => {
      const key = this.generateKey("USER", userId, suffix);
      return this.get<T>(key);
    },
    set: async <T>(userId: string, value: T, ttl: number = CACHE_TTL.LONG, suffix?: string) => {
      const key = this.generateKey("USER", userId, suffix);
      return this.set(key, value, ttl);
    },
    delete: async (userId: string, suffix?: string) => {
      const key = this.generateKey("USER", userId, suffix);
      return this.delete(key);
    },
    deleteAll: async (userId: string) => {
      const pattern = this.generateKey("USER", userId, "*");
      return this.deleteByPattern(pattern);
    },
  };

  post = {
    get: async <T>(postId: string | number, suffix?: string) => {
      const key = this.generateKey("POST", postId, suffix);
      return this.get<T>(key);
    },
    set: async <T>(postId: string | number, value: T, ttl: number = CACHE_TTL.MEDIUM, suffix?: string) => {
      const key = this.generateKey("POST", postId, suffix);
      return this.set(key, value, ttl);
    },
    delete: async (postId: string | number, suffix?: string) => {
      const key = this.generateKey("POST", postId, suffix);
      return this.delete(key);
    },
    deleteAll: async (postId: string | number) => {
      const pattern = this.generateKey("POST", postId, "*");
      return this.deleteByPattern(pattern);
    },
  };

  workspace = {
    get: async <T>(workspaceId: string, suffix?: string) => {
      const key = this.generateKey("WORKSPACE", workspaceId, suffix);
      return this.get<T>(key);
    },
    set: async <T>(workspaceId: string, value: T, ttl: number = CACHE_TTL.LONG, suffix?: string) => {
      const key = this.generateKey("WORKSPACE", workspaceId, suffix);
      return this.set(key, value, ttl);
    },
    delete: async (workspaceId: string, suffix?: string) => {
      const key = this.generateKey("WORKSPACE", workspaceId, suffix);
      return this.delete(key);
    },
    deleteAll: async (workspaceId: string) => {
      const pattern = this.generateKey("WORKSPACE", workspaceId, "*");
      return this.deleteByPattern(pattern);
    },
  };

  // Session-specific cache helpers
  session = {
    get: async <T>(sessionId: string) => {
      const key = this.generateKey("SESSION", sessionId);
      return this.get<T>(key);
    },
    set: async <T>(sessionId: string, value: T, ttl: number = CACHE_TTL.VERY_LONG) => {
      const key = this.generateKey("SESSION", sessionId);
      return this.set(key, value, ttl);
    },
    delete: async (sessionId: string) => {
      const key = this.generateKey("SESSION", sessionId);
      return this.delete(key);
    },
  };

  // Invalidate cache helpers
  invalidate = {
    user: async (userId: string) => {
      await this.user.deleteAll(userId);
      await this.deleteByPattern(`${CACHE_KEYS.POST}:*:user:${userId}`);
    },
    post: async (postId: string | number, userId?: string) => {
      await this.post.deleteAll(postId);
      if (userId) {
        await this.user.delete(userId, "posts");
      }
    },
    workspace: async (workspaceId: string) => {
      await this.workspace.deleteAll(workspaceId);
      await this.deleteByPattern(`${CACHE_KEYS.PAGE}:*:workspace:${workspaceId}`);
    },
    page: async (pageId: string, workspaceId?: string) => {
      // If you add a pageCache property, use it here
      await this.deleteByPattern(`${CACHE_KEYS.PAGE}:${pageId}:*`);
      if (workspaceId) {
        await this.workspace.delete(workspaceId, "pages");
      }
    },
  };
} 