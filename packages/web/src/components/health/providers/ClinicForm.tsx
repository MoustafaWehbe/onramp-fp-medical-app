import { useClinicsContext } from "../../../providers/ClinicsProvider";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { ClinicAutocomplete } from "./ClinicAutocomplete";

export function ClinicForm() {
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
  } = useClinicsContext();

  const clinicId = watch("clinicId");
  const isNewClinic = !clinicId;

  if (!formMode) return null;

  return (
    <form
      onSubmit={handleFormSubmit(submitForm)}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="clinic-name">Clinic</Label>
        {formMode === "edit" ? (
          <Input
            id="clinic-name"
            value={nameQuery}
            disabled
            readOnly
          />
        ) : (
          <ClinicAutocomplete id="clinic-name" />
        )}
        {formErrors.nameQuery && (
          <p className="text-xs text-destructive">
            {formErrors.nameQuery.message}
          </p>
        )}
        {formMode === "create" && (
          <p className="text-xs text-muted-foreground">
            Search the clinic catalog. Fill in the details below if not
            found.
          </p>
        )}
      </div>

      {isNewClinic && formMode === "create" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="clinic-address">Address</Label>
            <Input
              id="clinic-address"
              placeholder="e.g. 123 Main St"
              disabled={isFormBusy}
              {...register("address")}
            />
            {formErrors.address && (
              <p className="text-xs text-destructive">
                {formErrors.address.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="clinic-phone">Phone</Label>
            <Input
              id="clinic-phone"
              placeholder="e.g. +1-555-0100"
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
        <Label htmlFor="clinic-notes">Notes</Label>
        <Input
          id="clinic-notes"
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
              : "Add clinic"}
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
