import type { DashboardData } from "./types";
import { apiClient } from "../api-client";

export async function getDashboard(): Promise<DashboardData> {
  const response = await apiClient.get<{
    data: DashboardData;
  }>("/profile/dashboard");

  return response.data.data;
}
