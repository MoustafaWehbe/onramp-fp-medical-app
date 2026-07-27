import { apiClient } from "../../api-client";
import type {
  DataResponse,
  PaginatedResponse,
  PaginationQuery,
  SoftDeleteResponse,
} from "../../api/types";
import type {
  ConditionCatalog,
  CreateConditionRequest,
  CreateUserConditionRequest,
  UpdateUserConditionRequest,
  UserCondition,
} from "./types";

export async function listConditionsCatalog(
  query: PaginationQuery = {},
): Promise<PaginatedResponse<ConditionCatalog>> {
  const { data } = await apiClient.get<PaginatedResponse<ConditionCatalog>>(
    "/conditions",
    { params: query },
  );
  return data;
}

export async function searchConditionsOnline(
  search: string,
): Promise<string[]> {
  const { data } = await apiClient.get<string[]>(
    "/conditions/search-online",
    { params: { search } },
  );
  return data;
}

export async function createConditionCatalog(
  body: CreateConditionRequest,
): Promise<ConditionCatalog> {
  const { data } = await apiClient.post<DataResponse<ConditionCatalog>>(
    "/conditions",
    body,
  );
  return data.data;
}

export async function listProfileConditions(
  query: PaginationQuery = {},
): Promise<PaginatedResponse<UserCondition>> {
  const { data } = await apiClient.get<PaginatedResponse<UserCondition>>(
    "/profile/conditions",
    { params: query },
  );
  return data;
}

export async function createProfileCondition(
  body: CreateUserConditionRequest,
): Promise<UserCondition> {
  const { data } = await apiClient.post<DataResponse<UserCondition>>(
    "/profile/conditions",
    body,
  );
  return data.data;
}

export async function getProfileCondition(
  id: string,
): Promise<UserCondition> {
  const { data } = await apiClient.get<DataResponse<UserCondition>>(
    `/profile/conditions/${id}`,
  );
  return data.data;
}

export async function updateProfileCondition(
  id: string,
  body: UpdateUserConditionRequest,
): Promise<UserCondition> {
  const { data } = await apiClient.patch<DataResponse<UserCondition>>(
    `/profile/conditions/${id}`,
    body,
  );
  return data.data;
}

export async function removeProfileCondition(
  id: string,
): Promise<SoftDeleteResponse> {
  const { data } = await apiClient.delete<DataResponse<SoftDeleteResponse>>(
    `/profile/conditions/${id}`,
  );
  return data.data;
}

export async function findConditionCatalogByName(
  name: string,
): Promise<ConditionCatalog | null> {
  const result = await listConditionsCatalog({
    search: name,
    pageSize: 20,
    currentPage: 1,
  });
  const normalized = name.trim().toLocaleLowerCase();
  return (
    result.data.find(
      (c) => c.name.toLocaleLowerCase() === normalized,
    ) ?? null
  );
}
