import { Op } from "sequelize";
import {
  ConditionCatalog,
  DailyEntry,
  Medication,
  SymptomCatalog,
  UserCondition,
  UserMedication,
  UserSymptom,
} from "../../models";
import { entryIncludes } from "../daily-entry/includes";

export interface ReportContext {
  dateRange: { startDate: string; endDate: string };
  entries: unknown[];
  activeConditions: unknown[];
  activeMedications: unknown[];
  activeSymptoms: unknown[];
}

export async function collectReportData(
  userId: string,
  startDate: string,
  endDate: string,
): Promise<ReportContext> {
  const [entries, activeConditions, activeMedications, activeSymptoms] =
    await Promise.all([
      DailyEntry.findAll({
        where: {
          userId,
          entryDate: { [Op.between]: [startDate, endDate] },
        },
        include: entryIncludes(),
        order: [["entryDate", "ASC"]],
      }),
      UserCondition.findAll({
        where: { userId, active: true },
        attributes: ["id", "conditionId", "status", "diagnosedDate", "notes"],
        include: [
          {
            model: ConditionCatalog,
            as: "condition",
            attributes: ["id", "name"],
          },
        ],
      }),
      UserMedication.findAll({
        where: { userId, active: true },
        attributes: [
          "id",
          "medicationId",
          "dosage",
          "dosageMeasurement",
          "frequency",
          "notes",
        ],
        include: [
          {
            model: Medication,
            as: "medication",
            attributes: ["id", "name", "strength", "category"],
          },
        ],
      }),
      UserSymptom.findAll({
        where: { userId, active: true },
        attributes: ["id", "catalogId"],
        include: [
          {
            model: SymptomCatalog,
            as: "catalog",
            attributes: ["id", "name", "category"],
          },
        ],
      }),
    ]);

  return {
    dateRange: { startDate, endDate },
    entries: entries.map((entry) => entry.toJSON()),
    activeConditions: activeConditions.map((row) => row.toJSON()),
    activeMedications: activeMedications.map((row) => row.toJSON()),
    activeSymptoms: activeSymptoms.map((row) => row.toJSON()),
  };
}
