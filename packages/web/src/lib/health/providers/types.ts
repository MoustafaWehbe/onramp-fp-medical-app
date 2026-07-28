export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserClinic {
  id: string;
  userId: string;
  clinicId: string;
  notes: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  clinic: {
    id: string;
    name: string;
    address: string;
    phone: string;
  };
}

export interface UserDoctor {
  id: string;
  userId: string;
  doctorId: string;
  userClinicId: string | null;
  notes: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  doctor: {
    id: string;
    name: string;
    specialty: string;
    phone: string;
  };
  userClinic?: {
    id: string;
    clinicId: string;
    notes: string | null;
  } | null;
}

export interface CreateDoctorRequest {
  name: string;
  specialty: string;
  phone: string;
}

export interface CreateClinicRequest {
  name: string;
  address: string;
  phone: string;
}

export interface CreateUserClinicRequest {
  clinicId: string;
  notes?: string | null;
}

export interface UpdateUserClinicRequest {
  notes: string | null;
}

export interface CreateUserDoctorRequest {
  doctorId: string;
  userClinicId?: string | null;
  notes?: string | null;
}

export interface UpdateUserDoctorRequest {
  userClinicId?: string | null;
  notes?: string | null;
}
