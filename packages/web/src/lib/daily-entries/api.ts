import { apiClient } from "../api-client";
import type {
  DataResponse,
  PaginatedResponse,
  SoftDeleteResponse,
} from "../api/types";
import type {
  CreateDailyEntryRequest,
  DailyEntriesQuery,
  DailyEntry,
  UpdateDailyEntryRequest,
} from "./types";

/**
 * List the current user's daily entries.
 *
 * Supports:
 * - Pagination
 * - Optional date range filtering
 *
 * GET /profile/daily-entries
 */
export async function listDailyEntries(
  query: DailyEntriesQuery = {},
): Promise<PaginatedResponse<DailyEntry>> {
  const { data } = await apiClient.get<PaginatedResponse<DailyEntry>>(
    "/profile/daily-entries",
    {
      params: query,
    },
  );

  return data;
}

/**
 * Get a single daily entry by ID.
 *
 * The response includes all nested children:
 * - symptoms
 * - medications
 * - conditions
 * - doctor visits
 *
 * GET /profile/daily-entries/:id
 */
export async function getDailyEntry(
  id: string,
): Promise<DailyEntry> {
  const { data } = await apiClient.get<DataResponse<DailyEntry>>(
    `/profile/daily-entries/${id}`,
  );

  return data.data;
}

/**
 * Create a daily entry with all nested children.
 *
 * POST /profile/daily-entries
 */
export async function createDailyEntry(
  body: CreateDailyEntryRequest,
): Promise<DailyEntry> {
  const { data } = await apiClient.post<DataResponse<DailyEntry>>(
    "/profile/daily-entries",
    body,
  );

  return data.data;
}

/**
 * Update a daily entry.
 *
 * Important backend behaviour:
 * - Scalar fields can be updated independently.
 * - If a child array is included, the entire collection is replaced.
 * - If a child array is omitted, the existing collection is unchanged.
 *
 * PATCH /profile/daily-entries/:id
 */
export async function updateDailyEntry(
  id: string,
  body: UpdateDailyEntryRequest,
): Promise<DailyEntry> {
  const { data } = await apiClient.patch<DataResponse<DailyEntry>>(
    `/profile/daily-entries/${id}`,
    body,
  );

  return data.data;
}

/**
 * Delete a daily entry.
 *
 * The backend cascade-deletes all child records belonging
 * to the deleted daily entry.
 *
 * DELETE /profile/daily-entries/:id
 */
export async function removeDailyEntry(
  id: string,
): Promise<SoftDeleteResponse> {
  const { data } = await apiClient.delete<
    DataResponse<SoftDeleteResponse>
  >(`/profile/daily-entries/${id}`);

  return data.data;
}