export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateDoctorRequest {
  name: string;
  specialty: string;
  phone: string;
}
