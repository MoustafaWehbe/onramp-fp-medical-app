import type { DosageMeasurement } from "../dosage";

export interface Medication {
  id: string;
  name: string;
  strength: string | null;
  category: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface UserMedication {
  id: string;
  userId: string;
  medicationId: string;
  dosage: number | null;
  dosageMeasurement: DosageMeasurement | null;
  frequency: string | null;
  notes: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  medication: {
    id: string;
    name: string;
    strength: string | null;
    category: string | null;
  };
}

export interface CreateMedicationRequest {
  name: string;
  strength?: string;
  category?: string;
}

export interface CreateUserMedicationRequest {
  medicationId: string;
  dosage?: number | null;
  dosageMeasurement?: DosageMeasurement | null;
  frequency?: string | null;
  notes?: string | null;
}

export interface UpdateUserMedicationRequest {
  dosage?: number | null;
  dosageMeasurement?: DosageMeasurement | null;
  frequency?: string | null;
  notes?: string | null;
}
