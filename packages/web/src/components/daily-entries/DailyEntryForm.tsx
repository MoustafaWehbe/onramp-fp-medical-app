import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

import { useDailyEntriesContext } from "../../providers/DailyEntriesProvider";

export function DailyEntryForm() {
  const {
    formMode,
    isFormBusy,

    register,
    formErrors,
    handleFormSubmit,
    submitForm,
    cancelForm,

    medications,
    symptoms,
    conditions,
    doctorVisits,
  } = useDailyEntriesContext();

  if (!formMode) {
    return null;
  }

  return (
    <form
      onSubmit={handleFormSubmit(submitForm)}
      className="space-y-6"
    >
      {/* -------------------------------- */}
      {/* Entry date */}
      {/* -------------------------------- */}

      <div className="space-y-2">
        <Label htmlFor="entryDate">
          Entry date
        </Label>

        <Input
          id="entryDate"
          type="date"
          disabled={isFormBusy}
          {...register("entryDate")}
        />

        {formErrors.entryDate && (
          <p className="text-xs text-destructive">
            {formErrors.entryDate.message}
          </p>
        )}
      </div>

      {/* -------------------------------- */}
      {/* Mood and sleep */}
      {/* -------------------------------- */}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="moodRating">
            Mood rating
          </Label>

          <Input
            id="moodRating"
            type="number"
            min="1"
            max="10"
            step="1"
            placeholder="1 - 10"
            disabled={isFormBusy}
            {...register("moodRating", {
              valueAsNumber: true,
            })}
          />

          {formErrors.moodRating && (
            <p className="text-xs text-destructive">
              {formErrors.moodRating.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sleepHours">
            Sleep hours
          </Label>

          <Input
            id="sleepHours"
            type="number"
            min="0"
            max="24"
            step="0.5"
            placeholder="e.g. 7.5"
            disabled={isFormBusy}
            {...register("sleepHours", {
              valueAsNumber: true,
            })}
          />

          {formErrors.sleepHours && (
            <p className="text-xs text-destructive">
              {formErrors.sleepHours.message}
            </p>
          )}
        </div>
      </div>

      {/* -------------------------------- */}
      {/* Journal notes */}
      {/* -------------------------------- */}

      <div className="space-y-2">
        <Label htmlFor="journalNotes">
          Journal notes
        </Label>

        <Textarea
          id="journalNotes"
          placeholder="Write anything you would like to remember about today..."
          disabled={isFormBusy}
          rows={5}
          {...register("journalNotes")}
        />

        {formErrors.journalNotes && (
          <p className="text-xs text-destructive">
            {formErrors.journalNotes.message}
          </p>
        )}
      </div>

      {/* -------------------------------- */}
      {/* Medications */}
      {/* -------------------------------- */}

      <div className="space-y-4">
        <div>
          <h3 className="font-medium">
            Medications
          </h3>

          <p className="text-sm text-muted-foreground">
            Record medications taken today.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="medicationId">
            Medication
          </Label>

          <select
            id="medicationId"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isFormBusy}
            {...register("medicationId")}
          >
            <option value="">
              Select medication
            </option>

            {medications.map((userMedication) => (
              <option
                key={userMedication.id}
                value={userMedication.id}
              >
                {userMedication.medication.name}
              </option>
            ))}
          </select>

          {formErrors.medicationId && (
            <p className="text-xs text-destructive">
              {formErrors.medicationId.message}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="medicationQuantity">
              Quantity
            </Label>

            <Input
              id="medicationQuantity"
              type="number"
              min="0"
              step="any"
              placeholder="e.g. 1"
              disabled={isFormBusy}
              {...register("medicationQuantity", {
                valueAsNumber: true,
              })}
            />

            {formErrors.medicationQuantity && (
              <p className="text-xs text-destructive">
                {formErrors.medicationQuantity.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicationUnit">
              Unit
            </Label>

            <Input
              id="medicationUnit"
              placeholder="e.g. tablet"
              disabled={isFormBusy}
              {...register("medicationUnit")}
            />

            {formErrors.medicationUnit && (
              <p className="text-xs text-destructive">
                {formErrors.medicationUnit.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="medicationTaken"
            type="checkbox"
            disabled={isFormBusy}
            {...register("medicationTaken")}
          />

          <Label htmlFor="medicationTaken">
            Medication was taken
          </Label>
        </div>

        {formErrors.medicationTaken && (
          <p className="text-xs text-destructive">
            {formErrors.medicationTaken.message}
          </p>
        )}

        <div className="space-y-2">
          <Label htmlFor="medicationNotes">
            Medication notes
          </Label>

          <Textarea
            id="medicationNotes"
            placeholder="Optional notes"
            disabled={isFormBusy}
            rows={3}
            {...register("medicationNotes")}
          />

          {formErrors.medicationNotes && (
            <p className="text-xs text-destructive">
              {formErrors.medicationNotes.message}
            </p>
          )}
        </div>
      </div>

      {/* -------------------------------- */}
      {/* Symptoms */}
      {/* -------------------------------- */}

      <div className="space-y-4">
        <div>
          <h3 className="font-medium">
            Symptoms
          </h3>

          <p className="text-sm text-muted-foreground">
            Record symptoms experienced today.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="symptomId">
            Symptom
          </Label>

          <select
            id="symptomId"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isFormBusy}
            {...register("symptomId")}
          >
            <option value="">
              Select symptom
            </option>

            {symptoms.map((symptom: any) => (
              <option
                key={symptom.id}
                value={symptom.id}
              >
                {symptom.name}
              </option>
            ))}
          </select>

          {formErrors.symptomId && (
            <p className="text-xs text-destructive">
              {formErrors.symptomId.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="symptomSeverity">
            Severity
          </Label>

          <Input
            id="symptomSeverity"
            type="number"
            min="1"
            max="10"
            step="1"
            placeholder="1 - 10"
            disabled={isFormBusy}
            {...register("symptomSeverity", {
              valueAsNumber: true,
            })}
          />

          {formErrors.symptomSeverity && (
            <p className="text-xs text-destructive">
              {formErrors.symptomSeverity.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="symptomNotes">
            Symptom notes
          </Label>

          <Textarea
            id="symptomNotes"
            placeholder="Optional notes"
            disabled={isFormBusy}
            rows={3}
            {...register("symptomNotes")}
          />

          {formErrors.symptomNotes && (
            <p className="text-xs text-destructive">
              {formErrors.symptomNotes.message}
            </p>
          )}
        </div>
      </div>

      {/* -------------------------------- */}
      {/* Conditions */}
      {/* -------------------------------- */}

      <div className="space-y-4">
        <div>
          <h3 className="font-medium">
            Conditions
          </h3>

          <p className="text-sm text-muted-foreground">
            Record conditions relevant to today's entry.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="conditionId">
            Condition
          </Label>

          <select
            id="conditionId"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isFormBusy}
            {...register("conditionId")}
          >
            <option value="">
              Select condition
            </option>

            {conditions.map((condition: any) => (
              <option
                key={condition.id}
                value={condition.id}
              >
                {condition.name}
              </option>
            ))}
          </select>

          {formErrors.conditionId && (
            <p className="text-xs text-destructive">
              {formErrors.conditionId.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="conditionStatus">
            Status
          </Label>

          <Input
            id="conditionStatus"
            placeholder="e.g. Stable, improving, worsening"
            disabled={isFormBusy}
            {...register("conditionStatus")}
          />

          {formErrors.conditionStatus && (
            <p className="text-xs text-destructive">
              {formErrors.conditionStatus.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="conditionNotes">
            Condition notes
          </Label>

          <Textarea
            id="conditionNotes"
            placeholder="Optional notes"
            disabled={isFormBusy}
            rows={3}
            {...register("conditionNotes")}
          />

          {formErrors.conditionNotes && (
            <p className="text-xs text-destructive">
              {formErrors.conditionNotes.message}
            </p>
          )}
        </div>
      </div>

      {/* -------------------------------- */}
      {/* Doctor visits */}
      {/* -------------------------------- */}

      <div className="space-y-4">
        <div>
          <h3 className="font-medium">
            Doctor visits
          </h3>

          <p className="text-sm text-muted-foreground">
            Record a doctor visit related to this entry.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="doctorVisitId">
            Doctor visit
          </Label>

          <select
            id="doctorVisitId"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isFormBusy}
            {...register("doctorVisitId")}
          >
            <option value="">
              Select doctor visit
            </option>

            {doctorVisits.map((visit: any) => (
              <option
                key={visit.id}
                value={visit.id}
              >
                {visit.summary}
              </option>
            ))}
          </select>

          {formErrors.doctorVisitId && (
            <p className="text-xs text-destructive">
              {formErrors.doctorVisitId.message}
            </p>
          )}
        </div>
      </div>

      {/* -------------------------------- */}
      {/* Form actions */}
      {/* -------------------------------- */}

      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          disabled={isFormBusy}
        >
          {isFormBusy
            ? formMode === "edit"
              ? "Saving…"
              : "Adding…"
            : formMode === "edit"
              ? "Save changes"
              : "Add daily entry"}
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
