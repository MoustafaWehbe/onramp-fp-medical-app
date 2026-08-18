import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "./useAuth";
import { dashboardKeys } from "./useDashboard";

import {
  createDailyEntry,
  getDailyEntry,
  listDailyEntries,
  removeDailyEntry,
  updateDailyEntry,
  type DailyEntriesQuery,
  type CreateDailyEntryRequest,
  type DailyEntry,
  type UpdateDailyEntryRequest,
} from "../lib/daily-entries/daily-entries-exports";
import { PaginatedResponse } from "@/lib/api/types";

export const dailyEntryKeys = {
  all: ["daily-entries"] as const,
  lists: (userId: string) =>
    [
      ...dailyEntryKeys.all,
      userId,
      "list",
    ] as const,
   list: (
    userId: string,
    filters: DailyEntriesQuery,
  ) =>
    [
      ...dailyEntryKeys.lists(userId),
      filters,
    ] as const,

  details: (userId: string) =>
    [
      ...dailyEntryKeys.all,
      userId,
      "detail",
    ] as const,

 detail: (
    userId: string,
    id: string,
  ) =>
    [
      ...dailyEntryKeys.details(userId),
      id,
    ] as const,
};

export function useDailyEntries(
  userId: string | undefined,
  filters: DailyEntriesQuery = {},
  enabled = true,
) {
  return useQuery<PaginatedResponse<DailyEntry>>({
    queryKey: userId
      ? dailyEntryKeys.list(userId, filters)
      : dailyEntryKeys.lists("user-disabled"),

    queryFn: () => {
      if (!userId) {
        throw new Error("User ID is required");
      }

      return listDailyEntries({
        currentPage:
          filters.currentPage ?? 1,

        pageSize:
          filters.pageSize ?? 10,

        fromDate:
          filters.fromDate,

        toDate:
          filters.toDate,
      });
    },

    enabled: Boolean(userId) && enabled,
  });
}

export function useDailyEntry(
  id: string | undefined,
) {
  const { user } = useAuth();
  return useQuery<DailyEntry>({
    queryKey:user?.id && id
      ? dailyEntryKeys.detail(
            user.id,
            id,
          )
        : [
            "daily-entries",
            "detail",
            "disabled",
          ],

    queryFn: () =>
      getDailyEntry(id!),

    enabled:
      Boolean(user?.id) &&
      Boolean(id),
  });
}

export function useCreateDailyEntry() {
  const queryClient =
    useQueryClient();

    const { user } = useAuth();
  return useMutation<DailyEntry, Error, CreateDailyEntryRequest, unknown>({
    mutationFn: (
      body: CreateDailyEntryRequest,
    ): Promise<DailyEntry> =>
      createDailyEntry(body),

    onSuccess: (
      createdEntry: DailyEntry,
    ) => {
      
      if (!user?.id) {
        return;
      }
      void queryClient.invalidateQueries({
        queryKey:
          dailyEntryKeys.lists(
            user.id,
          ),
      });

      void queryClient.invalidateQueries({
        queryKey: dashboardKeys.all(user.id),
      });

      queryClient.setQueryData(
        dailyEntryKeys.detail(
          user.id,
          createdEntry.id,
        ),
        createdEntry,
      );
    },
  });
}

export function useUpdateDailyEntry() {
  const queryClient =
    useQueryClient();

    const { user } = useAuth();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: UpdateDailyEntryRequest;
    }): Promise<DailyEntry> =>
      updateDailyEntry(
        id,
        body,
      ),

    onSuccess: (
      updatedEntry: DailyEntry,
    ) => {
      
      if (!user?.id) {
        return;
      }

      queryClient.setQueryData(
        dailyEntryKeys.detail(
          user.id,
          updatedEntry.id,
        ),
        updatedEntry,
      );
      void queryClient.invalidateQueries({
        queryKey:
          dailyEntryKeys.lists(
            user.id,
          ),
      });

      void queryClient.invalidateQueries({
        queryKey: dashboardKeys.all(user.id),
      });
    },
  });
}

export function useRemoveDailyEntry() {
  const queryClient =
    useQueryClient();

    const { user } = useAuth();

  return useMutation<{ id: string; message: string }, Error, string>({
    mutationFn: (
      id: string,
    ) =>
      removeDailyEntry(id),

    onSuccess: (
      _response,
      id:string,
    ) => {
       if (!user?.id) {
        return;
      }
      queryClient.removeQueries({
        queryKey:
          dailyEntryKeys.detail(user.id, id),
      });
      
      void queryClient.invalidateQueries({
        queryKey:
          dailyEntryKeys.lists(user.id),
      });

      void queryClient.invalidateQueries({
        queryKey: dashboardKeys.all(user.id),
      });
    },
  });
}