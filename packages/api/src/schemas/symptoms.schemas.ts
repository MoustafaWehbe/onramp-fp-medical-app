import { z } from "zod";

export const SymptomQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
});

export const SymptomSearchQuerySchema = z.object({
  term: z.string().trim().min(1).max(200),
});