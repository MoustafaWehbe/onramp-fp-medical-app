import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { userDoctorRouter } from "./user-doctor.routes";
import { userConditionRouter } from "./user-condition.routes";
import { userMedicationRouter } from "./user-medication.routes";
import { userSymptomRouter } from "./user-symptom.routes";

const router = Router();

router.use(authenticate);

router.use("/doctors", userDoctorRouter);

router.use("/conditions", userConditionRouter);
router.use("/medications", userMedicationRouter);
router.use("/symptoms", userSymptomRouter);

export { router as profileRouter };
