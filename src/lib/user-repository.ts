import { db } from "~/server/db";
import type { SessionData } from "./session-service";

export class UserRepository {
  constructor(private dbClient = db) {}

  async getUser(session: SessionData | null) {
    if (!session) return null;
    try {
      const user = await this.dbClient.user.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          emailVerified: true,
        },
      });
      return user;
    } catch (error) {
      console.error("Failed to fetch user:", error);
      return null;
    }
  }

  async getUserPosts(session: SessionData | null) {
    if (!session) return [];
    try {
      const posts = await this.dbClient.post.findMany({
        where: { createdById: session.userId },
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
      });
      return posts;
    } catch (error) {
      console.error("Failed to fetch user posts:", error);
      return [];
    }
  }
} 