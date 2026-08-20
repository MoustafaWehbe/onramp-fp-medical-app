import { useTranslation } from "react-i18next";
import { useDoctorsContext } from "../../../providers/DoctorsProvider";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { DoctorAutocomplete } from "./DoctorAutocomplete";

export function DoctorForm() {
  const { t } = useTranslation();
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
    panel,
  } = useDoctorsContext();

  const doctorId = watch("doctorId");
  const isNewDoctor = !doctorId;

  const editingClinicId =
    panel.kind === "edit" ? panel.doctor.userClinicId : null;
  const editingClinicMissing =
    editingClinicId != null &&
    !savedClinics.some((c) => c.id === editingClinicId);

  if (!formMode) return null;

  return (
    <form
      onSubmit={handleFormSubmit(submitForm)}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="doctor-name">{t("health.doctors.doctor")}</Label>
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
            {t("health.doctors.searchHelp")}
          </p>
        )}
      </div>

      {isNewDoctor && formMode === "create" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="doctor-specialty">{t("health.doctors.specialty")}</Label>
            <Input
              id="doctor-specialty"
              placeholder={t("health.doctors.exampleSpecialty")}
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
            <Label htmlFor="doctor-phone">{t("health.doctors.phone")}</Label>
            <Input
              id="doctor-phone"
              placeholder={t("health.doctors.examplePhone")}
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
        <Label htmlFor="doctor-clinic">{t("doctorVisits.clinic")}</Label>
        <select
          id="doctor-clinic"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isFormBusy}
          {...register("userClinicId")}
        >
          <option value="">{t("health.doctors.none")}</option>
          {savedClinics.map((c) => (
            <option key={c.id} value={c.id}>
              {c.clinic.name}
            </option>
          ))}
          {editingClinicMissing && (
            <option value={editingClinicId!}>{t("health.doctors.linkedClinic")}</option>
          )}
        </select>
        {formErrors.userClinicId && (
          <p className="text-xs text-destructive">
            {formErrors.userClinicId.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="doctor-notes">{t("health.doctors.notes")}</Label>
        <Input
          id="doctor-notes"
          placeholder={t("health.doctors.optionalNotes")}
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
              ? t("health.doctors.saving")
              : t("health.doctors.adding")
            : formMode === "edit"
              ? t("health.doctors.saveChanges")
              : t("health.doctors.addDoctor")}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isFormBusy}
          onClick={cancelForm}
        >
          {t("health.doctors.cancel")}
        </Button>
      </div>
    </form>
  );
}
