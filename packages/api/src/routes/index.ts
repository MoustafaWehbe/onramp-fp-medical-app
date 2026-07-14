import { Router } from "express";
import { authRouter } from "./auth.routes";
import { clinicRouter } from "./clinic.routes";
import { doctorRouter } from "./doctor.routes";
import { conditionsRouter } from "./conditions.routes";
import { medicationRouter } from "./medication.routes";
import { symptomCatalogRouter } from "./symptom.routes";

const router = Router();

router.use("/auth", authRouter);

// Add more routers here:
router.use("/clinics", clinicRouter);
router.use("/doctors", doctorRouter);
router.use("/medications", medicationRouter);
// router.use('/users', usersRouter);
router.use("/catalog", symptomCatalogRouter);
router.use("/conditions", conditionsRouter);

export { router };
