import { useTranslation } from "react-i18next";
import { useClinicsContext } from "../../../providers/ClinicsProvider";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { ClinicAutocomplete } from "./ClinicAutocomplete";

export function ClinicForm() {
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
        <Label htmlFor="clinic-name">{t("health.clinics.clinic")}</Label>
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
            {t("health.clinics.searchHelp")}
          </p>
        )}
      </div>

      {isNewClinic && formMode === "create" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="clinic-address">{t("health.clinics.address")}</Label>
            <Input
              id="clinic-address"
              placeholder={t("health.clinics.addressPlaceholder")}
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
            <Label htmlFor="clinic-phone">{t("health.clinics.phone")}</Label>
            <Input
              id="clinic-phone"
              placeholder={t("health.clinics.phonePlaceholder")}
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
        <Label htmlFor="clinic-notes">{t("health.clinics.notes")}</Label>
        <Input
          id="clinic-notes"
          placeholder={t("health.clinics.optionalNotes")}
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
              ? t("health.clinics.saving")
              : t("health.clinics.adding")
            : formMode === "edit"
              ? t("health.clinics.saveChanges")
              : t("health.clinics.addClinic")}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isFormBusy}
          onClick={cancelForm}
        >
          {t("health.clinics.cancel")}
        </Button>
      </div>
    </form>
  );
}
