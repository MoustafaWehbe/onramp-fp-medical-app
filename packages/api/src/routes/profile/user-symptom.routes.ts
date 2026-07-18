import { Router } from "express";
import { userSymptomController } from "../../controllers/user-symptom.controller";
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
  userSymptomController.listProfile,
);
router.post(
  "/",
  validate(createUserSymptomSchema),
  userSymptomController.createProfile,
);
router.get(
  "/:id",
  validate(userSymptomIdParamSchema, "params"),
  userSymptomController.getProfileById,
);
router.delete(
  "/:id",
  validate(userSymptomIdParamSchema, "params"),
  userSymptomController.removeProfile,
);

export { router as userSymptomRouter };
