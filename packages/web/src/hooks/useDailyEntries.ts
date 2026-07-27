import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

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

/**
 * React Query keys for daily entries.
 *
 * Keeping all keys in one place makes it easier
 * to invalidate and refetch related queries.
 */
export const dailyEntryKeys = {
  all: ["daily-entries"] as const,

  lists: () =>
    [...dailyEntryKeys.all, "list"] as const,

  list: (filters: DailyEntriesQuery) =>
    [...dailyEntryKeys.lists(), filters] as const,

  details: () =>
    [...dailyEntryKeys.all, "detail"] as const,

  detail: (id: string) =>
    [...dailyEntryKeys.details(), id] as const,
};

/**
 * Get a paginated list of the current user's
 * daily entries.
 *
 * Supports:
 * - currentPage
 * - pageSize
 * - fromDate
 * - toDate
 */
export function useDailyEntries(
  filters: DailyEntriesQuery = {},
) {
  return useQuery({
    queryKey: dailyEntryKeys.list(filters),

    queryFn: () =>
      listDailyEntries({
        currentPage: filters.currentPage ?? 1,
        pageSize: filters.pageSize ?? 15,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
      }),
  });
}

/**
 * Get one daily entry by ID.
 *
 * The returned entry includes:
 * - symptoms
 * - medications
 * - conditions
 * - doctor visits
 */
export function useDailyEntry(
  id: string | undefined,
) {
  return useQuery({
    queryKey: dailyEntryKeys.detail(id ?? ""),

    queryFn: () => getDailyEntry(id!),

    enabled: Boolean(id),
  });
}

/**
 * Create a new daily entry.
 */
export function useCreateDailyEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      body: CreateDailyEntryRequest,
    ): Promise<DailyEntry> =>
      createDailyEntry(body),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: dailyEntryKeys.all,
      });
    },
  });
}

/**
 * Update an existing daily entry.
 */
export function useUpdateDailyEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: UpdateDailyEntryRequest;
    }): Promise<DailyEntry> =>
      updateDailyEntry(id, body),

    onSuccess: (
      updatedEntry: DailyEntry,
    ) => {
      /**
       * Update the specific cached detail immediately.
       */
      queryClient.setQueryData(
        dailyEntryKeys.detail(updatedEntry.id),
        updatedEntry,
      );

      /**
       * Invalidate list queries so the list
       * reflects the updated entry.
       */
      void queryClient.invalidateQueries({
        queryKey: dailyEntryKeys.lists(),
      });
    },
  });
}

/**
 * Remove a daily entry.
 */
export function useRemoveDailyEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      id: string,
    ) => removeDailyEntry(id),

    onSuccess: (
      _response,
      id,
    ) => {
      /**
       * Remove the deleted entry from the
       * specific detail cache.
       */
      queryClient.removeQueries({
        queryKey: dailyEntryKeys.detail(id),
      });

      /**
       * Refresh all daily-entry lists.
       */
      void queryClient.invalidateQueries({
        queryKey: dailyEntryKeys.lists(),
      });
    },
  });
}