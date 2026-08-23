import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { FieldArrayWithId } from "react-hook-form";
import {
  dailyEntryFormSchema,
  type DailyEntryFormValues,
} from "../../../lib/daily-entries/daily-entries-exports";
import type { UserCondition } from "../../../lib/health/health-export";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { AddedItemCard } from "./AddedItemCard";
import { ComposerFieldError, composerControlProps } from "./composerField";
import { EmptyCatalogHint } from "./EmptyCatalogHint";
import { ItemComposer } from "./ItemComposer";
import { parseComposer } from "./composerValidation";
import { selectFieldClass, textareaFieldClass } from "./fieldStyles";

const emptyDraft: DailyEntryFormValues["conditions"][number] = {
  userConditionId: "",
  notes: "",
};

interface ConditionsStepProps {
  fields: FieldArrayWithId<DailyEntryFormValues, "conditions", "id">[];
  conditions: UserCondition[];
  isLoading: boolean;
  errorMessage: string | null;
  onStartAdd: () => boolean;
  onConfirm: (value: DailyEntryFormValues["conditions"][number]) => void;
  onRemove: (index: number) => void;
  onComposerOpenChange: (open: boolean) => void;
}

export function ConditionsStep({
  fields,
  conditions,
  isLoading,
  errorMessage,
  onStartAdd,
  onConfirm,
  onRemove,
  onComposerOpenChange,
}: ConditionsStepProps) {
  const { t } = useTranslation();
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const addedConditionIds = new Set(fields.map((field) => field.userConditionId));
  const availableConditions = conditions.filter(
    (condition) => !addedConditionIds.has(condition.id),
  );

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
    const parsed = parseComposer(dailyEntryFormSchema.shape.conditions.element, draft);
    if (!parsed.success) {
      setFieldErrors(parsed.errors);
      return;
    }

    if (addedConditionIds.has(parsed.data.userConditionId)) {
      setFieldErrors({ userConditionId: "This condition is already added" });
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
          disabled={
            isLoading ||
            Boolean(errorMessage) ||
            composerOpen ||
            conditions.length === 0 ||
            availableConditions.length === 0
          }
        >
          {t("dailyEntries.journey.composer.addCondition")}
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">{t("dailyEntries.journey.composer.loadingConditions")}</p>}
      {errorMessage && (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
      )}

      {composerOpen && (
        <ItemComposer
          title={t("dailyEntries.journey.composer.newCondition")}
          onCancel={closeComposer}
          onConfirm={confirmComposer}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="composer-condition">{t("dailyEntries.journey.composer.condition")}</Label>
              <select
                id="composer-condition"
                autoFocus
                className={selectFieldClass}
                value={draft.userConditionId}
                onChange={(event) => {
                  setDraft((current) => ({
                    ...current,
                    userConditionId: event.target.value,
                  }));
                  if (fieldErrors.userConditionId) {
                    setFieldErrors(({ userConditionId: _, ...rest }) => rest);
                  }
                }}
                {...composerControlProps("composer-condition-error", fieldErrors.userConditionId)}
              >
                <option value="">{t("dailyEntries.journey.composer.selectCondition")}</option>
                {availableConditions.map((condition) => (
                  <option key={condition.id} value={condition.id}>
                    {condition.condition.name}
                  </option>
                ))}
              </select>
              <ComposerFieldError id="composer-condition-error" error={fieldErrors.userConditionId} />
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="composer-condition-notes">{t("dailyEntries.journey.composer.notes")}</Label>
            <textarea
              id="composer-condition-notes"
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
              {...composerControlProps("composer-condition-notes-error", fieldErrors.notes)}
            />
            <ComposerFieldError id="composer-condition-notes-error" error={fieldErrors.notes} />
          </div>
        </ItemComposer>
      )}

      {!isLoading && !errorMessage && conditions.length === 0 && (
        <EmptyCatalogHint to="/health-profile" actionLabel={t("dailyEntries.journey.composer.addConditionProfile")} />
      )}

      {!isLoading && !errorMessage && fields.length === 0 && !composerOpen && conditions.length > 0 && (
        <div className="rounded-2xl border border-dashed bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground">
          {t("dailyEntries.journey.composer.noConditionsAdded")}
        </div>
      )}

      {fields.map((field, index) => {
        const conditionName =
          conditions.find((condition) => condition.id === field.userConditionId)?.condition
            .name ?? "Condition";
        const details = [];
        if (field.notes?.trim()) details.push(field.notes.trim());

        return (
          <AddedItemCard
            key={field.id}
            title={conditionName}
            details={details}
            removeLabel={t("dailyEntries.journey.composer.remove", { name: conditionName })}
            onRemove={() => onRemove(index)}
          />
        );
      })}
    </div>
  );
}
