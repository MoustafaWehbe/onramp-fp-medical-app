export interface EntryDoctorVisitDoctor {
  id: string;
  name: string;
  specialty: string;
}

export interface EntryDoctorVisitClinic {
  id: string;
  name: string;
  address: string;
}

export interface EntryDoctorVisitUserDoctor {
  id: string;
  doctor: EntryDoctorVisitDoctor;
}

export interface EntryDoctorVisitUserClinic {
  id: string;
  clinic: EntryDoctorVisitClinic;
}

export interface EntryDoctorVisitEntry {
  id: string;
  entryDate: string;
}

export interface EntryDoctorVisit {
  id: string;
  entryId: string;
  userDoctorId: string;
  userClinicId: string | null;
  summary: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;

  entry: EntryDoctorVisitEntry;
  userDoctor: EntryDoctorVisitUserDoctor;
  userClinic: EntryDoctorVisitUserClinic | null;
}

export interface EntryDoctorVisitsResponse {
  data: EntryDoctorVisit[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface EntryDoctorVisitsQuery {
  currentPage?: number;
  pageSize?: number;
}