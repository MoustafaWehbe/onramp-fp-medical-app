import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "../lib/dashboard";

export const dashboardKeys = {
  all: ["dashboard"] as const,
};

export function useDashboardQuery() {
  return useQuery({
    queryKey: dashboardKeys.all,
    queryFn: getDashboard,
  });
}
