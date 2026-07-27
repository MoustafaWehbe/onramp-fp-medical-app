export interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateClinicRequest {
  name: string;
  address: string;
  phone: string;
}
