import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { userSymptomRouter } from "./user-symptom.routes";

const router = Router();

router.use(authenticate);

router.use("/symptoms", userSymptomRouter);

export { router as profileRouter };
