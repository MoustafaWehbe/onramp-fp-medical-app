import { Router } from "express";
import { symptomCatalogController } from "../controllers/symptom.controller";
import {
  createSymptomSchema,
  listSymptomsQuerySchema,
  searchSymptomsOnlineQuerySchema,
} from "../schemas/symptoms.schemas";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/authenticate";

const router = Router();

router.use(authenticate);

router.get(
  "/symptoms/search-online",
  validate(searchSymptomsOnlineQuerySchema, "query"),
  symptomCatalogController.open,
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
