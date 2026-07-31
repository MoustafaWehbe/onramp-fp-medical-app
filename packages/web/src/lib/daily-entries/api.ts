import { apiClient } from "../api-client";
import type {
  DataResponse,
  PaginatedResponse,
} from "../api/types";

import type {
  CreateDailyEntryRequest,
  DailyEntriesQuery,
  DailyEntry,
  UpdateDailyEntryRequest,
} from "./types";

/**
 * ----------------------------------------------------
 * List Daily Entries
 * ----------------------------------------------------
 *
 * GET /profile/daily-entries
 *
 * Supports:
 * - Pagination
 * - Optional date filtering
 */

export async function listDailyEntries(
  query: DailyEntriesQuery = {},
): Promise<PaginatedResponse<DailyEntry>> {
  const { data } = await apiClient.get<
    PaginatedResponse<DailyEntry>
  >("/profile/daily-entries", {
    params: query,
  });

  return data;
}

/**
 * ----------------------------------------------------
 * Get Daily Entry By ID
 * ----------------------------------------------------
 *
 * GET /profile/daily-entries/:id
 *
 * Returns the full entry including:
 * - Symptoms
 * - Medications
 * - Conditions
 * - Doctor visits
 */

export async function getDailyEntry(
  id: string,
): Promise<DailyEntry> {
  const { data } = await apiClient.get<
    DataResponse<DailyEntry>
  >(`/profile/daily-entries/${id}`);

  return data.data;
}

/**
 * ----------------------------------------------------
 * Create Daily Entry
 * ----------------------------------------------------
 *
 * POST /profile/daily-entries
 *
 * The request includes:
 * - Basic daily information
 * - Symptoms
 * - Medications
 * - Conditions
 * - Doctor visits
 *
 * The backend prevents duplicate entries
 * for the same date.
 */

export async function createDailyEntry(
  body: CreateDailyEntryRequest,
): Promise<DailyEntry> {
  const { data } = await apiClient.post<
    DataResponse<DailyEntry>
  >("/profile/daily-entries", body);

  return data.data;
}

/**
 * ----------------------------------------------------
 * Update Daily Entry
 * ----------------------------------------------------
 *
 * PATCH /profile/daily-entries/:id
 *
 * Important:
 * If a child collection is provided,
 * the backend replaces the entire collection.
 */

export async function updateDailyEntry(
  id: string,
  body: UpdateDailyEntryRequest,
): Promise<DailyEntry> {
  const { data } = await apiClient.patch<
    DataResponse<DailyEntry>
  >(`/profile/daily-entries/${id}`, body);

  return data.data;
}

/**
 * ----------------------------------------------------
 * Delete Daily Entry
 * ----------------------------------------------------
 *
 * DELETE /profile/daily-entries/:id
 *
 * The backend cascade-deletes the children.
 */

export async function removeDailyEntry(
  id: string,
): Promise<{ id: string; message: string }> {
  const { data } = await apiClient.delete<
    DataResponse<{
      id: string;
      message: string;
    }>
  >(`/profile/daily-entries/${id}`);

  return data.data;
}