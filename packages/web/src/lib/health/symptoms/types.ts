export interface SymptomCatalog {
  id: string;
  name: string;
  category: string | null;
  isCustom?: boolean;
  language?: "en" | "ar";
  createdAt: string;
  updatedAt?: string;
}

export interface UserSymptom {
  id: string;
  userId: string;
  catalogId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  catalog: {
    id: string;
    name: string;
    category: string | null;
    isCustom?: boolean;
    language?: "en" | "ar";
  };
}

export interface CreateSymptomRequest {
  name: string;
  category?: string;
  isCustom?: boolean;
}

export interface CreateUserSymptomRequest {
  catalogId: string;
}
