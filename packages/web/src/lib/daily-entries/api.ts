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

export async function getDailyEntry(
  id: string,
): Promise<DailyEntry> {
  const { data } = await apiClient.get<
    DataResponse<DailyEntry>
  >(`/profile/daily-entries/${id}`);

  return data.data;
}

export async function createDailyEntry(
  body: CreateDailyEntryRequest,
): Promise<DailyEntry> {
  const { data } = await apiClient.post<
    DataResponse<DailyEntry>
  >("/profile/daily-entries", body);

  return data.data;
}

export async function updateDailyEntry(
  id: string,
  body: UpdateDailyEntryRequest,
): Promise<DailyEntry> {
  const { data } = await apiClient.patch<
    DataResponse<DailyEntry>
  >(`/profile/daily-entries/${id}`, body);

  return data.data;
}

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