import { useQuery } from "@tanstack/react-query";


import {
  listDoctorVisits,
  getDoctorVisitById,
  type EntryDoctorVisitsQuery,
  type EntryDoctorVisitsResponse,
  type EntryDoctorVisit,
} from "../lib/doctor-visit-entries/doctor-visit-exports";

export const doctorVisitKeys = {
  all: ["doctor-visits"] as const,

  lists: (userId: string) =>
    [...doctorVisitKeys.all, userId, "list"] as const,

  list: (
    userId: string,
    filters: EntryDoctorVisitsQuery,
  ) =>
    [
      ...doctorVisitKeys.lists(userId),
      filters,
    ] as const,

  details: (userId: string) =>
    [...doctorVisitKeys.all, userId, "detail"] as const,

  detail: (
    userId: string,
    id: string,
  ) =>
    [
      ...doctorVisitKeys.details(userId),
      id,
    ] as const,
};

export function useDoctorVisits(
  userId: string | undefined,
  filters: EntryDoctorVisitsQuery = {},
  enabled = true,
) {
  return useQuery<EntryDoctorVisitsResponse>({
    queryKey: userId
      ? doctorVisitKeys.list(userId, filters)
      : doctorVisitKeys.lists("user-disabled"),

    queryFn: () => {
      if (!userId) {
        throw new Error("User ID is required");
      }

      return listDoctorVisits({
        currentPage: filters.currentPage ?? 1,
        pageSize: filters.pageSize ?? 10,
      });
    },

    enabled: Boolean(userId) && enabled,
  });
}

export function useDoctorVisit(
  userId: string | undefined,
  id: string | undefined,
  enabled = true,
) {
  return useQuery<EntryDoctorVisit>({
    queryKey:
      userId && id
        ? doctorVisitKeys.detail(userId, id)
        : doctorVisitKeys.detail(
            "user-disabled",
            id ?? "id-disabled",
          ),

    queryFn: () => {
      if (!id) {
        throw new Error("Doctor visit ID is required");
      }

      return getDoctorVisitById(id);
    },

    enabled: Boolean(userId) && Boolean(id) && enabled,
  });
}