import { Router } from "express";
import { authRouter } from "./auth.routes";
import { symptomCatalogRouter } from "./symptom.routes";

const router = Router();

router.use("/auth", authRouter);
router.use("/catalog", symptomCatalogRouter);

export { router };
