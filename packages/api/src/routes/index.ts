import { Router } from "express";
import { authRouter } from "./auth.routes";
import { symptomCatalogRouter } from "./symptom.routes";
import { medicationRouter } from "./medication.routes";

const router = Router();

router.use("/auth", authRouter);
router.use("/catalog", symptomCatalogRouter);
router.use("/medications", medicationRouter);

export { router };
