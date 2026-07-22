import { Router } from "express";
import { clinicController } from "../controllers/clinic.controller";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/authenticate";
import {
  createClinicSchema,
  listClinicsQuerySchema,
} from "../schemas/clinic.schemas";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  validate(listClinicsQuerySchema, "query"),
  clinicController.list,
);
router.post("/", validate(createClinicSchema), clinicController.create);

export { router as clinicRouter };
