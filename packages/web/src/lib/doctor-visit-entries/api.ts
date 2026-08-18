import { apiClient } from "../api-client";

import type {
    EntryDoctorVisit,
    EntryDoctorVisitsResponse,
    EntryDoctorVisitsQuery,

} from "./types";

export const listDoctorVisits = async (
  query: EntryDoctorVisitsQuery,
): Promise<EntryDoctorVisitsResponse> => {
  const { data } = await apiClient.get<EntryDoctorVisitsResponse>(
    "/profile/doctor-visits",
    {
      params: query,
    },
  );

  return data;
};

export const getDoctorVisitById = async (
  id: string,
): Promise<EntryDoctorVisit> => {
  const { data } = await apiClient.get<{ data: EntryDoctorVisit }>(
    `/profile/doctor-visits/${id}`,
  );

  return data.data;
};