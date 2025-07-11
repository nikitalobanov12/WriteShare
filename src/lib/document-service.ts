import { db } from "~/server/db";

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export class DocumentService {
  constructor(private dbClient = db) {}

  async createDocument(name: string, userId: string) {
    return this.dbClient.post.create({
      data: {
        name,
        createdById: userId,
      },
    });
  }

  async deleteDocument(documentId: number, userId: string) {
    const document = await this.dbClient.post.findUnique({
      where: { id: documentId },
      select: { createdById: true },
    });
    if (!document) throw new NotFoundError("Document not found");
    if (document.createdById !== userId) throw new AuthError("Unauthorized: You can only delete your own documents");
    await this.dbClient.post.delete({ where: { id: documentId } });
    return true;
  }
} 