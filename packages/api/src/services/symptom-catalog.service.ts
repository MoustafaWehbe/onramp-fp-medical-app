import { SymptomCatalog } from "../models";


export class SymptomCatalogService {
  async list(): Promise<SymptomCatalog[]> {
    return SymptomCatalog.findAll({ order: [["name", "ASC"]] });
  } 
}


export const symptomCatalogService = new SymptomCatalogService();
