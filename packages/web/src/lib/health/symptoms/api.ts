import { apiClient } from "../../api-client";
import type {
  DataResponse,
  PaginatedResponse,
  PaginationQuery,
  SoftDeleteResponse,
} from "../../api/types";
import type {
  CreateSymptomRequest,
  CreateUserSymptomRequest,
  SymptomCatalog,
  UserSymptom,
} from "./types";

export async function listSymptomsCatalog(
  query: PaginationQuery = {},
): Promise<PaginatedResponse<SymptomCatalog>> {
  const { data } = await apiClient.get<PaginatedResponse<SymptomCatalog>>(
    "/catalog/symptoms",
    { params: query },
  );
  return data;
}

export async function searchSymptomsOnline(
  search: string,
): Promise<string[]> {
  const { data } = await apiClient.get<string[]>(
    "/catalog/symptoms/search-online",
    { params: { search } },
  );
  return data;
}

export async function createSymptomCatalog(
  body: CreateSymptomRequest,
): Promise<SymptomCatalog> {
  const { data } = await apiClient.post<DataResponse<SymptomCatalog>>(
    "/catalog/symptoms",
    body,
  );
  return data.data;
}

export async function listProfileSymptoms(
  query: PaginationQuery = {},
): Promise<PaginatedResponse<UserSymptom>> {
  const { data } = await apiClient.get<PaginatedResponse<UserSymptom>>(
    "/profile/symptoms",
    { params: query },
  );
  return data;
}

export async function createProfileSymptom(
  body: CreateUserSymptomRequest,
): Promise<UserSymptom> {
  const { data } = await apiClient.post<DataResponse<UserSymptom>>(
    "/profile/symptoms",
    body,
  );
  return data.data;
}

export async function getProfileSymptom(
  id: string,
): Promise<UserSymptom> {
  const { data } = await apiClient.get<DataResponse<UserSymptom>>(
    `/profile/symptoms/${id}`,
  );
  return data.data;
}

export async function removeProfileSymptom(
  id: string,
): Promise<SoftDeleteResponse> {
  const { data } = await apiClient.delete<DataResponse<SoftDeleteResponse>>(
    `/profile/symptoms/${id}`,
  );
  return data.data;
}

export async function findSymptomCatalogByName(
  name: string,
): Promise<SymptomCatalog | null> {
  const result = await listSymptomsCatalog({
    search: name,
    pageSize: 20,
    currentPage: 1,
  });
  const normalized = name.trim().toLocaleLowerCase();
  return (
    result.data.find(
      (s) => s.name.toLocaleLowerCase() === normalized,
    ) ?? null
  );
}
