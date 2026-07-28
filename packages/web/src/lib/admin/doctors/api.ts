import { apiClient } from "../../api-client";
import type {
  DataResponse,
  PaginatedResponse,
  PaginationQuery,
} from "../../api/types";
import type { CreateDoctorRequest, Doctor } from "./types";

export async function listDoctors(
  query: PaginationQuery = {},
): Promise<PaginatedResponse<Doctor>> {
  const { data } = await apiClient.get<PaginatedResponse<Doctor>>("/doctors", {
    params: query,
  });
  return data;
}

export async function createDoctor(
  body: CreateDoctorRequest,
): Promise<Doctor> {
  const { data } = await apiClient.post<DataResponse<Doctor>>(
    "/doctors",
    body,
  );
  return data.data;
}
