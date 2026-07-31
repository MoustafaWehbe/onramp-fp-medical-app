export const MEDICATION_UNITS = [
  "mg",
  "g",
  "ml",
  "mcg",
  "tablet",
  "capsule",
  "drop",
] as const;

export type MedicationUnit =
  | typeof MEDICATION_UNITS[number]
  | "";