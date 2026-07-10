import { z } from "zod";

export const conditionQuerySchema = z.object({
  search: z.string().max(100).optional(),
});