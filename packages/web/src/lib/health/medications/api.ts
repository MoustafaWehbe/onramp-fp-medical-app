import { apiClient } from "../../api-client";
import type {
  DataResponse,
  PaginatedResponse,
  PaginationQuery,
  SoftDeleteResponse,
} from "../../api/types";
import type {
  CreateMedicationRequest,
  CreateUserMedicationRequest,
  Medication,
  UpdateUserMedicationRequest,
  UserMedication,
} from "./types";

export async function listCatalogMedications(
  query: PaginationQuery = {},
): Promise<PaginatedResponse<Medication>> {
  const { data } = await apiClient.get<PaginatedResponse<Medication>>(
    "/medications",
    { params: query },
  );
  return data;
}

export async function searchMedicationsOnline(
  search: string,
): Promise<string[]> {
  const { data } = await apiClient.get<string[]>(
    "/medications/search-online",
    { params: { search } },
  );
  return data;
}

export async function lookupMedicationCategoryOnline(
  name: string,
): Promise<string | null> {
  const { data } = await apiClient.get<string | null>(
    "/medications/category-online",
    { params: { name } },
  );
  return data;
}

export async function createCatalogMedication(
  body: CreateMedicationRequest,
): Promise<Medication> {
  const { data } = await apiClient.post<DataResponse<Medication>>(
    "/medications",
    body,
  );
  return data.data;
}

export async function listProfileMedications(
  query: PaginationQuery = {},
): Promise<PaginatedResponse<UserMedication>> {
  const { data } = await apiClient.get<PaginatedResponse<UserMedication>>(
    "/profile/medications",
    { params: query },
  );
  return data;
}

export async function createProfileMedication(
  body: CreateUserMedicationRequest,
): Promise<UserMedication> {
  const { data } = await apiClient.post<DataResponse<UserMedication>>(
    "/profile/medications",
    body,
  );
  return data.data;
}

export async function updateProfileMedication(
  id: string,
  body: UpdateUserMedicationRequest,
): Promise<UserMedication> {
  const { data } = await apiClient.patch<DataResponse<UserMedication>>(
    `/profile/medications/${id}`,
    body,
  );
  return data.data;
}

export async function removeProfileMedication(
  id: string,
): Promise<SoftDeleteResponse> {
  const { data } = await apiClient.delete<DataResponse<SoftDeleteResponse>>(
    `/profile/medications/${id}`,
  );
  return data.data;
}

/** Resolve an existing catalog med when create returns 409 (name+strength unique). */
export async function findCatalogMedicationByName(
  name: string,
): Promise<Medication | null> {
  const result = await listCatalogMedications({
    search: name,
    pageSize: 20,
    currentPage: 1,
  });
  const normalized = name.trim().toLocaleLowerCase();
  return (
    result.data.find(
      (med) =>
        med.name.toLocaleLowerCase() === normalized && med.strength == null,
    ) ??
    result.data.find((med) => med.name.toLocaleLowerCase() === normalized) ??
    null
  );
}
