import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { isAxiosError } from "axios";
import type { PaginationQuery } from "../../lib/api/types";
import {
  createCatalogMedication,
  createProfileMedication,
  findCatalogMedicationByName,
  listCatalogMedications,
  listProfileMedications,
  lookupMedicationCategoryOnline,
  removeProfileMedication,
  searchMedicationsOnline,
  updateProfileMedication,
  type CreateUserMedicationRequest,
  type Medication,
  type UpdateUserMedicationRequest,
} from "../../lib/health/health-export";

export const medicationKeys = {
  all: ["medications"] as const,
  profile: (filters: PaginationQuery) =>
    [...medicationKeys.all, "profile", filters] as const,
  catalog: (search: string) =>
    [...medicationKeys.all, "catalog", search] as const,
  online: (search: string) =>
    [...medicationKeys.all, "online", search] as const,
};

export function useProfileMedications(filters: PaginationQuery = {}) {
  return useQuery({
    queryKey: medicationKeys.profile(filters),
    queryFn: () =>
      listProfileMedications({
        currentPage: filters.currentPage ?? 1,
        pageSize: filters.pageSize ?? 15,
        search: filters.search,
      }),
  });
}

export function useCatalogMedicationSearch(search: string) {
  const trimmed = search.trim();
  return useQuery({
    queryKey: medicationKeys.catalog(trimmed),
    queryFn: () =>
      listCatalogMedications({
        search: trimmed,
        currentPage: 1,
        pageSize: 10,
      }),
    enabled: trimmed.length >= 2,
  });
}

export function useOnlineMedicationSearch(
  search: string,
  enabled: boolean,
) {
  const trimmed = search.trim();
  return useQuery({
    queryKey: medicationKeys.online(trimmed),
    queryFn: () => searchMedicationsOnline(trimmed),
    enabled: enabled && trimmed.length >= 2,
  });
}

export function useEnsureCatalogMedication() {
  return useMutation({
    mutationFn: async (name: string): Promise<Medication> => {
      // Category lookup happens here, at submit time — after the user
      // confirms the medication — since the catalog has no update endpoint.
      const category = await lookupMedicationCategoryOnline(name).catch(
        () => null,
      );
      try {
        return await createCatalogMedication({
          name,
          ...(category ? { category } : {}),
        });
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 409) {
          const existing = await findCatalogMedicationByName(name);
          if (existing) return existing;
        }
        throw error;
      }
    },
  });
}

export function useCreateProfileMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateUserMedicationRequest) =>
      createProfileMedication(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: medicationKeys.all,
      });
    },
  });
}

export function useUpdateProfileMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: UpdateUserMedicationRequest;
    }) => updateProfileMedication(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: medicationKeys.all,
      });
    },
  });
}

export function useRemoveProfileMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeProfileMedication(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: medicationKeys.all,
      });
    },
  });
}
