import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { userConditionRouter } from "./user-condition.routes";
import { userSymptomRouter } from "./user-symptom.routes";
import { userClinicRouter } from "./user-clinic.routes";

const router = Router();

router.use(authenticate);
router.use("/conditions", userConditionRouter);
router.use("/symptoms", userSymptomRouter);
router.use("/clinics", userClinicRouter);

export { router as profileRouter };