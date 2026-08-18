import { Router } from "express";
import { ConditionsController } from "../../controllers/conditions.controller";
import { validate } from "../../middleware/validate";
import {
  conditionSymptomParamsSchema,
  createUserConditionSchema,
  linkConditionSymptomSchema,
  listConditionSymptomsQuerySchema,
  listUserConditionsQuerySchema,
  updateUserConditionSchema,
  userConditionIdParamSchema,
} from "../../schemas/user-condition.schemas";

const router = Router();

router.get(
  "/",
  validate(listUserConditionsQuerySchema, "query"),
  ConditionsController.listProfile,
);

router.post(
  "/",
  validate(createUserConditionSchema),
  ConditionsController.createProfile,
);

router.get(
  "/symptoms",
  validate(listConditionSymptomsQuerySchema, "query"),
  ConditionsController.listAllProfileSymptoms,
);

router.get(
  "/:id/symptoms",
  validate(userConditionIdParamSchema, "params"),
  validate(listConditionSymptomsQuerySchema, "query"),
  ConditionsController.listProfileSymptoms,
);

router.post(
  "/:id/symptoms",
  validate(userConditionIdParamSchema, "params"),
  validate(linkConditionSymptomSchema),
  ConditionsController.linkProfileSymptom,
);

router.delete(
  "/:id/symptoms/:userSymptomId",
  validate(conditionSymptomParamsSchema, "params"),
  ConditionsController.unlinkProfileSymptom,
);

router.get(
  "/:id",
  validate(userConditionIdParamSchema, "params"),
  ConditionsController.getProfileById,
);

router.patch(
  "/:id",
  validate(userConditionIdParamSchema, "params"),
  validate(updateUserConditionSchema),
  ConditionsController.updateProfile,
);

router.delete(
  "/:id",
  validate(userConditionIdParamSchema, "params"),
  ConditionsController.removeProfile,
);

export { router as userConditionRouter };
