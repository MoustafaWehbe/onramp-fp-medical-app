import { useState } from "react";
import type { FieldArrayWithId } from "react-hook-form";
import {
  dailyEntryFormSchema,
  type DailyEntryFormValues,
} from "../../../lib/daily-entries/daily-entries-exports";
import type { UserClinic, UserDoctor } from "../../../lib/health/health-export";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { AddedItemCard } from "./AddedItemCard";
import { ItemComposer } from "./ItemComposer";
import { parseComposer } from "./composerValidation";
import { selectFieldClass, textareaFieldClass } from "./fieldStyles";

const emptyDraft: DailyEntryFormValues["doctorVisits"][number] = {
  userDoctorId: "",
  userClinicId: "",
  summary: "",
  notes: "",
};

interface VisitsStepProps {
  fields: FieldArrayWithId<DailyEntryFormValues, "doctorVisits", "id">[];
  doctors: UserDoctor[];
  clinics: UserClinic[];
  isLoadingDoctors: boolean;
  isLoadingClinics: boolean;
  doctorsErrorMessage: string | null;
  clinicsErrorMessage: string | null;
  onStartAdd: () => boolean;
  onConfirm: (value: DailyEntryFormValues["doctorVisits"][number]) => void;
  onRemove: (index: number) => void;
  onComposerOpenChange: (open: boolean) => void;
}

export function VisitsStep({
  fields,
  doctors,
  clinics,
  isLoadingDoctors,
  isLoadingClinics,
  doctorsErrorMessage,
  clinicsErrorMessage,
  onStartAdd,
  onConfirm,
  onRemove,
  onComposerOpenChange,
}: VisitsStepProps) {
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const isLoading = isLoadingDoctors || isLoadingClinics;
  const errorMessage = doctorsErrorMessage || clinicsErrorMessage;

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
    const parsed = parseComposer(dailyEntryFormSchema.shape.doctorVisits.element, draft);
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
          Add doctor visit
        </Button>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading doctors and clinics...</p>
      )}
      {doctorsErrorMessage && (
        <p role="alert" className="text-sm text-destructive">
          {doctorsErrorMessage}
        </p>
      )}
      {clinicsErrorMessage && (
        <p role="alert" className="text-sm text-destructive">
          {clinicsErrorMessage}
        </p>
      )}

      {composerOpen && (
        <ItemComposer
          title="New doctor visit"
          onCancel={closeComposer}
          onConfirm={confirmComposer}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="composer-doctor">Doctor</Label>
              <select
                id="composer-doctor"
                autoFocus
                className={selectFieldClass}
                value={draft.userDoctorId}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    userDoctorId: event.target.value,
                  }))
                }
              >
                <option value="">Select a doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.doctor.name}
                  </option>
                ))}
              </select>
              {fieldErrors.userDoctorId && (
                <p className="mt-1.5 text-sm text-destructive">{fieldErrors.userDoctorId}</p>
              )}
            </div>
            <div>
              <Label htmlFor="composer-clinic">Clinic</Label>
              <select
                id="composer-clinic"
                className={selectFieldClass}
                value={draft.userClinicId}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    userClinicId: event.target.value,
                  }))
                }
              >
                <option value="">Select a clinic</option>
                {clinics.map((clinic) => (
                  <option key={clinic.id} value={clinic.id}>
                    {clinic.clinic.name}
                  </option>
                ))}
              </select>
              {fieldErrors.userClinicId && (
                <p className="mt-1.5 text-sm text-destructive">{fieldErrors.userClinicId}</p>
              )}
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="composer-visit-summary">Summary</Label>
            <textarea
              id="composer-visit-summary"
              rows={4}
              placeholder="Describe the reason for or result of the visit..."
              className={textareaFieldClass}
              value={draft.summary}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  summary: event.target.value,
                }))
              }
            />
            {fieldErrors.summary && (
              <p className="mt-1.5 text-sm text-destructive">{fieldErrors.summary}</p>
            )}
          </div>
          <div className="mt-4">
            <Label htmlFor="composer-visit-notes">Notes</Label>
            <textarea
              id="composer-visit-notes"
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
          No doctor visits added. Save whenever you are ready.
        </div>
      )}

      {fields.map((field, index) => {
        const doctorName =
          doctors.find((doctor) => doctor.id === field.userDoctorId)?.doctor.name ?? "Doctor";
        const clinicName =
          clinics.find((clinic) => clinic.id === field.userClinicId)?.clinic.name ?? "Clinic";
        const details = [clinicName];
        if (field.summary?.trim()) details.push(field.summary.trim());
        if (field.notes?.trim()) details.push(field.notes.trim());

        return (
          <AddedItemCard
            key={field.id}
            title={doctorName}
            details={details}
            removeLabel={`Remove visit with ${doctorName}`}
            onRemove={() => onRemove(index)}
          />
        );
      })}
    </div>
  );
}
