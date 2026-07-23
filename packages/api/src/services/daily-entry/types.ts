import type { PaginationInput } from "../../lib/pagination";
import type { ConditionStatus } from "../../../../shared/db/types/enums";

export interface EntrySymptomInput {
  userSymptomId: string;
  severity?: number | null;
  notes?: string | null;
}

export interface EntryConditionInput {
  userConditionId: string;
  status?: ConditionStatus;
  notes?: string | null;
}

export interface EntryMedicationInput {
  userMedicationId: string;
  quantity?: number;
  unit: string;
  taken?: boolean;
  takenAt?: string | null;
  notes?: string | null;
}

export interface EntryDoctorVisitInput {
  userDoctorId: string;
  userClinicId?: string | null;
  summary?: string | null;
  notes?: string | null;
}

export interface CreateDailyEntryInput {
  userId: string;
  entryDate: string;
  moodRating?: number | null;
  sleepHours?: number | null;
  journalNotes?: string | null;
  symptoms?: EntrySymptomInput[];
  conditions?: EntryConditionInput[];
  medications?: EntryMedicationInput[];
  doctorVisits?: EntryDoctorVisitInput[];
}

export interface UpdateDailyEntryInput
  extends Partial<Omit<CreateDailyEntryInput, "userId">> {
  userId: string;
  id: string;
}

export interface ListDailyEntriesInput extends PaginationInput {
  userId: string;
  fromDate?: string;
  toDate?: string;
}
