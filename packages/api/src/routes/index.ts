import { Router } from "express";
import { authRouter } from "./auth.routes";
import { medicationRouter } from "./medication.routes";

const router = Router();

router.use("/auth", authRouter);

// Add more routers here:
router.use("/medications", medicationRouter);
// router.use('/users', usersRouter);

export { router };
