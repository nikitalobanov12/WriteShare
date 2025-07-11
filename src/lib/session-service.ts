import { cache } from "react";
import { auth } from "@/auth";
import { cookies as nextCookies } from "next/headers";
import { sessionCache } from "~/lib/cache";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

export interface SessionData {
  isAuth: true;
  userId: string;
  userEmail: string;
  userName: string | null;
  userImage: string | null;
}

export class SessionService {
  constructor(
    private cacheStore = sessionCache,
    private authFn = auth,
    private cookiesFn = nextCookies
  ) {}

  verifySession = cache(async (): Promise<SessionData | null> => {
    const cookieStore = (await this.cookiesFn()) as unknown as ReadonlyRequestCookies;
    const sessionToken =
      cookieStore.get("next-auth.session-token")?.value ??
      cookieStore.get("__Secure-next-auth.session-token")?.value ??
      undefined;

    if (typeof sessionToken === "string" && sessionToken.length > 0) {
      const cachedSession = await this.cacheStore.get<SessionData>(sessionToken);
      if (cachedSession && typeof cachedSession.userId === "string") {
        return cachedSession;
      }
    }

    const session = await this.authFn();
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

    if (typeof sessionToken === "string" && sessionToken.length > 0) {
      await this.cacheStore.set(sessionToken, sessionData);
    }

    return sessionData;
  });

  checkUserPermission = cache(async (permission: string) => {
    const session = await this.verifySession();
    if (!session) {
      return false;
    }
    const basicPermissions = ["read", "write", "create"];
    return basicPermissions.includes(permission);
  });
} 