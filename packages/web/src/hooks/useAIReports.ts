import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "./useAuth";
import type { PaginatedResponse } from "../lib/api/types";
import {
  generateAiReport,
  getAiReport,
  listAiReports,
  removeAiReport,
  type AiReport,
  type AiReportsQuery,
  type GenerateAiReportRequest,
} from "../lib/ai-reports/ai-reports-exports";

/**
 * ----------------------------------------------------
 * React Query Keys
 * ----------------------------------------------------
 *
 * ["ai-reports"]
 * ["ai-reports", userId, "list"]
 * ["ai-reports", userId, "list", filters]
 * ["ai-reports", userId, "detail"]
 * ["ai-reports", userId, "detail", id]
 */
export const aiReportKeys = {
  all: ["ai-reports"] as const,

  lists: (userId: string) =>
    [...aiReportKeys.all, userId, "list"] as const,

  list: (userId: string, filters: AiReportsQuery) =>
    [...aiReportKeys.lists(userId), filters] as const,

  details: (userId: string) =>
    [...aiReportKeys.all, userId, "detail"] as const,

  detail: (userId: string, id: string) =>
    [...aiReportKeys.details(userId), id] as const,
};

/**
 * ----------------------------------------------------
 * List AI Reports
 * ----------------------------------------------------
 *
 * GET /ai-reports
 */
export function useAiReports(
  userId: string | undefined,
  filters: AiReportsQuery = {},
  enabled = true,
) {
  return useQuery<PaginatedResponse<AiReport>>({
    queryKey: userId
      ? aiReportKeys.list(userId, filters)
      : aiReportKeys.lists("user-disabled"),

    queryFn: () => {
      if (!userId) {
        throw new Error("User ID is required");
      }

      return listAiReports({
        currentPage: filters.currentPage ?? 1,
        pageSize: filters.pageSize ?? 10,
      });
    },

    enabled: Boolean(userId) && enabled,
  });
}

/**
 * ----------------------------------------------------
 * Get AI Report Details
 * ----------------------------------------------------
 *
 * GET /ai-reports/:id
 */
export function useAiReport(id: string | undefined) {
  const { user } = useAuth();

  return useQuery<AiReport>({
    queryKey:
      user?.id && id
        ? aiReportKeys.detail(user.id, id)
        : ["ai-reports", "detail", "disabled"],

    queryFn: () => getAiReport(id!),

    enabled: Boolean(user?.id) && Boolean(id),
  });
}

/**
 * ----------------------------------------------------
 * Generate AI Report
 * ----------------------------------------------------
 *
 * POST /ai-reports/generate
 */
export function useGenerateAiReport() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation<AiReport, Error, GenerateAiReportRequest>({
    mutationFn: (body: GenerateAiReportRequest) => generateAiReport(body),

    onSuccess: (created) => {
      if (!user?.id) {
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: aiReportKeys.lists(user.id),
      });

      queryClient.setQueryData(
        aiReportKeys.detail(user.id, created.id),
        created,
      );
    },
  });
}

/**
 * ----------------------------------------------------
 * Remove AI Report
 * ----------------------------------------------------
 *
 * DELETE /ai-reports/:id
 */
export function useRemoveAiReport() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation<{ id: string; message: string }, Error, string>({
    mutationFn: (id: string) => removeAiReport(id),

    onSuccess: (_response, id) => {
      if (!user?.id) {
        return;
      }

      queryClient.removeQueries({
        queryKey: aiReportKeys.detail(user.id, id),
      });

      void queryClient.invalidateQueries({
        queryKey: aiReportKeys.lists(user.id),
      });
    },
  });
}
