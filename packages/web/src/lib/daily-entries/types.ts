import type { ConditionStatus } from "../health/condition-status";

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
 * Request payload for a symptom attached to a daily entry.
 *
 * The backend creates the child `id`, so the frontend
 * only sends the user's profile symptom ID and entry data.
 */
export interface DailyEntrySymptomRequest {
  userSymptomId: string;
  severity: number;
  notes?: string | null;
}

/**
 * Request payload for a medication attached to a daily entry.
 */
export interface DailyEntryMedicationRequest {
  userMedicationId: string;
  quantity: number;
  unit: string;
  taken: boolean;
  takenAt?: string | null;
  notes?: string | null;
}

/**
 * Request payload for a condition attached to a daily entry.
 */
export interface DailyEntryConditionRequest {
  userConditionId: string;
  status: ConditionStatus;
  notes?: string | null;
}

/**
 * Request payload for a doctor visit attached to a daily entry.
 */
export interface DailyEntryDoctorVisitRequest {
  userDoctorId: string;
  userClinicId: string;
  summary: string;
  notes?: string | null;
}

/**
 * Request payload used when creating a daily entry.
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
 * Request payload used when updating a daily entry.
 *
 * Important:
 * If a child array is provided, the backend completely
 * replaces that collection.
 *
 * If a child array is omitted, the backend leaves the
 * existing collection unchanged.
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
 * Query parameters for listing the current user's daily entries.
 */
export interface DailyEntriesQuery {
  currentPage?: number;
  pageSize?: number;
  fromDate?: string;
  toDate?: string;
}