import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "./useAuth";

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

/**
 * ----------------------------------------------------
 * React Query Keys
 * ----------------------------------------------------
 *
 * Centralized query keys for all daily-entry queries.
 *
 * Structure:
 *
 * ["daily-entries"]
 * ["daily-entries", "list"]
 * ["daily-entries", "list", filters]
 * ["daily-entries", "detail"]
 * ["daily-entries", "detail", id]
 */

export const dailyEntryKeys = {
  /**
   * Base key for all daily-entry queries.
   */
  all: ["daily-entries"] as const,

  /**
   * Base key for all list queries.
   */
  lists: (userId: string) =>
    [
      ...dailyEntryKeys.all,
      userId,
      "list",
    ] as const,

  /**
   * Key for a specific filtered/paginated list.
   */
   list: (
    userId: string,
    filters: DailyEntriesQuery,
  ) =>
    [
      ...dailyEntryKeys.lists(userId),
      filters,
    ] as const,

  /**
   * Base key for all detail queries.
   */
  details: (userId: string) =>
    [
      ...dailyEntryKeys.all,
      userId,
      "detail",
    ] as const,

  /**
   * Key for a specific daily entry.
   */
 detail: (
    userId: string,
    id: string,
  ) =>
    [
      ...dailyEntryKeys.details(userId),
      id,
    ] as const,
};

/**
 * ----------------------------------------------------
 * List Daily Entries
 * ----------------------------------------------------
 *
 * Used by:
 *
 * "Check All Entries"
 *
 * The user can:
 * - View previous entries
 * - Navigate between pages
 * - Optionally filter by date range
 *
 * GET /profile/daily-entries
 */

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

/**
 * ----------------------------------------------------
 * Get Daily Entry Details
 * ----------------------------------------------------
 *
 * Used when the user clicks on one entry
 * from the entries list.
 *
 * The API returns:
 * - Basic entry information
 * - Symptoms
 * - Medications
 * - Conditions
 * - Doctor visits
 *
 * GET /profile/daily-entries/:id
 */

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

/**
 * ----------------------------------------------------
 * Create Daily Entry
 * ----------------------------------------------------
 *
 * Used by:
 *
 * "Submit Current Entry"
 *
 * The form should submit today's date.
 *
 * POST /profile/daily-entries
 *
 * The backend enforces the rule:
 *
 * One entry per user per day.
 *
 * If the user already submitted today's entry,
 * the backend returns 409.
 */

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
        queryKey: ["dashboard"],
      });

      /**
       * The created entry can also be cached
       * as a detail query immediately.
       *
       * This is useful if, after submission,
       * the UI navigates to the entry details.
       */
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

/**
 * ----------------------------------------------------
 * Update Daily Entry
 * ----------------------------------------------------
 *
 * NOTE:
 * Your current UI does not allow the user
 * to edit the entry date.
 *
 * This hook is kept for future editing
 * functionality.
 *
 * PATCH /profile/daily-entries/:id
 */

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

      /**
       * Invalidate all list queries.
       *
       * This ensures that any list containing
       * the updated entry is refreshed.
       */
      void queryClient.invalidateQueries({
        queryKey:
          dailyEntryKeys.lists(
            user.id,
          ),
      });

      void queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
}

/**
 * ----------------------------------------------------
 * Remove Daily Entry
 * ----------------------------------------------------
 *
 * Used if the UI later allows the user
 * to delete an entry.
 *
 * DELETE /profile/daily-entries/:id
 */

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

      /**
       * Refresh all list queries.
       */
      void queryClient.invalidateQueries({
        queryKey:
          dailyEntryKeys.lists(user.id),
      });

      void queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
}