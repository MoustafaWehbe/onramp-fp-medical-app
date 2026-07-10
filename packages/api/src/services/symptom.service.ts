import { Op } from "sequelize";
import { SymptomCatalog } from "../models";


export class SymptomCatalogService {
  async list(search?: string): Promise<SymptomCatalog[]> {
    const where = search
      ? { name: { [Op.iLike]: `%${search}%` } }
      : undefined;
    return SymptomCatalog.findAll({ where, order: [["name", "ASC"]] });
  } 
}


export const symptomCatalogService = new SymptomCatalogService();
