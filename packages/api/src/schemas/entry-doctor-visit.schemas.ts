import { z } from "zod";
import { paginationQuerySchema } from "./pagination.schemas";

export const entryDoctorVisitIdParamSchema = z.object({
  id: z.string().uuid("Invalid doctor visit id"),
});

export const listEntryDoctorVisitsQuerySchema =
  paginationQuerySchema;