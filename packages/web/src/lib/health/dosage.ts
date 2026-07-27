export const DOSAGE_MEASUREMENTS = [
  "mg",
  "g",
  "ml",
  "mcg",
  "tablet",
  "capsule",
  "drop",
  "unit",
] as const;

export type DosageMeasurement = (typeof DOSAGE_MEASUREMENTS)[number];
