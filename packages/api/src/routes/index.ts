import { Router } from "express";
import { authRouter } from "./auth.routes";
import { symptomCatalogRouter } from "./symptom-catalog.routes";

const router = Router();

router.use("/auth", authRouter);
router.use("/catalog/symptoms", symptomCatalogRouter);

export { router };
