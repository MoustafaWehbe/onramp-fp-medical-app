import { useTranslation } from "react-i18next";
import { CONDITION_STATUSES } from "../../../lib/health/health-export";
import { useConditionsContext } from "../../../providers/ConditionsProvider";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { ConditionAutocomplete } from "./ConditionAutocomplete";

export function ConditionForm() {
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
  } = useConditionsContext();

  if (!formMode) return null;

  return (
    <form
      onSubmit={handleFormSubmit(submitForm)}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="condition-name">{t("health.conditions.condition")}</Label>
        {formMode === "edit" ? (
          <Input
            id="condition-name"
            value={nameQuery}
            disabled
            readOnly
          />
        ) : (
          <ConditionAutocomplete id="condition-name" />
        )}
        {formErrors.nameQuery && (
          <p className="text-xs text-destructive">
            {formErrors.nameQuery.message}
          </p>
        )}
        {formMode === "create" && (
          <p className="text-xs text-muted-foreground">
            {t("health.conditions.searchHelp")}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">{t("health.conditions.status")}</Label>
        <select
          id="status"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isFormBusy}
          {...register("status")}
        >
          {CONDITION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`health.conditions.status${s.charAt(0).toUpperCase()}${s.slice(1)}`)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="diagnosedDate">{t("health.conditions.diagnosedDate")}</Label>
        <Input
          id="diagnosedDate"
          type="date"
          disabled={isFormBusy}
          {...register("diagnosedDate")}
        />
        {formErrors.diagnosedDate && (
          <p className="text-xs text-destructive">
            {formErrors.diagnosedDate.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t("health.conditions.description")}</Label>
        <Input
          id="description"
          placeholder={t("health.conditions.briefDescription")}
          disabled={isFormBusy}
          {...register("description")}
        />
        {formErrors.description && (
          <p className="text-xs text-destructive">
            {formErrors.description.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">{t("health.conditions.notes")}</Label>
        <Input
          id="notes"
          placeholder={t("health.conditions.optionalNotes")}
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
              ? t("health.conditions.saving")
              : t("health.conditions.adding")
            : formMode === "edit"
              ? t("health.conditions.saveChanges")
              : t("health.conditions.addCondition")}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isFormBusy}
          onClick={cancelForm}
        >
          {t("health.conditions.cancel")}
        </Button>
      </div>
    </form>
  );
}
