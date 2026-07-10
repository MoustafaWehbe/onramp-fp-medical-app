import { Router } from "express";
import { symptomCatalogController } from "../controllers/symptom.controller";
import { rateLimiter } from "src/middleware/rate-limiter";
import { SymptomQuerySchema } from "../schemas/symptoms.schemas";
import {validate} from "src/middleware/validate";



const router = Router();

router.get("/catalog", rateLimiter,validate(SymptomQuerySchema, "query"), symptomCatalogController.list);


export { router as symptomCatalogRouter };
