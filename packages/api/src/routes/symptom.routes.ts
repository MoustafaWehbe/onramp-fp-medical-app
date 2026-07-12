import { Router } from "express";
import { symptomCatalogController } from "../controllers/symptom.controller";
import { rateLimiter } from "../middleware/rate-limiter";
import { SymptomQuerySchema, SymptomSearchQuerySchema } from "../schemas/symptoms.schemas";
import {validate} from "../middleware/validate";
import { authenticate } from "src/middleware/authenticate";

const router = Router();

router.use(authenticate);

router.get("/symptoms", 
    rateLimiter, 
    validate(SymptomQuerySchema, "query"),
     symptomCatalogController.list
    );
router.get("/symptoms/search",
    rateLimiter,
    validate(SymptomSearchQuerySchema, "query"),
    symptomCatalogController.search
);

export { router as symptomCatalogRouter };
