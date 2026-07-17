import { Router } from "express";
import { ConditionsController } from "../../controllers/conditions.controller";
import { validate } from "../../middleware/validate";
import {
  createUserConditionSchema,
  listUserConditionsQuerySchema,
  updateUserConditionSchema,
  userConditionIdParamSchema,
} from "../../schemas/user-doctor.schemas";

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