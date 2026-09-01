import { Op, type Includeable } from "sequelize";
import {
  Clinic,
  ConditionCatalog,
  Doctor,
  EntryCondition,
  EntryDoctorVisit,
  EntryMedication,
  EntrySymptom,
  Medication,
  SymptomCatalog,
  UserClinic,
  UserCondition,
  UserDoctor,
  UserMedication,
  UserSymptom,
} from "../../models";

export function entryIncludes(): Includeable[] {
  return [
    {
      model: EntrySymptom,
      as: "symptoms" as const,
      include: [
        {
          model: UserSymptom,
          as: "userSymptom" as const,
          attributes: ["id", "catalogId", "active"],
          include: [
            {
              model: SymptomCatalog,
              as: "catalog" as const,
              attributes: [
                "id",
                "name",
                "nameAr",
                "category",
                "categoryAr",
                "isCustom",
                "language",
              ],
            },
          ],
        },
      ],
    },
    {
      model: EntryCondition,
      as: "conditions" as const,
      where: { status: { [Op.ne]: "inactive" } },
      required: false,
      include: [
        {
          model: UserCondition,
          as: "userCondition" as const,
          attributes: ["id", "conditionId", "status", "active"],
          include: [
            {
              model: ConditionCatalog,
              as: "condition" as const,
              attributes: ["id", "name", "nameAr"],
            },
          ],
        },
      ],
    },
    {
      model: EntryMedication,
      as: "medications" as const,
      include: [
        {
          model: UserMedication,
          as: "userMedication" as const,
          attributes: ["id", "medicationId", "dosage", "dosageMeasurement", "active"],
          include: [
            {
              model: Medication,
              as: "medication" as const,
              attributes: ["id", "name", "strength", "category"],
            },
          ],
        },
      ],
    },
    {
      model: EntryDoctorVisit,
      as: "doctorVisits" as const,
      include: [
        {
          model: UserDoctor,
          as: "userDoctor" as const,
          attributes: ["id", "doctorId", "active"],
          include: [
            {
              model: Doctor,
              as: "doctor" as const,
              attributes: ["id", "name", "specialty"],
            },
          ],
        },
        {
          model: UserClinic,
          as: "userClinic" as const,
          attributes: ["id", "clinicId", "active"],
          include: [
            {
              model: Clinic,
              as: "clinic" as const,
              attributes: ["id", "name", "address"],
            },
          ],
        },
      ],
    },
  ];
}
