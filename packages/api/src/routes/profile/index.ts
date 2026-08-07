import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { userDoctorRouter } from "./user-doctor.routes";
import { userConditionRouter } from "./user-condition.routes";
import { userMedicationRouter } from "./user-medication.routes";
import { userSymptomRouter } from "./user-symptom.routes";
import { userClinicRouter } from "./user-clinic.routes";
import { dailyEntryRouter } from "./daily-entry.routes";
import { entryDoctorVisitRouter } from "./entry-doctor-visit.routes";
import { dashboardRouter } from "../dashboard.routes";

const router = Router();

router.use(authenticate, authorize("user"));

router.use("/doctors", userDoctorRouter);

router.use("/conditions", userConditionRouter);
router.use("/medications", userMedicationRouter);
router.use("/symptoms", userSymptomRouter);
router.use("/clinics", userClinicRouter);
router.use("/daily-entries", dailyEntryRouter);
router.use("/doctor-visits", entryDoctorVisitRouter);
router.use("/dashboard", dashboardRouter);

export { router as profileRouter };
