import { Router } from "express";
import { EntryDoctorVisitController } from "../../controllers/entry-doctor-visit.controller";
import { validate } from "../../middleware/validate";
import {
  entryDoctorVisitIdParamSchema,
  listEntryDoctorVisitsQuerySchema,
} from "../../schemas/entry-doctor-visit.schemas";

const router = Router();

// ── Doctor visits collection ─────────────────────────────────────────────────

router.get(
  "/",
  validate(listEntryDoctorVisitsQuerySchema, "query"),
  EntryDoctorVisitController.list,
);

// ── Doctor visit by id ────────────────────────────────────────────────────────

router.get(
  "/:id",
  validate(entryDoctorVisitIdParamSchema, "params"),
  EntryDoctorVisitController.getById,
);

export { router as entryDoctorVisitRouter };