import type { Sequelize } from "sequelize";
import { User } from "./User";
import { Session } from "./Session";
import { RefreshToken } from "./RefreshToken";
import {
  SymptomCatalog,
  ConditionCatalog,
  Medication,
  Clinic,
  Doctor,
} from "./catalogs";
import {
  UserCondition,
  UserSymptom,
  ConditionSymptom,
  UserMedication,
  UserClinic,
  UserDoctor,
} from "./profile";
import {
  DailyEntry,
  EntryCondition,
  EntrySymptom,
  EntryMedication,
  EntryDoctorVisit,
} from "./daily-log";
import { AiReport } from "./ai";

export { User, Session, RefreshToken };
export * from "./catalogs";
export * from "./profile";
export * from "./daily-log";
export * from "./ai";

export function initModels(sequelize: Sequelize): void {
  User.initModel(sequelize);
  Session.initModel(sequelize);
  RefreshToken.initModel(sequelize);
  SymptomCatalog.initModel(sequelize);
  ConditionCatalog.initModel(sequelize);
  Medication.initModel(sequelize);
  Clinic.initModel(sequelize);
  Doctor.initModel(sequelize);
  UserCondition.initModel(sequelize);
  UserSymptom.initModel(sequelize);
  ConditionSymptom.initModel(sequelize);
  UserMedication.initModel(sequelize);
  UserClinic.initModel(sequelize);
  UserDoctor.initModel(sequelize);
  DailyEntry.initModel(sequelize);
  EntryCondition.initModel(sequelize);
  EntrySymptom.initModel(sequelize);
  EntryMedication.initModel(sequelize);
  EntryDoctorVisit.initModel(sequelize);
  AiReport.initModel(sequelize);

  // Auth associations (unchanged)
  User.hasMany(Session, { foreignKey: "userId", as: "sessions" });
  Session.belongsTo(User, { foreignKey: "userId", as: "user" });

  User.hasMany(RefreshToken, { foreignKey: "userId", as: "refreshTokens" });
  RefreshToken.belongsTo(User, { foreignKey: "userId", as: "user" });

  Session.hasMany(RefreshToken, {
    foreignKey: "sessionId",
    as: "refreshTokens",
  });
  RefreshToken.belongsTo(Session, { foreignKey: "sessionId", as: "session" });

  // Catalog associations
  SymptomCatalog.hasMany(UserSymptom, {
    foreignKey: "catalogId",
    as: "userSymptoms",
  });
  UserSymptom.belongsTo(SymptomCatalog, {
    foreignKey: "catalogId",
    as: "catalog",
  });

  ConditionCatalog.hasMany(UserCondition, {
    foreignKey: "conditionId",
    as: "userConditions",
  });
  UserCondition.belongsTo(ConditionCatalog, {
    foreignKey: "conditionId",
    as: "condition",
  });

  Medication.hasMany(UserMedication, {
    foreignKey: "medicationId",
    as: "userMedications",
  });
  UserMedication.belongsTo(Medication, {
    foreignKey: "medicationId",
    as: "medication",
  });

  Clinic.hasMany(UserClinic, { foreignKey: "clinicId", as: "userClinics" });
  UserClinic.belongsTo(Clinic, { foreignKey: "clinicId", as: "clinic" });

  Doctor.hasMany(UserDoctor, { foreignKey: "doctorId", as: "userDoctors" });
  UserDoctor.belongsTo(Doctor, { foreignKey: "doctorId", as: "doctor" });

  // User health profile associations
  User.hasMany(UserCondition, { foreignKey: "userId", as: "conditions" });
  UserCondition.belongsTo(User, { foreignKey: "userId", as: "user" });

  User.hasMany(UserSymptom, { foreignKey: "userId", as: "symptoms" });
  UserSymptom.belongsTo(User, { foreignKey: "userId", as: "user" });

  User.hasMany(UserMedication, { foreignKey: "userId", as: "medications" });
  UserMedication.belongsTo(User, { foreignKey: "userId", as: "user" });

  User.hasMany(UserClinic, { foreignKey: "userId", as: "clinics" });
  UserClinic.belongsTo(User, { foreignKey: "userId", as: "user" });

  User.hasMany(UserDoctor, { foreignKey: "userId", as: "doctors" });
  UserDoctor.belongsTo(User, { foreignKey: "userId", as: "user" });

  UserCondition.hasMany(ConditionSymptom, {
    foreignKey: "userConditionId",
    as: "conditionSymptoms",
  });
  ConditionSymptom.belongsTo(UserCondition, {
    foreignKey: "userConditionId",
    as: "userCondition",
  });

  UserSymptom.hasMany(ConditionSymptom, {
    foreignKey: "userSymptomId",
    as: "conditionSymptoms",
  });
  ConditionSymptom.belongsTo(UserSymptom, {
    foreignKey: "userSymptomId",
    as: "userSymptom",
  });

  UserClinic.hasMany(UserDoctor, {
    foreignKey: "userClinicId",
    as: "doctors",
  });
  UserDoctor.belongsTo(UserClinic, {
    foreignKey: "userClinicId",
    as: "userClinic",
  });

  // Daily entry associations
  User.hasMany(DailyEntry, { foreignKey: "userId", as: "dailyEntries" });
  DailyEntry.belongsTo(User, { foreignKey: "userId", as: "user" });

  DailyEntry.hasMany(EntryCondition, {
    foreignKey: "entryId",
    as: "conditions",
  });
  
  EntryCondition.belongsTo(DailyEntry, { foreignKey: "entryId", as: "entry" });
  EntryCondition.belongsTo(UserCondition, {
    foreignKey: "userConditionId",
    as: "userCondition",
  });
  UserCondition.hasMany(EntryCondition, {
    foreignKey: "userConditionId",
    as: "entryConditions",
  });

  DailyEntry.hasMany(EntrySymptom, { foreignKey: "entryId", as: "symptoms" });
  EntrySymptom.belongsTo(DailyEntry, { foreignKey: "entryId", as: "entry" });
  EntrySymptom.belongsTo(UserSymptom, {
    foreignKey: "userSymptomId",
    as: "userSymptom",
  });
  UserSymptom.hasMany(EntrySymptom, {
    foreignKey: "userSymptomId",
    as: "entrySymptoms",
  });

  DailyEntry.hasMany(EntryMedication, {
    foreignKey: "entryId",
    as: "medications",
  });
  EntryMedication.belongsTo(DailyEntry, {
    foreignKey: "entryId",
    as: "entry",
  });
  EntryMedication.belongsTo(UserMedication, {
    foreignKey: "userMedicationId",
    as: "userMedication",
  });
  UserMedication.hasMany(EntryMedication, {
    foreignKey: "userMedicationId",
    as: "entryMedications",
  });

  DailyEntry.hasMany(EntryDoctorVisit, {
    foreignKey: "entryId",
    as: "doctorVisits",
  });
  EntryDoctorVisit.belongsTo(DailyEntry, {
    foreignKey: "entryId",
    as: "entry",
  });
  EntryDoctorVisit.belongsTo(UserDoctor, {
    foreignKey: "userDoctorId",
    as: "userDoctor",
  });
  UserDoctor.hasMany(EntryDoctorVisit, {
    foreignKey: "userDoctorId",
    as: "entryVisits",
  });
  EntryDoctorVisit.belongsTo(UserClinic, {
    foreignKey: "userClinicId",
    as: "userClinic",
  });
  UserClinic.hasMany(EntryDoctorVisit, {
    foreignKey: "userClinicId",
    as: "entryVisits",
  });

  // AI reports
  User.hasMany(AiReport, { foreignKey: "userId", as: "aiReports" });
  AiReport.belongsTo(User, { foreignKey: "userId", as: "user" });
}
