import { Router } from "express";
import { symptomCatalogController } from "../controllers/symptom-catalog.controller";


const router = Router();

router.get("/", symptomCatalogController.list);

export { router as symptomCatalogRouter };
