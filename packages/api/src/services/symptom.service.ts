import { Op } from "sequelize";
import { SymptomCatalog } from "../models";
import { searchSymptomsFromApi } from "../lib/symptoms";


export class SymptomCatalogService {
  async list(search?: string): Promise<SymptomCatalog[]> {
    const where = search
      ? { name: { [Op.iLike]: `%${search.replace(/[%_]/g, "\\$&")}%` } }
      : undefined;
    return SymptomCatalog.findAll({ where, order: [["name", "ASC"]] });
  } 
}
export class SymptomServiceapi {
  async searchSymptomsFromApi(term: string): Promise<{ name: string }[]> {
    return searchSymptomsFromApi(term);
  }
}

export const symptomServiceapi = new SymptomServiceapi();
export const symptomCatalogService = new SymptomCatalogService();
