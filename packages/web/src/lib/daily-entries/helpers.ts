import type {
  DailyEntrySymptom,
  DailyEntryMedication,
  DailyEntryCondition,
  DailyEntryDoctorVisit,
} from "./daily-entries-exports";

import type {
  UserSymptom,
  UserMedication,
  UserCondition,
  UserDoctor,
  UserClinic,
} from "../health/health-export";

const APP_DATE_LOCALE = "en-US";

export function formatEntryDate(value: string): string {
  const date = new Date(value.includes("T") ? value : `${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(APP_DATE_LOCALE, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function getSymptomName(
  item: DailyEntrySymptom,
  symptoms: UserSymptom[],
): string {
  const userSymptom = symptoms.find(
    (symptom) =>
      symptom.id === item.userSymptomId,
  );

  return userSymptom?.catalog.name ?? "Unknown symptom";
}


export function getMedicationName(
  item: DailyEntryMedication,
  medications: UserMedication[],
): string {
  const userMedication = medications.find(
    (medication) =>
      medication.id === item.userMedicationId,
  );

  return (
    userMedication?.medication.name ??
    "Unknown medication"
  );
}


export function getConditionName(
  item: DailyEntryCondition,
  conditions: UserCondition[],
): string {
  const userCondition = conditions.find(
    (condition) =>
      condition.id === item.userConditionId,
  );

  return (
    userCondition?.condition.name ??
    "Unknown condition"
  );
}


export function getDoctorName(
  item: DailyEntryDoctorVisit,
  doctors: UserDoctor[],
): string {
  const userDoctor = doctors.find(
    (doctor) =>
      doctor.id === item.userDoctorId,
  );

  return (
    userDoctor?.doctor.name ??
    "Unknown doctor"
  );
}


export function getClinicName(
  item: DailyEntryDoctorVisit,
  clinics: UserClinic[],
): string | null {
  const userClinic = clinics.find(
    (clinic) =>
      clinic.id === item.userClinicId,
  );

  return userClinic?.clinic.name ?? null;
}

