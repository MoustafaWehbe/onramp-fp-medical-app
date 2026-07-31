import type {
  AnalyticsDashboard,
  AnalyticsDashboardParams,
} from "./types";

import { apiClient } from "../api-client";


export async function getAnalyticsDashboard(
  params?: AnalyticsDashboardParams,
): Promise<AnalyticsDashboard> {

  const response = await apiClient.get<{
    data: AnalyticsDashboard;
  }>("/analytics/dashboard", {
    params,
  });

  return response.data.data;
}