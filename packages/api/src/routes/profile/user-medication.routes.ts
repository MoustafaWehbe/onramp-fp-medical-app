import { Router } from "express";
import { medicationController } from "../../controllers/medication.controller";
import { validate } from "../../middleware/validate";
import {
  createUserMedicationSchema,
  listUserMedicationsQuerySchema,
  updateUserMedicationSchema,
  userMedicationIdParamSchema,
} from "../../schemas/user-medication.schemas";

const router = Router();

router.get(
  "/",
  validate(listUserMedicationsQuerySchema, "query"),
  medicationController.listProfile,
);

router.post(
  "/",
  validate(createUserMedicationSchema),
  medicationController.createProfile,
);

router.get(
  "/:id",
  validate(userMedicationIdParamSchema, "params"),
  medicationController.getProfileById,
);

router.patch(
  "/:id",
  validate(userMedicationIdParamSchema, "params"),
  validate(updateUserMedicationSchema),
  medicationController.updateProfile,
);

router.delete(
  "/:id",
  validate(userMedicationIdParamSchema, "params"),
  medicationController.removeProfile,
);

export { router as userMedicationRouter };