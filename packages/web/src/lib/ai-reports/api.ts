import { apiClient } from "../api-client";
import type { DataResponse, PaginatedResponse } from "../api/types";
import type {
  AiReport,
  AiReportsQuery,
  GenerateAiReportRequest,
} from "./types";

export async function listAiReports(
  query: AiReportsQuery = {},
): Promise<PaginatedResponse<AiReport>> {
  const { data } = await apiClient.get<PaginatedResponse<AiReport>>(
    "/ai-reports",
    { params: query },
  );
  return data;
}

export async function getAiReport(id: string): Promise<AiReport> {
  const { data } = await apiClient.get<DataResponse<AiReport>>(
    `/ai-reports/${id}`,
  );
  return data.data;
}

export async function generateAiReport(
  body: GenerateAiReportRequest,
): Promise<AiReport> {
  const { data } = await apiClient.post<DataResponse<AiReport>>(
    "/ai-reports/generate",
    body,
  );
  return data.data;
}

export async function removeAiReport(
  id: string,
): Promise<{ id: string; message: string }> {
  const { data } = await apiClient.delete<
    DataResponse<{ id: string; message: string }>
  >(`/ai-reports/${id}`);
  return data.data;
}
