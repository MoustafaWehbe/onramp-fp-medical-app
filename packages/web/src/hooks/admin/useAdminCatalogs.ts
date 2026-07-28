import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PaginationQuery } from "../../lib/api/types";
import {
  createCatalogMedication,
  listCatalogMedications,
  lookupMedicationCategoryOnline,
  type CreateMedicationRequest,
} from "../../lib/health/health-export";
import {
  createConditionCatalog,
  listConditionsCatalog,
} from "../../lib/health/conditions/api";
import type { CreateConditionRequest } from "../../lib/health/conditions/types";
import {
  createSymptomCatalog,
  listSymptomsCatalog,
} from "../../lib/health/symptoms/api";
import type { CreateSymptomRequest } from "../../lib/health/symptoms/types";
import { createClinic, listClinics } from "../../lib/admin/clinics/api";
import type { CreateClinicRequest } from "../../lib/admin/clinics/types";
import { createDoctor, listDoctors } from "../../lib/admin/doctors/api";
import type { CreateDoctorRequest } from "../../lib/admin/doctors/types";

export const adminCatalogKeys = {
  all: ["admin-catalog"] as const,
  medications: (filters: PaginationQuery) =>
    [...adminCatalogKeys.all, "medications", filters] as const,
  conditions: (filters: PaginationQuery) =>
    [...adminCatalogKeys.all, "conditions", filters] as const,
  symptoms: (filters: PaginationQuery) =>
    [...adminCatalogKeys.all, "symptoms", filters] as const,
  clinics: (filters: PaginationQuery) =>
    [...adminCatalogKeys.all, "clinics", filters] as const,
  doctors: (filters: PaginationQuery) =>
    [...adminCatalogKeys.all, "doctors", filters] as const,
};

const PAGE_SIZE = 15;

function listFilters(
  currentPage: number,
  search: string,
): PaginationQuery {
  return {
    currentPage,
    pageSize: PAGE_SIZE,
    search: search.trim() || undefined,
  };
}

export function useAdminMedications(currentPage: number, search: string) {
  const filters = listFilters(currentPage, search);
  return useQuery({
    queryKey: adminCatalogKeys.medications(filters),
    queryFn: () => listCatalogMedications(filters),
  });
}

export function useCreateAdminMedication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateMedicationRequest) => {
      let category = body.category?.trim() || undefined;
      if (!category) {
        category =
          (await lookupMedicationCategoryOnline(body.name).catch(() => null)) ??
          undefined;
      }
      return createCatalogMedication({
        name: body.name,
        ...(body.strength ? { strength: body.strength } : {}),
        ...(category ? { category } : {}),
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminCatalogKeys.all,
      });
    },
  });
}

export function useAdminConditions(currentPage: number, search: string) {
  const filters = listFilters(currentPage, search);
  return useQuery({
    queryKey: adminCatalogKeys.conditions(filters),
    queryFn: () => listConditionsCatalog(filters),
  });
}

export function useCreateAdminCondition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateConditionRequest) =>
      createConditionCatalog(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminCatalogKeys.all,
      });
    },
  });
}

export function useAdminSymptoms(currentPage: number, search: string) {
  const filters = listFilters(currentPage, search);
  return useQuery({
    queryKey: adminCatalogKeys.symptoms(filters),
    queryFn: () => listSymptomsCatalog(filters),
  });
}

export function useCreateAdminSymptom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateSymptomRequest) => createSymptomCatalog(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminCatalogKeys.all,
      });
    },
  });
}

export function useAdminClinics(currentPage: number, search: string) {
  const filters = listFilters(currentPage, search);
  return useQuery({
    queryKey: adminCatalogKeys.clinics(filters),
    queryFn: () => listClinics(filters),
  });
}

export function useCreateAdminClinic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateClinicRequest) => createClinic(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminCatalogKeys.all,
      });
    },
  });
}

export function useAdminDoctors(currentPage: number, search: string) {
  const filters = listFilters(currentPage, search);
  return useQuery({
    queryKey: adminCatalogKeys.doctors(filters),
    queryFn: () => listDoctors(filters),
  });
}

export function useCreateAdminDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateDoctorRequest) => createDoctor(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminCatalogKeys.all,
      });
    },
  });
}
