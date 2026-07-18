import { Router } from "express";
import { clinicController } from "../../controllers/clinic.controller";
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
  clinicController.listProfile,
);

router.post(
  "/",
  validate(createUserClinicSchema),
  clinicController.createProfile,
);

router.get(
  "/:id",
  validate(userClinicIdParamSchema, "params"),
  clinicController.getProfileById,
);

router.patch(
  "/:id",
  validate(userClinicIdParamSchema, "params"),
  validate(updateUserClinicSchema),
  clinicController.updateProfile,
);

router.delete(
  "/:id",
  validate(userClinicIdParamSchema, "params"),
  clinicController.removeProfile,
);

export { router as userClinicRouter };
