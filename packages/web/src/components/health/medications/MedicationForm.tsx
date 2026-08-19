import { useTranslation } from "react-i18next";
import { DOSAGE_MEASUREMENTS } from "../../../lib/health/health-export";
import { useMedicationsContext } from "../../../providers/MedicationsProvider";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { MedicationAutocomplete } from "./MedicationAutocomplete";

export function MedicationForm() {
  const { t } = useTranslation();
  const {
    formMode,
    isFormBusy,
    register,
    nameQuery,
    formErrors,
    handleFormSubmit,
    submitForm,
    cancelForm,
  } = useMedicationsContext();

  if (!formMode) return null;

  return (
    <form
      onSubmit={handleFormSubmit(submitForm)}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="medication-name">{t("health.medications.medication")}</Label>
        {formMode === "edit" ? (
          <Input
            id="medication-name"
            value={nameQuery}
            disabled
            readOnly
          />
        ) : (
          <MedicationAutocomplete id="medication-name" />
        )}
        {formErrors.nameQuery && (
          <p className="text-xs text-destructive">
            {formErrors.nameQuery.message}
          </p>
        )}
        {formMode === "create" && (
          <p className="text-xs text-muted-foreground">
            {t("health.medications.searchHelp")}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dosage">{t("health.medications.dosage")}</Label>
          <Input
            id="dosage"
            type="number"
            step="any"
            min="0"
            placeholder={t("health.medications.dosagePlaceholder")}
            disabled={isFormBusy}
            {...register("dosage")}
          />
          {formErrors.dosage && (
            <p className="text-xs text-destructive">
              {formErrors.dosage.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="dosageMeasurement">{t("health.medications.unit")}</Label>
          <select
            id="dosageMeasurement"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isFormBusy}
            {...register("dosageMeasurement")}
          >
            <option value="">{t("health.medications.selectUnit")}</option>
            {DOSAGE_MEASUREMENTS.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
          {formErrors.dosageMeasurement && (
            <p className="text-xs text-destructive">
              {formErrors.dosageMeasurement.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="frequency">{t("health.medications.frequency")}</Label>
        <Input
          id="frequency"
          placeholder={t("health.medications.frequencyPlaceholder")}
          disabled={isFormBusy}
          {...register("frequency")}
        />
        {formErrors.frequency && (
          <p className="text-xs text-destructive">
            {formErrors.frequency.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">{t("health.medications.notes")}</Label>
        <Input
          id="notes"
          placeholder={t("health.medications.optionalNotes")}
          disabled={isFormBusy}
          {...register("notes")}
        />
        {formErrors.notes && (
          <p className="text-xs text-destructive">{formErrors.notes.message}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isFormBusy}>
          {isFormBusy
            ? formMode === "edit"
              ? t("health.medications.saving")
              : t("health.medications.adding")
            : formMode === "edit"
              ? t("health.medications.saveChanges")
              : t("health.medications.addMedication")}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isFormBusy}
          onClick={cancelForm}
        >
          {t("health.medications.cancel")}
        </Button>
      </div>
    </form>
  );
}
