import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { FieldArrayWithId } from "react-hook-form";
import {
  dailyEntryFormSchema,
  type DailyEntryFormValues,
} from "../../../lib/daily-entries/daily-entries-exports";
import { MEDICATION_UNITS, type UserMedication } from "../../../lib/health/health-export";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { AddedItemCard } from "./AddedItemCard";
import { ComposerFieldError, composerControlProps } from "./composerField";
import { EmptyCatalogHint } from "./EmptyCatalogHint";
import { ItemComposer } from "./ItemComposer";
import { parseComposer } from "./composerValidation";
import { selectFieldClass, textareaFieldClass } from "./fieldStyles";

const emptyDraft: DailyEntryFormValues["medications"][number] = {
  userMedicationId: "",
  quantity: "",
  unit: "mg",
  taken: false,
  takenAt: "",
  notes: "",
};

interface MedicationsStepProps {
  fields: FieldArrayWithId<DailyEntryFormValues, "medications", "id">[];
  medications: UserMedication[];
  isLoading: boolean;
  errorMessage: string | null;
  onStartAdd: () => boolean;
  onConfirm: (value: DailyEntryFormValues["medications"][number]) => void;
  onRemove: (index: number) => void;
  onComposerOpenChange: (open: boolean) => void;
}

export function MedicationsStep({
  fields,
  medications,
  isLoading,
  errorMessage,
  onStartAdd,
  onConfirm,
  onRemove,
  onComposerOpenChange,
}: MedicationsStepProps) {
  const { t } = useTranslation();
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function openComposer() {
    if (!onStartAdd()) return;
    setDraft(emptyDraft);
    setFieldErrors({});
    setComposerOpen(true);
    onComposerOpenChange(true);
  }

  function closeComposer() {
    setComposerOpen(false);
    setDraft(emptyDraft);
    setFieldErrors({});
    onComposerOpenChange(false);
  }

  function confirmComposer() {
    const parsed = parseComposer(dailyEntryFormSchema.shape.medications.element, draft);
    if (!parsed.success) {
      setFieldErrors(parsed.errors);
      return;
    }

    onConfirm(parsed.data);
    closeComposer();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={openComposer}
          disabled={isLoading || Boolean(errorMessage) || composerOpen || medications.length === 0}
        >
          {t("dailyEntries.journey.composer.addMedication")}
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">{t("dailyEntries.journey.composer.loadingMedications")}</p>}
      {errorMessage && (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
      )}

      {composerOpen && (
        <ItemComposer
          title={t("dailyEntries.journey.composer.newMedication")}
          onCancel={closeComposer}
          onConfirm={confirmComposer}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="composer-medication">{t("dailyEntries.journey.composer.medication")}</Label>
              <select
                id="composer-medication"
                autoFocus
                className={selectFieldClass}
                value={draft.userMedicationId}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    userMedicationId: event.target.value,
                  }))
                }
                {...composerControlProps(
                  "composer-medication-error",
                  fieldErrors.userMedicationId,
                )}
              >
                <option value="">{t("dailyEntries.journey.composer.selectMedication")}</option>
                {medications.map((medication) => (
                  <option key={medication.id} value={medication.id}>
                    {medication.medication.name}
                  </option>
                ))}
              </select>
              <ComposerFieldError
                id="composer-medication-error"
                error={fieldErrors.userMedicationId}
              />
            </div>
            <div>
              <Label htmlFor="composer-quantity">{t("dailyEntries.journey.composer.quantity")}</Label>
              <Input
                id="composer-quantity"
                type="number"
                min="0"
                step="any"
                placeholder={t("dailyEntries.journey.composer.quantityPlaceholder")}
                className="mt-1.5"
                value={draft.quantity}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    quantity: event.target.value,
                  }))
                }
                {...composerControlProps("composer-quantity-error", fieldErrors.quantity)}
              />
              <ComposerFieldError id="composer-quantity-error" error={fieldErrors.quantity} />
            </div>
            <div>
              <Label htmlFor="composer-unit">{t("dailyEntries.journey.composer.unit")}</Label>
              <select
                id="composer-unit"
                className={selectFieldClass}
                value={draft.unit}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    unit: event.target.value as DailyEntryFormValues["medications"][number]["unit"],
                  }))
                }
                {...composerControlProps("composer-unit-error", fieldErrors.unit)}
              >
                {MEDICATION_UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
              <ComposerFieldError id="composer-unit-error" error={fieldErrors.unit} />
            </div>
            <div className="flex items-center gap-3 pt-7">
              <input
                id="composer-taken"
                type="checkbox"
                className="h-5 w-5 shrink-0 rounded border border-input bg-card accent-primary"
                checked={draft.taken}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    taken: event.target.checked,
                  }))
                }
              />
              <Label htmlFor="composer-taken">{t("dailyEntries.journey.composer.taken")}</Label>
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="composer-taken-at">{t("dailyEntries.journey.composer.takenAt")}</Label>
            <Input
              id="composer-taken-at"
              type="time"
              className="mt-1.5"
              value={draft.takenAt ?? ""}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  takenAt: event.target.value,
                }))
              }
            />
          </div>
          <div className="mt-4">
            <Label htmlFor="composer-medication-notes">{t("dailyEntries.journey.composer.notes")}</Label>
            <textarea
              id="composer-medication-notes"
              rows={3}
              placeholder={t("dailyEntries.journey.composer.optionalNotes")}
              className={textareaFieldClass}
              value={draft.notes ?? ""}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  notes: event.target.value,
                }))
              }
            />
            {fieldErrors.notes && (
              <p className="mt-1.5 text-sm text-destructive">{fieldErrors.notes}</p>
            )}
          </div>
        </ItemComposer>
      )}

      {!isLoading && !errorMessage && medications.length === 0 && (
        <EmptyCatalogHint to="/medications" actionLabel={t("dailyEntries.journey.composer.addMedicationProfile")} />
      )}

      {!isLoading && !errorMessage && fields.length === 0 && !composerOpen && medications.length > 0 && (
        <div className="rounded-2xl border border-dashed bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground">
          {t("dailyEntries.journey.composer.noMedicationsAdded")}
        </div>
      )}

      {fields.map((field, index) => {
        const medicationName =
          medications.find((medication) => medication.id === field.userMedicationId)?.medication
            .name ?? "Medication";
        const details = [
          `${field.quantity} ${field.unit}`.trim(),
          field.taken ? t("dailyEntries.journey.composer.takenValue") : t("dailyEntries.journey.composer.notTakenValue"),
        ];
        if (field.takenAt) details.push(t("dailyEntries.journey.composer.atValue", { value: field.takenAt }));
        if (field.notes?.trim()) details.push(field.notes.trim());

        return (
          <AddedItemCard
            key={field.id}
            title={medicationName}
            details={details}
            removeLabel={t("dailyEntries.journey.composer.remove", { name: medicationName })}
            onRemove={() => onRemove(index)}
          />
        );
      })}
    </div>
  );
}
