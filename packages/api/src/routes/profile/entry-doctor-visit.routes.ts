import { Router } from "express";
import { EntryDoctorVisitController } from "../../controllers/entry-doctor-visit.controller";
import { validate } from "../../middleware/validate";
import {
  entryDoctorVisitIdParamSchema,
  listEntryDoctorVisitsQuerySchema,
} from "../../schemas/entry-doctor-visit.schemas";

const router = Router();

router.get(
  "/",
  validate(listEntryDoctorVisitsQuerySchema, "query"),
  EntryDoctorVisitController.list,
);

router.get(
  "/:id",
  validate(entryDoctorVisitIdParamSchema, "params"),
  EntryDoctorVisitController.getById,
);

export { router as entryDoctorVisitRouter };