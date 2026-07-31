import { z } from "zod";

export const analyticsDashboardQuerySchema = z.object({
  days: z
    .coerce
    .number()
    .int("Days must be an integer")
    .positive("Days must be greater than 0")
    .max(
      365,
      "Days must be at most 365",
    )
    .optional(),
});