import type { ConditionStatus } from "../health/condition-status";

/**
 * ----------------------------------------------------
 * Daily Entry Response Types
 * ----------------------------------------------------
 */

export interface DailyEntrySymptom {
  id: string;
  userSymptomId: string;
  severity: number;
  notes: string | null;
}

export interface DailyEntryMedication {
  id: string;
  userMedicationId: string;
  quantity: number;
  unit: string;
  taken: boolean;
  takenAt: string | null;
  notes: string | null;
}

export interface DailyEntryCondition {
  id: string;
  userConditionId: string;
  status: ConditionStatus;
  notes: string | null;
}

export interface DailyEntryDoctorVisit {
  id: string;
  userDoctorId: string;
  userClinicId: string;
  summary: string;
  notes: string | null;
}

export interface DailyEntry {
  id: string;
  userId: string;
  entryDate: string;
  moodRating: number | null;
  sleepHours: number | null;
  journalNotes: string | null;
  createdAt: string;
  updatedAt: string;

  symptoms: DailyEntrySymptom[];
  medications: DailyEntryMedication[];
  conditions: DailyEntryCondition[];
  doctorVisits: DailyEntryDoctorVisit[];
}

/**
 * ----------------------------------------------------
 * Nested Create / Update Request Types
 * ----------------------------------------------------
 */

export interface DailyEntrySymptomRequest {
  userSymptomId: string;
  severity: number;
  notes?: string | null;
}

export interface DailyEntryMedicationRequest {
  userMedicationId: string;
  quantity: number;
  unit: string;
  taken: boolean;
  takenAt?: string | null;
  notes?: string | null;
}

export interface DailyEntryConditionRequest {
  userConditionId: string;
  status: ConditionStatus;
  notes?: string | null;
}

export interface DailyEntryDoctorVisitRequest {
  userDoctorId: string;
  userClinicId: string;
  summary: string;
  notes?: string | null;
}

/**
 * ----------------------------------------------------
 * Daily Entry Create Request
 * ----------------------------------------------------
 */

export interface CreateDailyEntryRequest {
  entryDate: string;
  moodRating?: number | null;
  sleepHours?: number | null;
  journalNotes?: string | null;

  symptoms?: DailyEntrySymptomRequest[];
  medications?: DailyEntryMedicationRequest[];
  conditions?: DailyEntryConditionRequest[];
  doctorVisits?: DailyEntryDoctorVisitRequest[];
}

/**
 * ----------------------------------------------------
 * Daily Entry Update Request
 * ----------------------------------------------------
 */

export interface UpdateDailyEntryRequest {
  entryDate?: string;
  moodRating?: number | null;
  sleepHours?: number | null;
  journalNotes?: string | null;

  symptoms?: DailyEntrySymptomRequest[];
  medications?: DailyEntryMedicationRequest[];
  conditions?: DailyEntryConditionRequest[];
  doctorVisits?: DailyEntryDoctorVisitRequest[];
}

/**
 * ----------------------------------------------------
 * Daily Entry List Query
 * ----------------------------------------------------
 */

export interface DailyEntriesQuery {
  currentPage?: number;
  pageSize?: number;
  fromDate?: string;
  toDate?: string;
}