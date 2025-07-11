import { db } from "~/server/db";

export class PageAccessService {
  constructor(private dbClient = db) {}

  async canUserAccessRoom(userId: string, pageId: string): Promise<boolean> {
    try {
      const page = await this.dbClient.page.findFirst({
        where: { id: pageId },
        include: {
          workspace: {
            include: {
              memberships: { where: { userId } },
            },
          },
        },
      });
      return !!(page && page.workspace.memberships.length > 0);
    } catch (error) {
      console.error("Error checking page access:", error);
      return false;
    }
  }
} 