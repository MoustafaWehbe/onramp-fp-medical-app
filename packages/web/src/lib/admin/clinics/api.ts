import { apiClient } from "../../api-client";
import type {
  DataResponse,
  PaginatedResponse,
  PaginationQuery,
} from "../../api/types";
import type { Clinic, CreateClinicRequest } from "./types";

export async function listClinics(
  query: PaginationQuery = {},
): Promise<PaginatedResponse<Clinic>> {
  const { data } = await apiClient.get<PaginatedResponse<Clinic>>("/clinics", {
    params: query,
  });
  return data;
}

export async function createClinic(
  body: CreateClinicRequest,
): Promise<Clinic> {
  const { data } = await apiClient.post<DataResponse<Clinic>>(
    "/clinics",
    body,
  );
  return data.data;
}
