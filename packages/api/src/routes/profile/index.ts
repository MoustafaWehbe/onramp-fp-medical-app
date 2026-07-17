import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { userConditionRouter } from "./user-condition.routes";

const router = Router();

router.use(authenticate);
router.use("/conditions", userConditionRouter);

export { router as profileRouter };