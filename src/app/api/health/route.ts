import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { redisHealthCheck } from "~/server/redis";

export async function GET() {
  try {
    // Check database connection
    const dbHealth = await db.$queryRaw`SELECT 1`;
    
    // Check Redis connection
    const redisHealth = await redisHealthCheck();
    
    const healthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealth ? "connected" : "disconnected",
        redis: redisHealth ? "connected" : "disconnected",
      }
    };

    const isHealthy = dbHealth && redisHealth;
    
    return NextResponse.json(
      healthStatus,
      { status: isHealthy ? 200 : 503 }
    );
  } catch (error) {
    console.error("Health check failed:", error);
    
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
} 