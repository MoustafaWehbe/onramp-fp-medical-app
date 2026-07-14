import { Router } from "express";
import { doctorController } from "../controllers/doctor.controller";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/authenticate";
import {
  createDoctorSchema,
  listDoctorsQuerySchema,
} from "../schemas/doctor.schemas";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  validate(listDoctorsQuerySchema, "query"),
  doctorController.list,
);
router.post("/", validate(createDoctorSchema), doctorController.create);

export { router as doctorRouter };
