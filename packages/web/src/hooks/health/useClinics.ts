import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { isAxiosError } from "axios";
import type { PaginationQuery } from "../../lib/api/types";
import {
  createCatalogClinic,
  createProfileClinic,
  findClinicCatalogByName,
  listCatalogClinics,
  listProfileClinics,
  removeProfileClinic,
  updateProfileClinic,
  type Clinic,
  type CreateUserClinicRequest,
  type UpdateUserClinicRequest,
} from "../../lib/health/health-export";

export const clinicKeys = {
  all: ["clinics"] as const,
  profile: (filters: PaginationQuery) =>
    [...clinicKeys.all, "profile", filters] as const,
  catalog: (search: string) =>
    [...clinicKeys.all, "catalog", search] as const,
};

export function useProfileClinics(filters: PaginationQuery = {}) {
  return useQuery({
    queryKey: clinicKeys.profile(filters),
    queryFn: () =>
      listProfileClinics({
        currentPage: filters.currentPage ?? 1,
        pageSize: filters.pageSize ?? 15,
        search: filters.search,
      }),
  });
}

export function useCatalogClinicSearch(search: string) {
  const trimmed = search.trim();
  return useQuery({
    queryKey: clinicKeys.catalog(trimmed),
    queryFn: () =>
      listCatalogClinics({
        search: trimmed,
        currentPage: 1,
        pageSize: 10,
      }),
    enabled: trimmed.length >= 2,
  });
}

export function useEnsureClinicCatalog() {
  return useMutation({
    mutationFn: async (body: {
      name: string;
      address: string;
      phone: string;
    }): Promise<Clinic> => {
      const existing = await findClinicCatalogByName(body.name);
      if (existing) return existing;
      try {
        return await createCatalogClinic(body);
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 409) {
          const existing = await findClinicCatalogByName(body.name);
          if (existing) return existing;
          const raced = await findClinicCatalogByName(body.name);
          if (raced) return raced;
        }
        throw error;
      }
    },
  });
}

export function useCreateProfileClinic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateUserClinicRequest) =>
      createProfileClinic(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: clinicKeys.all,
      });
    },
  });
}

export function useUpdateProfileClinic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: UpdateUserClinicRequest;
    }) => updateProfileClinic(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: clinicKeys.all,
      });
    },
  });
}

export function useRemoveProfileClinic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeProfileClinic(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: clinicKeys.all,
      });
    },
  });
}
