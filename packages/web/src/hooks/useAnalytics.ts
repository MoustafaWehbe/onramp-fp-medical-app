import { useQuery } from "@tanstack/react-query";
import {
  getAnalyticsDashboard,
  type AnalyticsDashboardParams,
} from "../lib/analytics/analytics-export";


export const analyticsKeys = {
  all: ["analytics"] as const,

  dashboard: (params: AnalyticsDashboardParams) =>
    [...analyticsKeys.all, "dashboard", params] as const,
};


export function useAnalyticsDashboard(
  params: AnalyticsDashboardParams = {},
) {
  return useQuery({
    queryKey: analyticsKeys.dashboard(params),

    queryFn: () =>
      getAnalyticsDashboard(params),
  });
}