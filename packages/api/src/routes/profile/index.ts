import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { userDoctorRouter } from "./user-doctor.routes";
import { userConditionRouter } from "./user-condition.routes";
import { userMedicationRouter } from "./user-medication.routes";
import { userSymptomRouter } from "./user-symptom.routes";
import { userClinicRouter } from "./user-clinic.routes";
import { dailyEntryRouter } from "./daily-entry.routes";

const router = Router();

router.use(authenticate);

router.use("/doctors", userDoctorRouter);

router.use("/conditions", userConditionRouter);
router.use("/medications", userMedicationRouter);
router.use("/symptoms", userSymptomRouter);
router.use("/clinics", userClinicRouter);
router.use("/daily-entries", dailyEntryRouter);

export { router as profileRouter };
