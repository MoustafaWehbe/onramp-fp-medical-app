import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { FieldArrayWithId } from "react-hook-form";
import {
  dailyEntryFormSchema,
  type DailyEntryFormValues,
} from "../../../lib/daily-entries/daily-entries-exports";
import type { UserClinic, UserDoctor } from "../../../lib/health/health-export";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { AddedItemCard } from "./AddedItemCard";
import { ComposerFieldError, composerControlProps } from "./composerField";
import { EmptyCatalogHint } from "./EmptyCatalogHint";
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
  const { t } = useTranslation();
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
          disabled={
            isLoading ||
            Boolean(errorMessage) ||
            composerOpen ||
            doctors.length === 0 ||
            clinics.length === 0
          }
        >
          {t("dailyEntries.journey.composer.addVisit")}
        </Button>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">{t("dailyEntries.journey.composer.loadingProviders")}</p>
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
          title={t("dailyEntries.journey.composer.newVisit")}
          onCancel={closeComposer}
          onConfirm={confirmComposer}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="composer-doctor">{t("dailyEntries.journey.composer.doctor")}</Label>
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
                {...composerControlProps("composer-doctor-error", fieldErrors.userDoctorId)}
              >
                <option value="">{t("dailyEntries.journey.composer.selectDoctor")}</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.doctor.name}
                  </option>
                ))}
              </select>
              <ComposerFieldError id="composer-doctor-error" error={fieldErrors.userDoctorId} />
            </div>
            <div>
              <Label htmlFor="composer-clinic">{t("dailyEntries.journey.composer.clinic")}</Label>
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
                {...composerControlProps("composer-clinic-error", fieldErrors.userClinicId)}
              >
                <option value="">{t("dailyEntries.journey.composer.selectClinic")}</option>
                {clinics.map((clinic) => (
                  <option key={clinic.id} value={clinic.id}>
                    {clinic.clinic.name}
                  </option>
                ))}
              </select>
              <ComposerFieldError id="composer-clinic-error" error={fieldErrors.userClinicId} />
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="composer-visit-summary">{t("dailyEntries.journey.composer.summary")}</Label>
            <textarea
              id="composer-visit-summary"
              rows={4}
              placeholder={t("dailyEntries.journey.composer.visitSummaryPlaceholder")}
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
            <Label htmlFor="composer-visit-notes">{t("dailyEntries.journey.composer.notes")}</Label>
            <textarea
              id="composer-visit-notes"
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
            />
            {fieldErrors.notes && (
              <p className="mt-1.5 text-sm text-destructive">{fieldErrors.notes}</p>
            )}
          </div>
        </ItemComposer>
      )}

      {!isLoading && !errorMessage && (doctors.length === 0 || clinics.length === 0) && (
        <EmptyCatalogHint to="/providers" actionLabel={t("dailyEntries.journey.composer.addProviderProfile")} />
      )}

      {!isLoading &&
        !errorMessage &&
        fields.length === 0 &&
        !composerOpen &&
        doctors.length > 0 &&
        clinics.length > 0 && (
        <div className="rounded-2xl border border-dashed bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground">
          {t("dailyEntries.journey.composer.noVisitsAdded")}
        </div>
      )}

      {fields.map((field, index) => {
        const doctorName =
          doctors.find((doctor) => doctor.id === field.userDoctorId)?.doctor.name ?? "Doctor";
        const clinicName = clinics.find(
          (clinic) => clinic.id === field.userClinicId,
        )?.clinic.name;
        const details = [
          ...(clinicName ? [clinicName] : []),
          ...(field.summary?.trim() ? [field.summary.trim()] : []),
          ...(field.notes?.trim() ? [field.notes.trim()] : []),
        ];

        return (
          <AddedItemCard
            key={field.id}
            title={doctorName}
            details={details}
            removeLabel={t("dailyEntries.journey.composer.removeVisit", { name: doctorName })}
            onRemove={() => onRemove(index)}
          />
        );
      })}
    </div>
  );
}
