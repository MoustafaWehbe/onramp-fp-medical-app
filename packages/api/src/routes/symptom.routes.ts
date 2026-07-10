import { Router } from "express";
import { symptomCatalogController } from "../controllers/symptom.controller";
import { rateLimiter } from "src/middleware/rate-limiter";



const router = Router();

router.get("/catalog", rateLimiter, symptomCatalogController.list);


export { router as symptomCatalogRouter };
