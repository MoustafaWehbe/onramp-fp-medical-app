export const CONDITION_STATUSES = ["active", "inactive", "resolved"] as const;
export type ConditionStatus = (typeof CONDITION_STATUSES)[number];
