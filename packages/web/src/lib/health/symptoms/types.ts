export interface SymptomCatalog {
  id: string;
  name: string;
  category: string | null;
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
  };
}

export interface CreateSymptomRequest {
  name: string;
  category?: string;
}

export interface CreateUserSymptomRequest {
  catalogId: string;
}
