import { z } from "zod";

export const createDocumentSchema = z.object({
  name: z.string().min(1, "Document name is required").max(100),
}); 