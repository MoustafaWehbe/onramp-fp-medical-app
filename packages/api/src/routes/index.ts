import { Router } from "express";
import { authRouter } from "./auth.routes";
import { doctorRouter } from "./doctor.routes";
import { medicationRouter } from "./medication.routes";

const router = Router();

router.use("/auth", authRouter);

// Add more routers here:
router.use("/doctors", doctorRouter);
router.use("/medications", medicationRouter);
// router.use('/users', usersRouter);

export { router };
