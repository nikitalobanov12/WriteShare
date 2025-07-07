import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { redis, redisHealthCheck, closeRedis } from "./redis";

// Mock environment variables for testing
vi.mock("~/env", () => ({
  env: {
    REDIS_URL: "redis://localhost:6379",
    NODE_ENV: "test",
  },
}));

describe("Redis Client", () => {
  beforeAll(async () => {
    // Ensure Redis is connected for tests
    if (!redis.isOpen) {
      await redis.connect();
    }
  });

  afterAll(async () => {
    // Clean up Redis connection after tests
    await closeRedis();
  });

  it("should connect to Redis successfully", async () => {
    expect(redis.isOpen).toBe(true);
  });

  it("should pass health check", async () => {
    const isHealthy = await redisHealthCheck();
    expect(isHealthy).toBe(true);
  });

  it("should be able to set and get values", async () => {
    const testKey = "test:key";
    const testValue = "test-value";

    await redis.set(testKey, testValue);
    const retrievedValue = await redis.get(testKey);

    expect(retrievedValue).toBe(testValue);

    // Clean up
    await redis.del(testKey);
  });

  it("should handle JSON data", async () => {
    const testKey = "test:json";
    const testData = { id: 1, name: "Test", active: true };

    await redis.set(testKey, JSON.stringify(testData));
    const retrievedData = await redis.get(testKey);
    const parsedData = JSON.parse(retrievedData!) as typeof testData;

    expect(parsedData).toEqual(testData);

    // Clean up
    await redis.del(testKey);
  });

  it("should support TTL (expiration)", async () => {
    const testKey = "test:ttl";
    const testValue = "expires-soon";

    await redis.setEx(testKey, 1, testValue); // 1 second TTL
    
    const initialValue = await redis.get(testKey);
    expect(initialValue).toBe(testValue);

    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    const expiredValue = await redis.get(testKey);
    expect(expiredValue).toBeNull();
  });
}); 