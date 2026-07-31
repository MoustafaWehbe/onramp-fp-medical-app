export const CONDITION_STATUSES = ["active", "inactive", "resolved"] as const;

export type ConditionStatus = (typeof CONDITION_STATUSES)[number];

export interface ConditionCatalog {
  id: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserCondition {
  id: string;
  userId: string;
  conditionId: string;
  description: string | null;
  diagnosedDate: string | null;
  status: ConditionStatus;
  notes: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  condition: {
    id: string;
    name: string;
  };
}

export interface CreateConditionRequest {
  name: string;
}

export interface CreateUserConditionRequest {
  conditionId: string;
  description?: string | null;
  diagnosedDate?: string | null;
  status?: ConditionStatus;
  notes?: string | null;
}

export interface UpdateUserConditionRequest {
  description?: string | null;
  diagnosedDate?: string | null;
  status?: ConditionStatus;
  notes?: string | null;
}

export interface ConditionSymptom {
  id: string;
  userConditionId: string;
  userSymptomId: string;
  createdAt: string;
  updatedAt: string;
  userCondition: {
    id: string;
    userId: string;
    conditionId: string;
    status: ConditionStatus;
    active: boolean;
    condition: { id: string; name: string };
  };
  userSymptom: {
    id: string;
    userId: string;
    catalogId: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    catalog: { id: string; name: string; category: string | null };
  };
}

export interface LinkConditionSymptomRequest {
  userSymptomId: string;
}

export interface UnlinkConditionSymptomResponse {
  message: string;
}
