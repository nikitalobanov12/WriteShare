import "server-only";
import { cache } from "react";
import { auth } from "@/auth";
import { db } from "~/server/db";
import { cookies as nextCookies } from "next/headers";
import { sessionCache } from "~/lib/cache";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

interface SessionData {
  isAuth: true;
  userId: string;
  userEmail: string;
  userName: string | null;
  userImage: string | null;
}

/**
 * Verify the current session and return session data
 * This function is cached to avoid multiple database calls during a single request
 */
export const verifySession = cache(async (): Promise<SessionData | null> => {
  // 1. Get session token from cookies (handle possible undefined)
  const cookieStore = await nextCookies() as unknown as ReadonlyRequestCookies;
  const sessionToken =
    (cookieStore.get("next-auth.session-token")?.value ??
      cookieStore.get("__Secure-next-auth.session-token")?.value) ??
    undefined;

  // 2. Try Redis cache first
  if (typeof sessionToken === "string" && sessionToken.length > 0) {
    const cachedSession = await sessionCache.get<SessionData>(sessionToken);
    if (cachedSession && typeof cachedSession.userId === "string") {
      // Optionally: console.log("[SESSION CACHE HIT]", sessionToken);
      return cachedSession;
    }
  }

  // 3. Fallback to NextAuth
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const sessionData: SessionData = {
    isAuth: true,
    userId: session.user.id,
    userEmail: session.user.email ?? "",
    userName: session.user.name ?? null,
    userImage: session.user.image ?? null,
  };

  // 4. Cache the session in Redis
  if (typeof sessionToken === "string" && sessionToken.length > 0) {
    await sessionCache.set(sessionToken, sessionData);
    // Optionally: console.log("[SESSION CACHE MISS]", sessionToken);
  }

  return sessionData;
});

/**
 * Get user data with proper authorization checks
 * This ensures that user data is only accessible to authorized users
 */
export const getUser = cache(async () => {
  const session = await verifySession();

  if (!session) {
    return null;
  }

  try {
    // Only fetch necessary user data (DTO pattern)
    const user = await db.user.findUnique({
      where: {
        id: session.userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        emailVerified: true,
        // Don't expose sensitive data
      },
    });

    return user;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return null;
  }
});

/**
 * Get user's posts with proper authorization
 */
export const getUserPosts = cache(async () => {
  const session = await verifySession();

  if (!session) {
    return [];
  }

  try {
    const posts = await db.post.findMany({
      where: {
        createdById: session.userId,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        // Only return necessary fields
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return posts;
  } catch (error) {
    console.error("Failed to fetch user posts:", error);
    return [];
  }
});

/**
 * Check if user has specific permissions (for future role-based access)
 */
export const checkUserPermission = cache(async (permission: string) => {
  const session = await verifySession();

  if (!session) {
    return false;
  }

  // For now, all authenticated users have basic permissions
  // This can be extended with role-based checks later
  const basicPermissions = ["read", "write", "create"];

  return basicPermissions.includes(permission);
});
