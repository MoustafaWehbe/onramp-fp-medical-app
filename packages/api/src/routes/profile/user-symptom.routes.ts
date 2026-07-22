import { Router } from "express";
import { symptomCatalogController } from "../../controllers/symptom.controller";
import { validate } from "../../middleware/validate";
import {
  createUserSymptomSchema,
  listUserSymptomsQuerySchema,
  userSymptomIdParamSchema,
} from "../../schemas/user-symptom.schemas";

const router = Router();

router.get(
  "/",
  validate(listUserSymptomsQuerySchema, "query"),
  symptomCatalogController.listProfile,
);
router.post(
  "/",
  validate(createUserSymptomSchema),
  symptomCatalogController.createProfile,
);
router.get(
  "/:id",
  validate(userSymptomIdParamSchema, "params"),
  symptomCatalogController.getProfileById,
);
router.delete(
  "/:id",
  validate(userSymptomIdParamSchema, "params"),
  symptomCatalogController.removeProfile,
);

export { router as userSymptomRouter };
