import { z } from "zod";
import { paginationQuerySchema } from "./pagination.schemas";

// Maximum report window; keeps the data collection and AI prompt bounded.
const MAX_RANGE_DAYS = 366;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function todayLocalIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const isNotFutureDate = (date: string) => date <= todayLocalIso();

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
    language: z.enum(["en", "ar"]).default("en"),
  })
  .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: "startDate must be before or equal to endDate",
  })
  .refine(
    (data) =>
      new Date(data.endDate).getTime() - new Date(data.startDate).getTime() <=
      MAX_RANGE_DAYS * MS_PER_DAY,
    {
      message: `Date range must not exceed ${MAX_RANGE_DAYS} days`,
    },
  );

export const aiReportIdParamSchema = z.object({
  id: z.string().uuid("Invalid AI report id"),
});

export const listAiReportsQuerySchema = paginationQuerySchema;
