import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { isAxiosError } from "axios";
import type { PaginationQuery } from "../../lib/api/types";
import {
  createConditionCatalog,
  createProfileCondition,
  findConditionCatalogByName,
  listConditionsCatalog,
  listProfileConditions,
  removeProfileCondition,
  searchConditionsOnline,
  updateProfileCondition,
  type ConditionCatalog,
  type CreateUserConditionRequest,
  type UpdateUserConditionRequest,
} from "../../lib/health/health-export";

export const conditionKeys = {
  all: ["conditions"] as const,
  profile: (filters: PaginationQuery) =>
    [...conditionKeys.all, "profile", filters] as const,
  catalog: (search: string) =>
    [...conditionKeys.all, "catalog", search] as const,
  online: (search: string) =>
    [...conditionKeys.all, "online", search] as const,
};

export function useProfileConditions(filters: PaginationQuery = {}) {
  return useQuery({
    queryKey: conditionKeys.profile(filters),
    queryFn: () =>
      listProfileConditions({
        currentPage: filters.currentPage ?? 1,
        pageSize: filters.pageSize ?? 15,
        search: filters.search,
      }),
  });
}

export function useConditionCatalogSearch(search: string) {
  const trimmed = search.trim();
  return useQuery({
    queryKey: conditionKeys.catalog(trimmed),
    queryFn: () =>
      listConditionsCatalog({
        search: trimmed,
        currentPage: 1,
        pageSize: 10,
      }),
    enabled: trimmed.length >= 2,
  });
}

export function useOnlineConditionSearch(
  search: string,
  enabled: boolean,
) {
  const trimmed = search.trim();
  return useQuery({
    queryKey: conditionKeys.online(trimmed),
    queryFn: () => searchConditionsOnline(trimmed),
    enabled: enabled && trimmed.length >= 2,
  });
}

export function useEnsureConditionCatalog() {
  return useMutation({
    mutationFn: async (name: string): Promise<ConditionCatalog> => {
      try {
        return await createConditionCatalog({ name });
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 409) {
          const existing = await findConditionCatalogByName(name);
          if (existing) return existing;
        }
        throw error;
      }
    },
  });
}

export function useCreateProfileCondition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateUserConditionRequest) =>
      createProfileCondition(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: conditionKeys.all,
      });
    },
  });
}

export function useUpdateProfileCondition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: UpdateUserConditionRequest;
    }) => updateProfileCondition(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: conditionKeys.all,
      });
    },
  });
}

export function useRemoveProfileCondition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeProfileCondition(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: conditionKeys.all,
      });
    },
  });
}
