import { createClient } from "redis";

import { env } from "~/env";

const createRedisClient = () => {
  const client = createClient({
    url: env.REDIS_URL,
  });

  // Event handlers for better debugging
  if (env.NODE_ENV === "development") {
    client.on("connect", () => {
      console.log("✅ Redis connected successfully");
    });

    client.on("ready", () => {
      console.log("✅ Redis ready to accept commands");
    });

    client.on("error", (error) => {
      console.error("❌ Redis connection error:", error);
    });

    client.on("end", () => {
      console.log("🔌 Redis connection ended");
    });

    client.on("reconnecting", () => {
      console.log("🔄 Redis reconnecting...");
    });
  }

  return client;
};

// Global singleton pattern for Redis client (similar to Prisma setup)
const globalForRedis = globalThis as unknown as {
  redis: ReturnType<typeof createRedisClient> | undefined;
};

export const redis = globalForRedis.redis ?? createRedisClient();

if (env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

// Initialize connection
if (!redis.isOpen) {
  redis.connect().catch((error) => {
    console.error("Failed to connect to Redis:", error);
  });
}

// Utility function to safely close Redis connection
export const closeRedis = async () => {
  if (redis.isOpen) {
    await redis.disconnect();
  }
};

// Health check function
export const redisHealthCheck = async (): Promise<boolean> => {
  try {
    if (!redis.isOpen) {
      await redis.connect();
    }
    const result = await redis.ping();
    return result === "PONG";
  } catch (error) {
    console.error("Redis health check failed:", error);
    return false;
  }
};

// Cache key prefixes for organization
export const CACHE_KEYS = {
  USER: "user",
  POST: "post",
  WORKSPACE: "workspace",
  PAGE: "page",
  SESSION: "session",
} as const;

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const;
