import { useState } from "react";
import type { FieldArrayWithId } from "react-hook-form";
import {
  dailyEntryFormSchema,
  type DailyEntryFormValues,
} from "../../../lib/daily-entries/daily-entries-exports";
import type { UserCondition } from "../../../lib/health/health-export";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { AddedItemCard } from "./AddedItemCard";
import { ItemComposer } from "./ItemComposer";
import { parseComposer } from "./composerValidation";
import { selectFieldClass, textareaFieldClass } from "./fieldStyles";

const emptyDraft: DailyEntryFormValues["conditions"][number] = {
  userConditionId: "",
  status: "active",
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
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
          disabled={isLoading || Boolean(errorMessage) || composerOpen}
        >
          Add condition
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading conditions...</p>}
      {errorMessage && (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
      )}

      {composerOpen && (
        <ItemComposer
          title="New condition"
          onCancel={closeComposer}
          onConfirm={confirmComposer}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="composer-condition">Condition</Label>
              <select
                id="composer-condition"
                autoFocus
                className={selectFieldClass}
                value={draft.userConditionId}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    userConditionId: event.target.value,
                  }))
                }
              >
                <option value="">Select a condition</option>
                {conditions.map((condition) => (
                  <option key={condition.id} value={condition.id}>
                    {condition.condition.name}
                  </option>
                ))}
              </select>
              {fieldErrors.userConditionId && (
                <p className="mt-1.5 text-sm text-destructive">{fieldErrors.userConditionId}</p>
              )}
            </div>
            <div>
              <Label htmlFor="composer-condition-status">Status</Label>
              <select
                id="composer-condition-status"
                className={selectFieldClass}
                value={draft.status}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    status: event.target.value as DailyEntryFormValues["conditions"][number]["status"],
                  }))
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="composer-condition-notes">Notes</Label>
            <textarea
              id="composer-condition-notes"
              rows={3}
              placeholder="Optional notes..."
              className={textareaFieldClass}
              value={draft.notes ?? ""}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  notes: event.target.value,
                }))
              }
            />
            {fieldErrors.notes && (
              <p className="mt-1.5 text-sm text-destructive">{fieldErrors.notes}</p>
            )}
          </div>
        </ItemComposer>
      )}

      {!isLoading && !errorMessage && fields.length === 0 && !composerOpen && (
        <div className="rounded-2xl border border-dashed bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground">
          No conditions added. You can skip this stop.
        </div>
      )}

      {fields.map((field, index) => {
        const conditionName =
          conditions.find((condition) => condition.id === field.userConditionId)?.condition
            .name ?? "Condition";
        const details = [
          field.status.charAt(0).toUpperCase() + field.status.slice(1),
        ];
        if (field.notes?.trim()) details.push(field.notes.trim());

        return (
          <AddedItemCard
            key={field.id}
            title={conditionName}
            details={details}
            removeLabel={`Remove ${conditionName}`}
            onRemove={() => onRemove(index)}
          />
        );
      })}
    </div>
  );
}
