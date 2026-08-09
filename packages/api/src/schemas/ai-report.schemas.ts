import { z } from "zod";
import { paginationQuerySchema } from "./pagination.schemas";

const isNotFutureDate = (date: string) =>
  date <= new Date().toLocaleDateString("en-CA");

export const generateAiReportSchema = z
  .object({
    startDate: z
      .string()
      .date("Invalid start date")
      .refine(isNotFutureDate, {
        message: "Start date cannot be in the future",
      }),
    endDate: z
      .string()
      .date("Invalid end date")
      .refine(isNotFutureDate, {
        message: "End date cannot be in the future",
      }),
    reportType: z.string().trim().max(50).default("physician_ready"),
  })
  .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: "startDate must be before or equal to endDate",
  });

export const aiReportIdParamSchema = z.object({
  id: z.string().uuid("Invalid AI report id"),
});

export const listAiReportsQuerySchema = paginationQuerySchema;
