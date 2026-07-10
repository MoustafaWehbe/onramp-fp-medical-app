import { z } from "zod";

export const conditionQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
});