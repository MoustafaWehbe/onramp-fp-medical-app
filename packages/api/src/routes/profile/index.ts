import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { userDoctorRouter } from "./user-doctor.routes";

const router = Router();

router.use(authenticate);

router.use("/doctors", userDoctorRouter);

export { router as profileRouter };
