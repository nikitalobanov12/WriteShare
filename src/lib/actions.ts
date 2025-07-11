"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifySession, checkUserPermission } from "~/lib/dal";
import { DocumentService, NotFoundError, AuthError } from "~/lib/document-service";
import { createDocumentSchema } from "~/lib/schemas/document";

const documentService = new DocumentService();

export async function createDocument(formData: FormData) {
  const session = await verifySession();
  if (!session) {
    redirect("/login");
  }

  const canCreate = await checkUserPermission("create");
  if (!canCreate) {
    return { error: "Unauthorized: You don't have permission to create documents" };
  }

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
    const document = await documentService.createDocument(
      validatedFields.data.name,
      session.userId
    );
    revalidatePath("/");
    return {
      success: true,
      document,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: error.message };
    }
    console.error("Failed to create document:", error);
    return {
      error: "Failed to create document. Please try again.",
    };
  }
}

export async function deleteDocument(documentId: string) {
  const session = await verifySession();
  if (!session) {
    redirect("/login");
  }

  try {
    await documentService.deleteDocument(parseInt(documentId), session.userId);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof AuthError) {
      return { error: error.message };
    }
    console.error("Failed to delete document:", error);
    return { error: "Failed to delete document. Please try again." };
  }
}
