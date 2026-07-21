import { Router } from "express";
import { DailyEntryController } from "../../controllers/daily-entry.controller";
import { validate } from "../../middleware/validate";
import {
  createDailyEntrySchema,
  dailyEntryIdParamSchema,
  listDailyEntriesQuerySchema,
  updateDailyEntrySchema,
} from "../../schemas/daily-entry.schemas";

const router = Router();

// ── Daily entries collection ──────────────────────────────────────────────────

router.get(
  "/",
  validate(listDailyEntriesQuerySchema, "query"),
  DailyEntryController.list,
);

router.post(
  "/",
  validate(createDailyEntrySchema),
  DailyEntryController.create,
);

// ── Daily entry by id ─────────────────────────────────────────────────────────

router.get(
  "/:id",
  validate(dailyEntryIdParamSchema, "params"),
  DailyEntryController.getById,
);

router.patch(
  "/:id",
  validate(dailyEntryIdParamSchema, "params"),
  validate(updateDailyEntrySchema),
  DailyEntryController.update,
);

router.delete(
  "/:id",
  validate(dailyEntryIdParamSchema, "params"),
  DailyEntryController.remove,
);

export { router as dailyEntryRouter };
