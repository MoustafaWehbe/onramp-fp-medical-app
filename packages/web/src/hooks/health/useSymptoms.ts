import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { isAxiosError } from "axios";
import type { PaginationQuery } from "../../lib/api/types";
import { fetchAllPages } from "../../lib/api/fetch-all-pages";
import {
  createProfileSymptom,
  createSymptomCatalog,
  findSymptomCatalogByName,
  listProfileSymptoms,
  listSymptomsCatalog,
  removeProfileSymptom,
  searchSymptomsOnline,
  type CreateUserSymptomRequest,
  type SymptomCatalog,
} from "../../lib/health/health-export";

export const symptomKeys = {
  all: ["symptoms"] as const,
  profile: (filters: PaginationQuery) =>
    [...symptomKeys.all, "profile", filters] as const,
  catalog: (search: string) =>
    [...symptomKeys.all, "catalog", search] as const,
  online: (search: string) =>
    [...symptomKeys.all, "online", search] as const,
};

export function useProfileSymptoms(filters: PaginationQuery = {}) {
  const pageSize = filters.pageSize ?? (filters.fetchAll ? 100 : 15);
  const search = filters.search;
  const currentPage = filters.currentPage ?? 1;

  return useQuery({
    queryKey: symptomKeys.profile(filters),
    queryFn: () =>
      filters.fetchAll
        ? fetchAllPages(
            (page, size) =>
              listProfileSymptoms({
                currentPage: page,
                pageSize: size,
                search,
              }),
            pageSize,
          )
        : listProfileSymptoms({
            currentPage,
            pageSize,
            search,
          }),
  });
}

export function useSymptomCatalogSearch(search: string) {
  const trimmed = search.trim();
  return useQuery({
    queryKey: symptomKeys.catalog(trimmed),
    queryFn: () =>
      listSymptomsCatalog({
        search: trimmed,
        currentPage: 1,
        pageSize: 10,
      }),
    enabled: trimmed.length >= 2,
  });
}

export function useOnlineSymptomSearch(
  search: string,
  enabled: boolean,
) {
  const trimmed = search.trim();
  return useQuery({
    queryKey: symptomKeys.online(trimmed),
    queryFn: () => searchSymptomsOnline(trimmed),
    enabled: enabled && trimmed.length >= 2,
  });
}

export function useEnsureSymptomCatalog() {
  return useMutation({
    mutationFn: async (name: string): Promise<SymptomCatalog> => {
      const existing = await findSymptomCatalogByName(name);
      if (existing) return existing;

      try {
        return await createSymptomCatalog({ name, isCustom: true });
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 409) {
          const raced = await findSymptomCatalogByName(name);
          if (raced) return raced;
        }
        throw error;
      }
    },
  });
}

export function useCreateProfileSymptom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateUserSymptomRequest) =>
      createProfileSymptom(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: symptomKeys.all,
      });
    },
  });
}

export function useRemoveProfileSymptom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeProfileSymptom(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: symptomKeys.all,
      });
    },
  });
}
