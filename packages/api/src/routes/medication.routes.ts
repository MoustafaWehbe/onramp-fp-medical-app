import { Router } from "express";
import { medicationController } from "../controllers/medication.controller";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/authenticate";
import {
  createMedicationSchema,
  listMedicationsQuerySchema,
  lookupMedicationCategoryOnlineQuerySchema,
  searchMedicationsOnlineQuerySchema,
} from "../schemas/medication.schemas";

const router = Router();

router.use(authenticate);

router.get(
  "/search-online",
  validate(searchMedicationsOnlineQuerySchema, "query"),
  medicationController.searchMedicationsOnline,
);
router.get(
  "/category-online",
  validate(lookupMedicationCategoryOnlineQuerySchema, "query"),
  medicationController.lookupCategoryOnline,
);
router.get(
  "/",
  validate(listMedicationsQuerySchema, "query"),
  medicationController.list,
);
router.post(
  "/",
  validate(createMedicationSchema),
  medicationController.create,
);

export { router as medicationRouter };
