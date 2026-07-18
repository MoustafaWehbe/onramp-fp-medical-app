import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { userConditionRouter } from "./user-condition.routes";
import { userMedicationRouter } from "./user-medication.routes";

const router = Router();

router.use(authenticate);
router.use("/conditions", userConditionRouter);
router.use("/medications", userMedicationRouter);

export { router as profileRouter };