import { z } from "zod";

export const SymptomQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
});