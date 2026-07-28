import { apiClient } from "../../api-client";
import type {
  DataResponse,
  PaginatedResponse,
  PaginationQuery,
  SoftDeleteResponse,
} from "../../api/types";
import type {
  Clinic,
  CreateClinicRequest,
  CreateDoctorRequest,
  CreateUserClinicRequest,
  CreateUserDoctorRequest,
  Doctor,
  UpdateUserClinicRequest,
  UpdateUserDoctorRequest,
  UserClinic,
  UserDoctor,
} from "./types";

export async function listCatalogDoctors(
  query: PaginationQuery = {},
): Promise<PaginatedResponse<Doctor>> {
  const { data } = await apiClient.get<PaginatedResponse<Doctor>>("/doctors", {
    params: query,
  });
  return data;
}

export async function createCatalogDoctor(
  body: CreateDoctorRequest,
): Promise<Doctor> {
  const { data } = await apiClient.post<DataResponse<Doctor>>("/doctors", body);
  return data.data;
}

export async function findDoctorCatalogByName(
  name: string,
): Promise<Doctor | null> {
  const result = await listCatalogDoctors({
    search: name,
    pageSize: 20,
    currentPage: 1,
  });
  const normalized = name.trim().toLocaleLowerCase();
  return (
    result.data.find(
      (d) => d.name.toLocaleLowerCase() === normalized,
    ) ?? null
  );
}

export async function listCatalogClinics(
  query: PaginationQuery = {},
): Promise<PaginatedResponse<Clinic>> {
  const { data } = await apiClient.get<PaginatedResponse<Clinic>>("/clinics", {
    params: query,
  });
  return data;
}

export async function createCatalogClinic(
  body: CreateClinicRequest,
): Promise<Clinic> {
  const { data } = await apiClient.post<DataResponse<Clinic>>(
    "/clinics",
    body,
  );
  return data.data;
}

export async function findClinicCatalogByName(
  name: string,
): Promise<Clinic | null> {
  const result = await listCatalogClinics({
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

export async function listProfileClinics(
  query: PaginationQuery = {},
): Promise<PaginatedResponse<UserClinic>> {
  const { data } = await apiClient.get<PaginatedResponse<UserClinic>>(
    "/profile/clinics",
    { params: query },
  );
  return data;
}

export async function createProfileClinic(
  body: CreateUserClinicRequest,
): Promise<UserClinic> {
  const { data } = await apiClient.post<DataResponse<UserClinic>>(
    "/profile/clinics",
    body,
  );
  return data.data;
}

export async function updateProfileClinic(
  id: string,
  body: UpdateUserClinicRequest,
): Promise<UserClinic> {
  const { data } = await apiClient.patch<DataResponse<UserClinic>>(
    `/profile/clinics/${id}`,
    body,
  );
  return data.data;
}

export async function removeProfileClinic(
  id: string,
): Promise<SoftDeleteResponse> {
  const { data } = await apiClient.delete<DataResponse<SoftDeleteResponse>>(
    `/profile/clinics/${id}`,
  );
  return data.data;
}

export async function listProfileDoctors(
  query: PaginationQuery = {},
): Promise<PaginatedResponse<UserDoctor>> {
  const { data } = await apiClient.get<PaginatedResponse<UserDoctor>>(
    "/profile/doctors",
    { params: query },
  );
  return data;
}

export async function createProfileDoctor(
  body: CreateUserDoctorRequest,
): Promise<UserDoctor> {
  const { data } = await apiClient.post<DataResponse<UserDoctor>>(
    "/profile/doctors",
    body,
  );
  return data.data;
}

export async function updateProfileDoctor(
  id: string,
  body: UpdateUserDoctorRequest,
): Promise<UserDoctor> {
  const { data } = await apiClient.patch<DataResponse<UserDoctor>>(
    `/profile/doctors/${id}`,
    body,
  );
  return data.data;
}

export async function removeProfileDoctor(
  id: string,
): Promise<SoftDeleteResponse> {
  const { data } = await apiClient.delete<DataResponse<SoftDeleteResponse>>(
    `/profile/doctors/${id}`,
  );
  return data.data;
}
