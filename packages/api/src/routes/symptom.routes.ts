import { Router } from "express";
import { symptomCatalogController } from "../controllers/symptom.controller";
import { rateLimiter } from "src/middleware/rate-limiter";
import { SymptomQuerySchema } from "../schemas/symptoms.schemas";
import {validate} from "src/middleware/validate";



const router = Router();

router.get("/symptoms", rateLimiter, validate(SymptomQuerySchema, "query"), symptomCatalogController.list);
router.get("/symptoms/search", symptomCatalogController.search);


export { router as symptomCatalogRouter };
