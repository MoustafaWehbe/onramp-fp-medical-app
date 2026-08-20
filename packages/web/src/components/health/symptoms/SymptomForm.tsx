import { useTranslation } from "react-i18next";
import { useSymptomsContext } from "../../../providers/SymptomsProvider";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { SymptomAutocomplete } from "./SymptomAutocomplete";

export function SymptomForm() {
  const { t } = useTranslation();
  const {
    formMode,
    isFormBusy,
    formErrors,
    handleFormSubmit,
    submitForm,
    cancelForm,
  } = useSymptomsContext();

  if (!formMode) return null;

  return (
    <form
      onSubmit={handleFormSubmit(submitForm)}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="symptom-name">{t("health.symptoms.symptom")}</Label>
        <SymptomAutocomplete id="symptom-name" />
        {formErrors.nameQuery && (
          <p className="text-xs text-destructive">
            {formErrors.nameQuery.message}
          </p>
        )}
        <p className="text-sm leading-5 text-muted-foreground">
          {t("health.symptoms.help")}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isFormBusy}>
          {isFormBusy ? t("health.symptoms.adding") : t("health.symptoms.addSymptom")}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isFormBusy}
          onClick={cancelForm}
        >
          {t("health.symptoms.cancel")}
        </Button>
      </div>
    </form>
  );
}
