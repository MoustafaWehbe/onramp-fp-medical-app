import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { isAxiosError } from "axios";
import type { PaginationQuery } from "../../lib/api/types";
import {
  createCatalogDoctor,
  createProfileDoctor,
  findDoctorCatalogByName,
  listCatalogDoctors,
  listProfileClinics,
  listProfileDoctors,
  removeProfileDoctor,
  updateProfileDoctor,
  type CreateUserDoctorRequest,
  type Doctor,
  type UpdateUserDoctorRequest,
} from "../../lib/health/health-export";

export const doctorKeys = {
  all: ["doctors"] as const,
  profile: (filters: PaginationQuery) =>
    [...doctorKeys.all, "profile", filters] as const,
  catalog: (search: string) =>
    [...doctorKeys.all, "catalog", search] as const,
};

export function useProfileDoctors(filters: PaginationQuery = {}) {
  return useQuery({
    queryKey: doctorKeys.profile(filters),
    queryFn: () =>
      listProfileDoctors({
        currentPage: filters.currentPage ?? 1,
        pageSize: filters.pageSize ?? 15,
        search: filters.search,
      }),
  });
}

export function useCatalogDoctorSearch(search: string) {
  const trimmed = search.trim();
  return useQuery({
    queryKey: doctorKeys.catalog(trimmed),
    queryFn: () =>
      listCatalogDoctors({
        search: trimmed,
        currentPage: 1,
        pageSize: 10,
      }),
    enabled: trimmed.length >= 2,
  });
}

export function useEnsureDoctorCatalog() {
  return useMutation({
    mutationFn: async (body: {
      name: string;
      specialty: string;
      phone: string;
    }): Promise<Doctor> => {
      const existing = await findDoctorCatalogByName(body.name);
      if (existing) return existing;
      try {
        return await createCatalogDoctor(body);
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 409) {
          const existing = await findDoctorCatalogByName(body.name);
          if (existing) return existing;
          const raced = await findDoctorCatalogByName(body.name);
          if (raced) return raced;
        }
        throw error;
      }
    },
  });
}

export function useCreateProfileDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateUserDoctorRequest) =>
      createProfileDoctor(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: doctorKeys.all,
      });
    },
  });
}

export function useUpdateProfileDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: UpdateUserDoctorRequest;
    }) => updateProfileDoctor(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: doctorKeys.all,
      });
    },
  });
}

export function useRemoveProfileDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeProfileDoctor(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: doctorKeys.all,
      });
    },
  });
}

export function useSavedClinics() {
  return useQuery({
    queryKey: ["clinics", "profile", { pageSize: 100, currentPage: 1 }],
    queryFn: () =>
      listProfileClinics({ currentPage: 1, pageSize: 100 }),
  });
}
