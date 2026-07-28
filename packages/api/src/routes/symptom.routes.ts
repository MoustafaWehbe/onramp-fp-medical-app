import { Router } from "express";
import { symptomCatalogController } from "../controllers/symptom.controller";
import {
  createSymptomSchema,
  listSymptomsQuerySchema,
  searchSymptomsOnlineQuerySchema,
} from "../schemas/symptoms.schemas";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { rateLimiter } from "../middleware/rate-limiter";

const router = Router();

router.use(authenticate, authorize("admin", "user"));

router.get(
  "/symptoms/search-online",
  rateLimiter,
  validate(searchSymptomsOnlineQuerySchema, "query"),
  symptomCatalogController.searchSymptomsOnline,
);
router.get(
  "/symptoms",
  validate(listSymptomsQuerySchema, "query"),
  symptomCatalogController.list,
);
router.post(
  "/symptoms",
  validate(createSymptomSchema),
  symptomCatalogController.create,
);

export { router as symptomCatalogRouter };
