import type { PaginationInput } from "../../lib/pagination";

export interface ListAiReportsInput extends PaginationInput {
  userId: string;
}

export interface GenerateAiReportInput {
  userId: string;
  startDate: string;
  endDate: string;
  reportType: string;
  language?: "en" | "ar";
}
