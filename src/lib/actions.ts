"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { verifySession, checkUserPermission } from "~/lib/dal";
import { db } from "~/server/db";

// Schema for creating a new document
const createDocumentSchema = z.object({
  name: z.string().min(1, "Document name is required").max(100),
});

/**
 * Create a new document with proper authorization checks
 */
export async function createDocument(formData: FormData) {
  // Verify user session using DAL
  const session = await verifySession();

  if (!session) {
    redirect("/login");
  }

  // Check if user has permission to create documents
  const canCreate = await checkUserPermission("create");

  if (!canCreate) {
    throw new Error(
      "Unauthorized: You don't have permission to create documents",
    );
  }

  // Validate form data
  const validatedFields = createDocumentSchema.safeParse({
    name: formData.get("name"),
  });

  if (!validatedFields.success) {
    return {
      error: "Invalid form data",
      details: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    // Create the document
    const document = await db.post.create({
      data: {
        name: validatedFields.data.name,
        createdById: session.userId,
      },
    });

    // Revalidate the home page to show the new document
    revalidatePath("/");

    return {
      success: true,
      document,
    };
  } catch (error) {
    console.error("Failed to create document:", error);
    return {
      error: "Failed to create document. Please try again.",
    };
  }
}

/**
 * Delete a document with proper authorization checks
 */
export async function deleteDocument(documentId: string) {
  const session = await verifySession();

  if (!session) {
    redirect("/login");
  }

  try {
    // Verify the user owns the document
    const document = await db.post.findUnique({
      where: { id: parseInt(documentId) },
      select: { createdById: true },
    });

    if (!document) {
      return { error: "Document not found" };
    }

    if (document.createdById !== session.userId) {
      return { error: "Unauthorized: You can only delete your own documents" };
    }

    // Delete the document
    await db.post.delete({
      where: { id: parseInt(documentId) },
    });

    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete document:", error);
    return { error: "Failed to delete document. Please try again." };
  }
}
