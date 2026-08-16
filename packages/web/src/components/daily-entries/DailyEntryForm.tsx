import { useEffect, useState } from "react";
import {
  useFieldArray,
  type FieldPath,
  type SubmitHandler,
} from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  useDailyEntriesContext,
} from "../../providers/DailyEntriesProvider";
import type { DailyEntryFormValues } from "../../lib/daily-entries/daily-entries-exports";
import { DailyEntryJourney } from "./journey/DailyEntryJourney";
import { FeelingsStep } from "./journey/FeelingsStep";
import { SymptomsStep } from "./journey/SymptomsStep";
import { MedicationsStep } from "./journey/MedicationsStep";
import { ConditionsStep } from "./journey/ConditionsStep";
import { VisitsStep } from "./journey/VisitsStep";
import { continueMessageFor, skipMessageFor } from "./journey/encouragement";
import { LAST_JOURNEY_STEP } from "./journey/steps";
import { wait } from "./journey/motion";

const STEP_FIELDS: FieldPath<DailyEntryFormValues>[][] = [
  ["entryDate", "moodRating", "sleepHours", "journalNotes"],
  ["symptoms"],
  ["medications"],
  ["conditions"],
  ["doctorVisits"],
];

export function DailyEntryForm() {
  const navigate = useNavigate();
  const {
    control,
    register,
    formErrors,
    handleFormSubmit,
    submitForm,
    trigger,
    formError,
    isFormBusy,
    formMode,
    cancelForm,
    symptoms,
    medications,
    conditions,
    doctors,
    clinics,
    isLoadingSymptoms,
    isLoadingMedications,
    isLoadingConditions,
    isLoadingDoctors,
    isLoadingClinics,
    symptomsErrorMessage,
    medicationsErrorMessage,
    conditionsErrorMessage,
    doctorsErrorMessage,
    clinicsErrorMessage,
  } = useDailyEntriesContext();

  const {
    fields: symptomFields,
    append: appendSymptom,
    remove: removeSymptom,
  } = useFieldArray({ control, name: "symptoms" });

  const {
    fields: medicationFields,
    append: appendMedication,
    remove: removeMedication,
  } = useFieldArray({ control, name: "medications" });

  const {
    fields: conditionFields,
    append: appendCondition,
    remove: removeCondition,
  } = useFieldArray({ control, name: "conditions" });

  const {
    fields: doctorVisitFields,
    append: appendDoctorVisit,
    remove: removeDoctorVisit,
  } = useFieldArray({ control, name: "doctorVisits" });

  const [currentStep, setCurrentStep] = useState(0);
  const [burstMessage, setBurstMessage] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);

  useEffect(() => {
    setCurrentStep(0);
    setBurstMessage(null);
    setFinishing(false);
    setComposerOpen(false);
  }, [formMode]);

  useEffect(() => {
    setComposerOpen(false);
  }, [currentStep]);

  const isCreateMode = formMode === "create";
  const isEditMode = formMode === "edit";

  const canAddSymptom = () => {
    if (symptoms.length === 0) {
      navigate("/health-profile");
      return false;
    }
    return true;
  };

  const canAddMedication = () => {
    if (medications.length === 0) {
      navigate("/medications");
      return false;
    }
    return true;
  };

  const canAddCondition = () => {
    if (conditions.length === 0) {
      navigate("/health-profile");
      return false;
    }
    return true;
  };

  const canAddDoctorVisit = () => {
    if (doctors.length === 0 || clinics.length === 0) {
      navigate("/providers");
      return false;
    }
    return true;
  };

  const onSubmit: SubmitHandler<DailyEntryFormValues> = async (values) => {
    setFinishing(true);
    await submitForm(values);
    setFinishing(false);
  };

  async function advance(message: string) {
    const fields = STEP_FIELDS[currentStep];
    const valid = await trigger(fields);
    if (!valid) return;

    setBurstMessage(message);
    await wait(700);
    setBurstMessage(null);
    setCurrentStep((step) => Math.min(step + 1, LAST_JOURNEY_STEP));
  }

  return (
    <form
      onSubmit={handleFormSubmit(onSubmit)}
      className="flex min-h-0 flex-1 flex-col"
    >
      <DailyEntryJourney
        currentStep={currentStep}
        burstMessage={burstMessage}
        finishing={finishing}
        formError={formError}
        isBusy={isFormBusy}
        isCreateMode={isCreateMode}
        isEditMode={isEditMode}
        navLocked={composerOpen}
        onBack={() => setCurrentStep((step) => Math.max(0, step - 1))}
        onContinue={() => void advance(continueMessageFor(currentStep))}
        onSkip={() => void advance(skipMessageFor(currentStep))}
        onCancel={cancelForm}
      >
        {currentStep === 0 && (
          <FeelingsStep
            control={control}
            register={register}
            formErrors={formErrors}
          />
        )}
        {currentStep === 1 && (
          <SymptomsStep
            fields={symptomFields}
            symptoms={symptoms}
            isLoading={isLoadingSymptoms}
            errorMessage={symptomsErrorMessage}
            onStartAdd={canAddSymptom}
            onConfirm={appendSymptom}
            onRemove={removeSymptom}
            onComposerOpenChange={setComposerOpen}
          />
        )}
        {currentStep === 2 && (
          <MedicationsStep
            fields={medicationFields}
            medications={medications}
            isLoading={isLoadingMedications}
            errorMessage={medicationsErrorMessage}
            onStartAdd={canAddMedication}
            onConfirm={appendMedication}
            onRemove={removeMedication}
            onComposerOpenChange={setComposerOpen}
          />
        )}
        {currentStep === 3 && (
          <ConditionsStep
            fields={conditionFields}
            conditions={conditions}
            isLoading={isLoadingConditions}
            errorMessage={conditionsErrorMessage}
            onStartAdd={canAddCondition}
            onConfirm={appendCondition}
            onRemove={removeCondition}
            onComposerOpenChange={setComposerOpen}
          />
        )}
        {currentStep === 4 && (
          <VisitsStep
            fields={doctorVisitFields}
            doctors={doctors}
            clinics={clinics}
            isLoadingDoctors={isLoadingDoctors}
            isLoadingClinics={isLoadingClinics}
            doctorsErrorMessage={doctorsErrorMessage}
            clinicsErrorMessage={clinicsErrorMessage}
            onStartAdd={canAddDoctorVisit}
            onConfirm={appendDoctorVisit}
            onRemove={removeDoctorVisit}
            onComposerOpenChange={setComposerOpen}
          />
        )}
      </DailyEntryJourney>
    </form>
  );
}
