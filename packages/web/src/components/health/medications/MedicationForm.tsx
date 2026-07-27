import { DOSAGE_MEASUREMENTS } from "../../../lib/health/health-export";
import { useMedicationsContext } from "../../../providers/MedicationsProvider";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { MedicationAutocomplete } from "./MedicationAutocomplete";

export function MedicationForm() {
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
        <Label htmlFor="medication-name">Medication</Label>
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
            The category is looked up automatically when the medication is
            added.
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dosage">Dosage</Label>
          <Input
            id="dosage"
            type="number"
            step="any"
            min="0"
            placeholder="e.g. 500"
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
          <Label htmlFor="dosageMeasurement">Unit</Label>
          <select
            id="dosageMeasurement"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isFormBusy}
            {...register("dosageMeasurement")}
          >
            <option value="">Select unit</option>
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
        <Label htmlFor="frequency">Frequency</Label>
        <Input
          id="frequency"
          placeholder="e.g. twice daily"
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
        <Label htmlFor="notes">Notes</Label>
        <Input
          id="notes"
          placeholder="Optional notes"
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
              ? "Saving…"
              : "Adding…"
            : formMode === "edit"
              ? "Save changes"
              : "Add medication"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isFormBusy}
          onClick={cancelForm}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
