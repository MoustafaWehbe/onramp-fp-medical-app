import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "../lib/dashboard";

export const dashboardKeys = {
  all: (userId: string) => ["dashboard", userId] as const,
};

export function useDashboardQuery(userId: string | undefined) {
  return useQuery({
    queryKey: userId
      ? dashboardKeys.all(userId)
      : ["dashboard", "disabled"],
    queryFn: getDashboard,
    enabled: !!userId,
  });
}
