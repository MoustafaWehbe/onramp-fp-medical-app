import { Router } from "express";
import { doctorController } from "../../controllers/doctor.controller";
import { validate } from "../../middleware/validate";
import {
  createUserDoctorSchema,
  listUserDoctorsQuerySchema,
  updateUserDoctorSchema,
  userDoctorIdParamSchema,
} from "../../schemas/user-doctor.schemas";

const router = Router();

router.get(
  "/",
  validate(listUserDoctorsQuerySchema, "query"),
  doctorController.listProfile,
);
router.post(
  "/",
  validate(createUserDoctorSchema),
  doctorController.createProfile,
);
router.get(
  "/:id",
  validate(userDoctorIdParamSchema, "params"),
  doctorController.getProfileById,
);
router.patch(
  "/:id",
  validate(userDoctorIdParamSchema, "params"),
  validate(updateUserDoctorSchema),
  doctorController.updateProfile,
);
router.delete(
  "/:id",
  validate(userDoctorIdParamSchema, "params"),
  doctorController.removeProfile,
);

export { router as userDoctorRouter };
