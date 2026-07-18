import { Router } from "express";
import { userClinicController } from "../../controllers/user-clinic.controller";
import { validate } from "../../middleware/validate";
import {
  createUserClinicSchema,
  listUserClinicsQuerySchema,
  updateUserClinicSchema,
  userClinicIdParamSchema,
} from "../../schemas/user-clinic.schemas";

const router = Router();

router.get(
  "/",
  validate(listUserClinicsQuerySchema, "query"),
  userClinicController.listProfile,
);

router.post(
  "/",
  validate(createUserClinicSchema),
  userClinicController.createProfile,
);

router.get(
  "/:id",
  validate(userClinicIdParamSchema, "params"),
  userClinicController.getProfileById,
);

router.patch(
  "/:id",
  validate(userClinicIdParamSchema, "params"),
  validate(updateUserClinicSchema),
  userClinicController.updateProfile,
);

router.delete(
  "/:id",
  validate(userClinicIdParamSchema, "params"),
  userClinicController.removeProfile,
);

export { router as userClinicRouter };
