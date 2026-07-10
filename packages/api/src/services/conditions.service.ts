import { Op } from "sequelize";
import { ConditionCatalog } from "@starter-kit/shared/db/models/catalogs/ConditionCatalog";
import { searchConditionsFromApi } from "../lib/conditionCatalogApi";

export class ConditionService {
    // Search conditions in the local database and external API
  async searchConditions(term?: string): Promise<ConditionCatalog[]> {
    // 1. No search term → return full local list
    if (!term) {
      return await ConditionCatalog.findAll({
        order: [["name", "ASC"]],
      });
    }

    // 2. Search local DB first 
    const localResults = await ConditionCatalog.findAll({
      where: {
        name: {
          [Op.iLike]: `%${term}%`,
        },
      },
      order: [["name", "ASC"]],
    });

    // 3. Found locally → return immediately
    if (localResults.length > 0) {
      return localResults;
    }

    // 4. Not found locally → search external API
    const externalResults = await searchConditionsFromApi(term);

    // 5. Nothing found anywhere
    if (externalResults.length === 0) {
      return [];
    }

    // 6. Save new conditions locally
    // 6. Save new conditions locally
    await ConditionCatalog.bulkCreate(
      externalResults.map((condition) => ({
        name: condition.name,
      })),
      {
        ignoreDuplicates: true,
      },
    );

    // Re-query to return all conditions matching the external results,
    // including ones that already existed and were skipped by ignoreDuplicates.
    return await ConditionCatalog.findAll({
      where: {
        name: {
          [Op.in]: externalResults.map((c) => c.name),
        },
      },
      order: [["name", "ASC"]],
    });
  }
}

export const conditionService = new ConditionService();