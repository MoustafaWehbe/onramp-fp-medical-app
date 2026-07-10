import { Router } from "express";
import { authRouter } from "./auth.routes";
import { conditionsRouter } from "./conditions.routes";

const router = Router();

router.use("/auth", authRouter);

// Add more routers here:
// router.use('/users', usersRouter);
router.use("/conditions", conditionsRouter);

export { router };
