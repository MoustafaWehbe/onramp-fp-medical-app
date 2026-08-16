import { useState } from "react";
import type { FieldArrayWithId } from "react-hook-form";
import {
  dailyEntryFormSchema,
  type DailyEntryFormValues,
} from "../../../lib/daily-entries/daily-entries-exports";
import type { UserSymptom } from "../../../lib/health/health-export";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { AddedItemCard } from "./AddedItemCard";
import { ItemComposer } from "./ItemComposer";
import { parseComposer } from "./composerValidation";
import { selectFieldClass, textareaFieldClass } from "./fieldStyles";

const emptyDraft: DailyEntryFormValues["symptoms"][number] = {
  userSymptomId: "",
  severity: "",
  notes: "",
};

interface SymptomsStepProps {
  fields: FieldArrayWithId<DailyEntryFormValues, "symptoms", "id">[];
  symptoms: UserSymptom[];
  isLoading: boolean;
  errorMessage: string | null;
  onStartAdd: () => boolean;
  onConfirm: (value: DailyEntryFormValues["symptoms"][number]) => void;
  onRemove: (index: number) => void;
  onComposerOpenChange: (open: boolean) => void;
}

export function SymptomsStep({
  fields,
  symptoms,
  isLoading,
  errorMessage,
  onStartAdd,
  onConfirm,
  onRemove,
  onComposerOpenChange,
}: SymptomsStepProps) {
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const addedSymptomIds = new Set(fields.map((field) => field.userSymptomId));
  const availableSymptoms = symptoms.filter((symptom) => !addedSymptomIds.has(symptom.id));

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
    const parsed = parseComposer(dailyEntryFormSchema.shape.symptoms.element, draft);
    if (!parsed.success) {
      setFieldErrors(parsed.errors);
      return;
    }

    if (addedSymptomIds.has(parsed.data.userSymptomId)) {
      setFieldErrors({ userSymptomId: "This symptom is already added" });
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
            (symptoms.length > 0 && availableSymptoms.length === 0)
          }
        >
          Add symptom
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading symptoms...</p>}
      {errorMessage && (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
      )}

      {composerOpen && (
        <ItemComposer
          title="New symptom"
          onCancel={closeComposer}
          onConfirm={confirmComposer}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="composer-symptom">Symptom</Label>
              <select
                id="composer-symptom"
                autoFocus
                className={selectFieldClass}
                value={draft.userSymptomId}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    userSymptomId: event.target.value,
                  }))
                }
              >
                <option value="">Select a symptom</option>
                {availableSymptoms.map((symptom) => (
                  <option key={symptom.id} value={symptom.id}>
                    {symptom.catalog.name}
                  </option>
                ))}
              </select>
              {fieldErrors.userSymptomId && (
                <p className="mt-1.5 text-sm text-destructive">{fieldErrors.userSymptomId}</p>
              )}
            </div>
            <div>
              <Label htmlFor="composer-severity">Severity</Label>
              <Input
                id="composer-severity"
                type="number"
                min="1"
                max="10"
                step="1"
                placeholder="1 - 10"
                className="mt-1.5"
                value={draft.severity}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    severity: event.target.value,
                  }))
                }
              />
              {fieldErrors.severity && (
                <p className="mt-1.5 text-sm text-destructive">{fieldErrors.severity}</p>
              )}
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="composer-symptom-notes">Notes</Label>
            <textarea
              id="composer-symptom-notes"
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
          No symptoms added. You can skip this stop.
        </div>
      )}

      {fields.map((field, index) => {
        const symptomName =
          symptoms.find((symptom) => symptom.id === field.userSymptomId)?.catalog.name ??
          "Symptom";
        const details = [`Severity ${field.severity}`];
        if (field.notes?.trim()) {
          details.push(field.notes.trim());
        }

        return (
          <AddedItemCard
            key={field.id}
            title={symptomName}
            details={details}
            removeLabel={`Remove ${symptomName}`}
            onRemove={() => onRemove(index)}
          />
        );
      })}
    </div>
  );
}
