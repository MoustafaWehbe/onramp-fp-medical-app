import { searchConditionsFromApi } from "../lib/conditionCatalogApi";

export class ConditionService {
  async searchConditions(term?: string) {
    if (!term) return [];
    
    return await searchConditionsFromApi(term);
  }
}

export const conditionService = new ConditionService();