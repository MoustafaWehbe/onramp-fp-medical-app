import { NotebookPen } from "lucide-react";
import { useDoctorsContext } from "../../../providers/DoctorsProvider";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { DoctorAutocomplete } from "./DoctorAutocomplete";

export function DoctorForm() {
  const {
    formMode,
    isFormBusy,
    register,
    watch,
    nameQuery,
    formErrors,
    handleFormSubmit,
    submitForm,
    cancelForm,
    savedClinics,
  } = useDoctorsContext();

  const doctorId = watch("doctorId");
  const isNewDoctor = !doctorId;

  if (!formMode) return null;

  return (
    <form
      onSubmit={handleFormSubmit(submitForm)}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="doctor-name">Doctor</Label>
        {formMode === "edit" ? (
          <Input
            id="doctor-name"
            value={nameQuery}
            disabled
            readOnly
          />
        ) : (
          <DoctorAutocomplete id="doctor-name" />
        )}
        {formErrors.nameQuery && (
          <p className="text-xs text-destructive">
            {formErrors.nameQuery.message}
          </p>
        )}
        {formMode === "create" && (
          <p className="text-xs text-muted-foreground">
            Search the doctor catalog. Fill in the details below if not
            found.
          </p>
        )}
      </div>

      {isNewDoctor && formMode === "create" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="doctor-specialty">Specialty</Label>
            <Input
              id="doctor-specialty"
              placeholder="e.g. Cardiology"
              disabled={isFormBusy}
              {...register("specialty")}
            />
            {formErrors.specialty && (
              <p className="text-xs text-destructive">
                {formErrors.specialty.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="doctor-phone">Phone</Label>
            <Input
              id="doctor-phone"
              placeholder="e.g. +1-555-0200"
              disabled={isFormBusy}
              {...register("phone")}
            />
            {formErrors.phone && (
              <p className="text-xs text-destructive">
                {formErrors.phone.message}
              </p>
            )}
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="doctor-clinic">Clinic</Label>
        <select
          id="doctor-clinic"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isFormBusy}
          {...register("userClinicId")}
        >
          <option value="">None</option>
          {savedClinics.map((c) => (
            <option key={c.id} value={c.id}>
              {c.clinic.name}
            </option>
          ))}
        </select>
        {formErrors.userClinicId && (
          <p className="text-xs text-destructive">
            {formErrors.userClinicId.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="doctor-notes">Notes</Label>
        <Input
          id="doctor-notes"
          placeholder="Optional notes"
          disabled={isFormBusy}
          {...register("notes")}
        />
        {formErrors.notes && (
          <p className="text-xs text-destructive">
            {formErrors.notes.message}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isFormBusy}>
          {isFormBusy
            ? formMode === "edit"
              ? "Saving\u2026"
              : "Adding\u2026"
            : formMode === "edit"
              ? "Save changes"
              : "Add doctor"}
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
