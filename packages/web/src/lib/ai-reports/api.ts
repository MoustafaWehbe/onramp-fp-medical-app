import { apiClient } from "../api-client";
import type { DataResponse, PaginatedResponse } from "../api/types";
import type {
  AiReport,
  AiReportsQuery,
  GenerateAiReportRequest,
} from "./types";

/**
 * ----------------------------------------------------
 * List AI Reports
 * ----------------------------------------------------
 *
 * GET /ai-reports
 *
 * Supports pagination via currentPage / pageSize.
 */
export async function listAiReports(
  query: AiReportsQuery = {},
): Promise<PaginatedResponse<AiReport>> {
  const { data } = await apiClient.get<PaginatedResponse<AiReport>>(
    "/ai-reports",
    { params: query },
  );
  return data;
}

/**
 * ----------------------------------------------------
 * Get AI Report By ID
 * ----------------------------------------------------
 *
 * GET /ai-reports/:id
 */
export async function getAiReport(id: string): Promise<AiReport> {
  const { data } = await apiClient.get<DataResponse<AiReport>>(
    `/ai-reports/${id}`,
  );
  return data.data;
}

/**
 * ----------------------------------------------------
 * Generate AI Report
 * ----------------------------------------------------
 *
 * POST /ai-reports/generate
 *
 * Synchronously calls OpenAI and persists the report.
 */
export async function generateAiReport(
  body: GenerateAiReportRequest,
): Promise<AiReport> {
  const { data } = await apiClient.post<DataResponse<AiReport>>(
    "/ai-reports/generate",
    body,
  );
  return data.data;
}

/**
 * ----------------------------------------------------
 * Delete AI Report
 * ----------------------------------------------------
 *
 * DELETE /ai-reports/:id
 *
 * Hard-deletes the report row (no soft delete).
 */
export async function removeAiReport(
  id: string,
): Promise<{ id: string; message: string }> {
  const { data } = await apiClient.delete<
    DataResponse<{ id: string; message: string }>
  >(`/ai-reports/${id}`);
  return data.data;
}
