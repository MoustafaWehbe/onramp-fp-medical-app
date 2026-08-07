import {
useFieldArray,
type SubmitHandler,
} from "react-hook-form";

import {
useDailyEntriesContext,
} from "../../providers/DailyEntriesProvider";

import type {
DailyEntryFormValues,
} from "../../lib/daily-entries/daily-entries-exports";

import { MEDICATION_UNITS } from "../../lib/health/health-export";
import { Input } from "../../components/ui/input";
import { useNavigate } from "react-router-dom";

/**

* ---
* Daily Entry Form
* ---
*
* This component is responsible only for rendering
* and managing the daily-entry form UI.
*
* The main form instance is owned by
* DailyEntriesProvider.
*
* The provider gives us:
*
* * register
* * control
* * formErrors
* * handleFormSubmit
* * submitForm
* * formError
* * isFormBusy
*
* The dynamic nested arrays are managed here with
* React Hook Form's useFieldArray.
  */



export function DailyEntryForm() {
  const navigate = useNavigate();
const {
control,
register,
formErrors,
handleFormSubmit,
submitForm,
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

/**

* ---
* Dynamic Symptoms
* ---

*/

const {
fields: symptomFields,
append: appendSymptom,
remove: removeSymptom,
} = useFieldArray({
control,
name: "symptoms",
});

/**

* ---
* Dynamic Medications
* ---

*/

const {
fields: medicationFields,
append: appendMedication,
remove: removeMedication,
} = useFieldArray({
control,
name: "medications",
});

/**

* ---
* Dynamic Conditions
* ---

*/

const {
fields: conditionFields,
append: appendCondition,
remove: removeCondition,
} = useFieldArray({
control,
name: "conditions",
});

/**

* ---
* Dynamic Doctor Visits
* ---

*/

const {
fields: doctorVisitFields,
append: appendDoctorVisit,
remove: removeDoctorVisit,
} = useFieldArray({
control,
name: "doctorVisits",
});

/**

* ---
* Submit
* ---

*/

const onSubmit: SubmitHandler<DailyEntryFormValues> = async (values) => {
 await submitForm(values);
 };

/**

* ---
* Helpers
* ---

*/

const isCreateMode =
formMode === "create";
const handleAddSymptom = () => {
  if (symptoms.length === 0) {
    <p className="mt-2 text-sm text-muted-foreground">
    No symptoms found. Add symptoms from your Health Profile before creating a daily entry.
  </p>
    navigate("/health-profile");
    return;
  }

  appendSymptom({
    userSymptomId: "",
    severity: "",
    notes: "",
  });
};


const handleAddMedication = () => {
  if (medications.length === 0) {
    <p className="mt-2 text-sm text-muted-foreground">
    No medications found. Add medications from your Health Profile before creating a daily entry.
  </p>
    navigate("/medications");
    return;
  }

  appendMedication({
    userMedicationId: "",
    quantity: "",
    unit: "mg",
    taken: false,
    takenAt: "",
    notes: "",
  });
};


const handleAddCondition = () => {
  if (conditions.length === 0) {
    <p className="mt-2 text-sm text-muted-foreground">
    No conditions found. Add conditions from your Health Profile before creating a daily entry.
  </p>
    navigate("/health-profile");
    return;
  }

  appendCondition({
    userConditionId: "",
    status: "active",
    notes: "",
  });
};


const handleAddDoctorVisit = () => {
  if (doctors.length === 0 || clinics.length === 0) {
    <p className="mt-2 text-sm text-muted-foreground">
    No doctors or clinics found. Add them from your Health Profile before creating a daily entry.
  </p>
    navigate("/providers");
    return;
  }

  appendDoctorVisit({
    userDoctorId: "",
    userClinicId: "",
    summary: "",
    notes: "",
  });
};

const isEditMode =
formMode === "edit";

return ( <form
   onSubmit={handleFormSubmit(onSubmit)}
   className="
     space-y-8
   "
 >
{/* ================================================== */}
{/* FORM ERROR                                         */}
{/* ================================================== */}


  {formError && (
    <div
      role="alert"
      className="
        rounded-md
        border
        border-red-200
        bg-red-50
        px-4
        py-3
        text-sm
        text-red-700
      "
    >
      {formError}
    </div>
  )}

  {/* ================================================== */}
  {/* BASIC DAILY INFORMATION                            */}
  {/* ================================================== */}

  <section
    className="
      space-y-5
    "
  >
    <div>
      <h2
        className="
          text-lg
          font-semibold
          text-foreground
        "
      >
        Daily information
      </h2>

      <p
        className="
          mt-1
          text-sm
          text-muted-foreground
        "
      >
        Record how you are feeling today.
      </p>
    </div>

    {/* ---------------------------------------------- */}
    {/* Entry Date                                     */}
    {/* ---------------------------------------------- */}

    <div>
      <label
        htmlFor="entryDate"
        className="
          block
          text-sm
          font-medium
          text-foreground
        "
      >
        Entry date
      </label>

      <Input
        id="entryDate"
        type="date"
        readOnly
        {...register("entryDate")}
        
      />

      {formErrors.entryDate && (
        <p
          className="
            mt-1
            text-sm
            text-red-600
          "
        >
          {formErrors.entryDate.message}
        </p>
      )}

    </div>

    {/* ---------------------------------------------- */}
    {/* Mood + Sleep                                   */}
    {/* ---------------------------------------------- */}

    <div
      className="
        grid
        grid-cols-1
        gap-5
        sm:grid-cols-2
      "
    >
      {/* Mood */}

      <div>
        <label
          htmlFor="moodRating"
          className="
            block
            text-sm
            font-medium
            text-foreground
          "
        >
          Mood rating
        </label>

        <Input
          id="moodRating"
          type="number"
          min="1"
          max="5"
          step="1"
          placeholder="1 - 5"
          {...register("moodRating")}
          
        />

        {formErrors.moodRating && (
          <p
            className="
              mt-1
              text-sm
              text-red-600
            "
          >
            {formErrors.moodRating.message}
          </p>
        )}

        <p
          className="
            mt-1
            text-xs
            text-muted-foreground
          "
        >
          Rate your mood from 1 to 5.
        </p>
      </div>

      {/* Sleep */}

      <div>
        <label
          htmlFor="sleepHours"
          className="
            block
            text-sm
            font-medium
            text-foreground
          "
        >
          Sleep hours
        </label>

        <Input
          id="sleepHours"
          type="number"
          min="0"
          step="0.5"
          placeholder="e.g. 7.5"
          {...register("sleepHours")}
          
        />

        {formErrors.sleepHours && (
          <p
            className="
              mt-1
              text-sm
              text-red-600
            "
          >
            {formErrors.sleepHours.message}
          </p>
        )}

        <p
          className="
            mt-1
            text-xs
            text-muted-foreground
          "
        >
          Enter the number of hours you slept.
        </p>
      </div>
    </div>

    {/* ---------------------------------------------- */}
    {/* Journal Notes                                  */}
    {/* ---------------------------------------------- */}

    <div>
      <label
        htmlFor="journalNotes"
        className="
          block
          text-sm
          font-medium
          text-foreground
        "
      >
        Journal notes
      </label>

      <Input
        id="journalNotes"
        placeholder="Write anything you would like to remember about today..."
        {...register("journalNotes")}
        
        
      />

      {formErrors.journalNotes && (
        <p
          className="
            mt-1
            text-sm
            text-red-600
          "
        >
          {formErrors.journalNotes.message}
        </p>
      )}
    </div>
  </section>

  {/* ================================================== */}
  {/* SYMPTOMS                                           */}
  {/* ================================================== */}

  <section
    className="
      space-y-5
      border-t
      pt-8
    "
  >
    <div
      className="
        flex
        items-center
        justify-between
        gap-4
      "
    >
      <div>
        <h2
          className="
            text-lg
            font-semibold
            text-foreground
          "
        >
          Symptoms
        </h2>

        <p
          className="
            mt-1
            text-sm
            text-muted-foreground
          "
        >
          Add any symptoms you experienced today.
        </p>
      </div>

      <button
        type="button"
        onClick={handleAddSymptom}
        disabled={
          isLoadingSymptoms ||
          Boolean(symptomsErrorMessage)
        }
        className="
          rounded-md
          border
          px-3
          py-2
          text-sm
          font-medium
          text-foreground
          transition
          hover:bg-muted
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        Add symptom
      </button>
    </div>

    {isLoadingSymptoms && (
      <p
        className="
          text-sm
          text-muted-foreground
        "
      >
        Loading symptoms...
      </p>
    )}

    {symptomsErrorMessage && (
      <p
        role="alert"
        className="
          text-sm
          text-red-600
        "
      >
        {symptomsErrorMessage}
      </p>
    )}

    {!isLoadingSymptoms &&
      !symptomsErrorMessage &&
      symptomFields.length === 0 && (
        <div
          className="
            rounded-md
            border
            border-dashed
            p-5
            text-center
            text-sm
            text-muted-foreground
          "
        >
          No symptoms added.
        </div>
      )}

    <div
      className="
        space-y-4
      "
    >
      {symptomFields.map(
        (field, index) => (
          <div
            key={field.id}
            className="
              rounded-lg
              border
              bg-muted
              p-4
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                gap-4
              "
            >
              <h3
                className="
                  font-medium
                  text-foreground
                "
              >
                Symptom {index + 1}
              </h3>

              <button
                type="button"
                onClick={() =>
                  removeSymptom(index)
                }
                className="
                  text-sm
                  font-medium
                  text-red-600
                  hover:text-red-700
                "
              >
                Remove
              </button>
            </div>

            <div
              className="
                mt-4
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-2
              "
            >
              <div>
                <label
                  htmlFor={`symptoms.${index}.userSymptomId`}
                  className="
                    block
                    text-sm
                    font-medium
                    text-foreground
                  "
                >
                  Symptom
                </label>

                <select
                  id={`symptoms.${index}.userSymptomId`}
                  {...register(
                    `symptoms.${index}.userSymptomId`,
                  )}
                  className="
                    mt-1
                    block
                    w-full
                    rounded-md
                    border
                    border-gray-300
                    bg-card
                    px-3
                    py-2
                    text-sm
                    outline-none
                    focus:border-gray-500
                    focus:ring-1
                    focus:ring-gray-500
                  "
                >
                  <option value="">
                    Select a symptom
                  </option>

                  {symptoms.map(
                    (symptom) => (
                      <option
                        key={symptom.id}
                        value={symptom.id}
                      >
                        {symptom.catalog.name}
                      </option>
                    ),
                  )}
                </select>

                {formErrors.symptoms?.[
                  index
                ]?.userSymptomId && (
                  <p
                    className="
                      mt-1
                      text-sm
                      text-red-600
                    "
                  >
                    {
                      formErrors.symptoms[
                        index
                      ]?.userSymptomId
                        ?.message
                    }
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor={`symptoms.${index}.severity`}
                  className="
                    block
                    text-sm
                    font-medium
                    text-foreground
                  "
                >
                  Severity
                </label>

                <Input
                  id={`symptoms.${index}.severity`}
                  type="number"
                  min="1"
                  max="10"
                  step="1"
                  placeholder="1 - 10"
                  {...register(
                    `symptoms.${index}.severity`,
                  )}
                 
                />

                {formErrors.symptoms?.[
                  index
                ]?.severity && (
                  <p
                    className="
                      mt-1
                      text-sm
                      text-red-600
                    "
                  >
                    {
                      formErrors.symptoms[
                        index
                      ]?.severity
                        ?.message
                    }
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label
                htmlFor={`symptoms.${index}.notes`}
                className="
                  block
                  text-sm
                  font-medium
                  text-foreground
                "
              >
                Notes
              </label>

              <textarea
                id={`symptoms.${index}.notes`}
                rows={3}
                placeholder="Optional notes..."
                {...register(
                  `symptoms.${index}.notes`,
                )}
                className="
                  mt-1
                  block
                  w-full
                  resize-y
                  rounded-md
                  border
                  border-gray-300
                  bg-card
                  px-3
                  py-2
                  text-sm
                  outline-none
                  focus:border-gray-500
                  focus:ring-1
                  focus:ring-gray-500
                "
              />

              {formErrors.symptoms?.[
                index
              ]?.notes && (
                <p
                  className="
                    mt-1
                    text-sm
                    text-red-600
                  "
                >
                  {
                    formErrors.symptoms[
                      index
                    ]?.notes
                      ?.message
                  }
                </p>
              )}
            </div>
          </div>
        ),
      )}
    </div>
  </section>

  {/* ================================================== */}
  {/* MEDICATIONS                                        */}
  {/* ================================================== */}

  <section
    className="
      space-y-5
      border-t
      pt-8
    "
  >
    <div
      className="
        flex
        items-center
        justify-between
        gap-4
      "
    >
      <div>
        <h2
          className="
            text-lg
            font-semibold
            text-foreground
          "
        >
          Medications
        </h2>

        <p
          className="
            mt-1
            text-sm
            text-muted-foreground
          "
        >
          Record medications taken today.
        </p>
      </div>

      <button
        type="button"
        onClick={handleAddMedication}
        disabled={
          isLoadingMedications ||
          Boolean(
            medicationsErrorMessage,
          )
        }
        className="
          rounded-md
          border
          px-3
          py-2
          text-sm
          font-medium
          text-foreground
          transition
          hover:bg-muted
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        Add medication
      </button>
    </div>

    {isLoadingMedications && (
      <p
        className="
          text-sm
          text-muted-foreground
        "
      >
        Loading medications...
      </p>
    )}

    {medicationsErrorMessage && (
      <p
        role="alert"
        className="
          text-sm
          text-red-600
        "
      >
        {medicationsErrorMessage}
      </p>
    )}

    {!isLoadingMedications &&
      !medicationsErrorMessage &&
      medicationFields.length === 0 && (
        <div
          className="
            rounded-md
            border
            border-dashed
            p-5
            text-center
            text-sm
            text-muted-foreground
          "
        >
          No medications added.
        </div>
      )}

    <div className="space-y-4">
      {medicationFields.map(
        (field, index) => (
          <div
            key={field.id}
            className="
              rounded-lg
              border
              bg-muted
              p-4
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                gap-4
              "
            >
              <h3
                className="
                  font-medium
                  text-foreground
                "
              >
                Medication {index + 1}
              </h3>

              <button
                type="button"
                onClick={() =>
                  removeMedication(index)
                }
                className="
                  text-sm
                  font-medium
                  text-red-600
                  hover:text-red-700
                "
              >
                Remove
              </button>
            </div>

            <div
              className="
                mt-4
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-2
              "
            >
              <div>
                <label
                  htmlFor={`medications.${index}.userMedicationId`}
                  className="
                    block
                    text-sm
                    font-medium
                    text-foreground
                  "
                >
                  Medication
                </label>

                <select
                  id={`medications.${index}.userMedicationId`}
                  {...register(
                    `medications.${index}.userMedicationId`,
                  )}
                  className="
                    mt-1
                    block
                    w-full
                    rounded-md
                    border
                    border-gray-300
                    bg-card
                    px-3
                    py-2
                    text-sm
                    outline-none
                    focus:border-gray-500
                    focus:ring-1
                    focus:ring-gray-500
                  "
                >
                  <option value="">
                    Select a medication
                  </option>

                  {medications.map(
                    (medication) => (
                      <option
                        key={medication.id}
                        value={medication.id}
                      >
                        {medication.medication.name}
                      </option>
                    ),
                  )}
                </select>

                {formErrors.medications?.[
                  index
                ]?.userMedicationId && (
                  <p className="mt-1 text-sm text-red-600">
                    {
                      formErrors.medications[
                        index
                      ]?.userMedicationId
                        ?.message
                    }
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor={`medications.${index}.quantity`}
                  className="
                    block
                    text-sm
                    font-medium
                    text-foreground
                  "
                >
                  Quantity
                </label>

                <Input
                  id={`medications.${index}.quantity`}
                  type="number"
                  min="0"
                  step="any"
                  placeholder="e.g. 2"
                  {...register(
                    `medications.${index}.quantity`,
                  )}
                 
                />

                {formErrors.medications?.[
                  index
                ]?.quantity && (
                  <p className="mt-1 text-sm text-red-600">
                    {
                      formErrors.medications[
                        index
                      ]?.quantity
                        ?.message
                    }
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor={`medications.${index}.unit`}
                  className="
                    block
                    text-sm
                    font-medium
                    text-foreground
                  "
                >
                  Unit
                </label>

                <select
                  id={`medications.${index}.unit`}
                  
                  
                  {...register(
                    `medications.${index}.unit`,
                  )}
                  className="
                    mt-1
                    block
                    w-full
                    rounded-md
                    border
                    border-gray-300
                    bg-card
                    px-3
                    py-2
                    text-sm
                    outline-none
                    focus:border-gray-500
                    focus:ring-1
                    focus:ring-gray-500
                  "
                >
                  <option value="">Select a unit</option>
                   {MEDICATION_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                  
                </select>

                {formErrors.medications?.[
                  index
                ]?.unit && (
                  <p className="mt-1 text-sm text-red-600">
                    {
                      formErrors.medications[
                        index
                      ]?.unit
                        ?.message
                    }
                  </p>
                )}
              </div>

              <div
                className="
                  flex
                  items-center
                  gap-3
                  pt-6
                "
              >
                <Input
                  id={`medications.${index}.taken`}
                  type="checkbox"
                  {...register(
                    `medications.${index}.taken`,
                  )}
                  className="h-4 w-4 rounded"
                />

                <label
                  htmlFor={`medications.${index}.taken`}
                  className="
                    text-sm
                    font-medium
                    text-foreground
                  "
                >
                  Medication was taken
                </label>
              </div>
            </div>

            <div className="mt-4">
              <label
                htmlFor={`medications.${index}.takenAt`}
                className="
                  block
                  text-sm
                  font-medium
                  text-foreground
                "
              >
                Taken at
              </label>

              <Input
                id={`medications.${index}.takenAt`}
                type="time"
                {...register(
                  `medications.${index}.takenAt`,
                )}
                
              />
              {formErrors.medications?.[
                index
              ]?.takenAt && (
                <p className="mt-1 text-sm text-red-600">
                  {
                    formErrors.medications[
                      index
                    ]?.takenAt
                      ?.message
                  }
                </p>
              )}
            </div>

            <div className="mt-4">
              <label
                htmlFor={`medications.${index}.notes`}
                className="
                  block
                  text-sm
                  font-medium
                  text-foreground
                "
              >
                Notes
              </label>

              <textarea
                id={`medications.${index}.notes`}
                rows={3}
                placeholder="Optional notes..."
                {...register(
                  `medications.${index}.notes`,
                )}
                className="
                  mt-1
                  block
                  w-full
                  resize-y
                  rounded-md
                  border
                  border-gray-300
                  bg-card
                  px-3
                  py-2
                  text-sm
                  outline-none
                  focus:border-gray-500
                  focus:ring-1
                  focus:ring-gray-500
                "
              />

              {formErrors.medications?.[
                index
              ]?.notes && (
                <p className="mt-1 text-sm text-red-600">
                  {
                    formErrors.medications[
                      index
                    ]?.notes
                      ?.message
                  }
                </p>
              )}
            </div>
          </div>
        ),
      )}
    </div>
  </section>

  {/* ================================================== */}
  {/* CONDITIONS                                         */}
  {/* ================================================== */}

  <section
    className="
      space-y-5
      border-t
      pt-8
    "
  >
    <div
      className="
        flex
        items-center
        justify-between
        gap-4
      "
    >
      <div>
        <h2
          className="
            text-lg
            font-semibold
            text-foreground
          "
        >
          Conditions
        </h2>

        <p
          className="
            mt-1
            text-sm
            text-muted-foreground
          "
        >
          Record the status of your conditions today.
        </p>
      </div>

      <button
        type="button"
        onClick={handleAddCondition}
        disabled={
          isLoadingConditions ||
          Boolean(
            conditionsErrorMessage,
          )
        }
        className="
          rounded-md
          border
          px-3
          py-2
          text-sm
          font-medium
          text-foreground
          transition
          hover:bg-muted
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        Add condition
      </button>
    </div>

    {isLoadingConditions && (
      <p className="text-sm text-muted-foreground">
        Loading conditions...
      </p>
    )}

    {conditionsErrorMessage && (
      <p
        role="alert"
        className="text-sm text-red-600"
      >
        {conditionsErrorMessage}
      </p>
    )}

    {!isLoadingConditions &&
      !conditionsErrorMessage &&
      conditionFields.length === 0 && (
        <div
          className="
            rounded-md
            border
            border-dashed
            p-5
            text-center
            text-sm
            text-muted-foreground
          "
        >
          No conditions added.
        </div>
      )}

    <div className="space-y-4">
      {conditionFields.map(
        (field, index) => (
          <div
            key={field.id}
            className="
              rounded-lg
              border
              bg-muted
              p-4
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                gap-4
              "
            >
              <h3 className="font-medium text-foreground">
                Condition {index + 1}
              </h3>

              <button
                type="button"
                onClick={() =>
                  removeCondition(index)
                }
                className="
                  text-sm
                  font-medium
                  text-red-600
                  hover:text-red-700
                "
              >
                Remove
              </button>
            </div>

            <div
              className="
                mt-4
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-2
              "
            >
              <div>
                <label
                  htmlFor={`conditions.${index}.userConditionId`}
                  className="
                    block
                    text-sm
                    font-medium
                    text-foreground
                  "
                >
                  Condition
                </label>

                <select
                  id={`conditions.${index}.userConditionId`}
                  {...register(
                    `conditions.${index}.userConditionId`,
                  )}
                  className="
                    mt-1
                    block
                    w-full
                    rounded-md
                    border
                    border-gray-300
                    bg-card
                    px-3
                    py-2
                    text-sm
                    outline-none
                    focus:border-gray-500
                    focus:ring-1
                    focus:ring-gray-500
                  "
                >
                  <option value="">
                    Select a condition
                  </option>

                  {conditions.map(
                    (condition) => (
                      <option
                        key={condition.id}
                        value={condition.id}
                      >
                        {condition.condition.name}
                      </option>
                    ),
                  )}
                </select>

                {formErrors.conditions?.[
                  index
                ]?.userConditionId && (
                  <p className="mt-1 text-sm text-red-600">
                    {
                      formErrors.conditions[
                        index
                      ]?.userConditionId
                        ?.message
                    }
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor={`conditions.${index}.status`}
                  className="
                    block
                    text-sm
                    font-medium
                    text-foreground
                  "
                >
                  Status
                </label>

                <select
                  id={`conditions.${index}.status`}
                  {...register(
                    `conditions.${index}.status`,
                  )}
                  className="
                    mt-1
                    block
                    w-full
                    rounded-md
                    border
                    border-gray-300
                    bg-card
                    px-3
                    py-2
                    text-sm
                    outline-none
                    focus:border-gray-500
                    focus:ring-1
                    focus:ring-gray-500
                  "
                >
                  <option value="active">
                    Active
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>

                  <option value="resolved">
                    Resolved
                  </option>
                </select>

                {formErrors.conditions?.[
                  index
                ]?.status && (
                  <p className="mt-1 text-sm text-red-600">
                    {
                      formErrors.conditions[
                        index
                      ]?.status
                        ?.message
                    }
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label
                htmlFor={`conditions.${index}.notes`}
                className="
                  block
                  text-sm
                  font-medium
                  text-foreground
                "
              >
                Notes
              </label>

              <textarea
                id={`conditions.${index}.notes`}
                rows={3}
                placeholder="Optional notes..."
                {...register(
                  `conditions.${index}.notes`,
                )}
                className="
                  mt-1
                  block
                  w-full
                  resize-y
                  rounded-md
                  border
                  border-gray-300
                  bg-card
                  px-3
                  py-2
                  text-sm
                  outline-none
                  focus:border-gray-500
                  focus:ring-1
                  focus:ring-gray-500
                "
              />

              {formErrors.conditions?.[
                index
              ]?.notes && (
                <p className="mt-1 text-sm text-red-600">
                  {
                    formErrors.conditions[
                      index
                    ]?.notes
                      ?.message
                  }
                </p>
              )}
            </div>
          </div>
        ),
      )}
    </div>
  </section>

  {/* ================================================== */}
  {/* DOCTOR VISITS                                      */}
  {/* ================================================== */}

  <section
    className="
      space-y-5
      border-t
      pt-8
    "
  >
    <div
      className="
        flex
        items-center
        justify-between
        gap-4
      "
    >
      <div>
        <h2
          className="
            text-lg
            font-semibold
            text-foreground
          "
        >
          Doctor visits
        </h2>

        <p
          className="
            mt-1
            text-sm
            text-muted-foreground
          "
        >
          Add any doctor visits related to today.
        </p>
      </div>

      <button
        type="button"
        onClick={handleAddDoctorVisit}
        disabled={
          isLoadingDoctors ||
          isLoadingClinics ||
          Boolean(
            doctorsErrorMessage,
          ) ||
          Boolean(
            clinicsErrorMessage,
          )
        }
        className="
          rounded-md
          border
          px-3
          py-2
          text-sm
          font-medium
          text-foreground
          transition
          hover:bg-muted
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        Add doctor visit
      </button>
    </div>

    {isLoadingDoctors ||
    isLoadingClinics ? (
      <p className="text-sm text-muted-foreground">
        Loading doctors and clinics...
      </p>
    ) : null}

    {doctorsErrorMessage && (
      <p
        role="alert"
        className="text-sm text-red-600"
      >
        {doctorsErrorMessage}
      </p>
    )}

    {clinicsErrorMessage && (
      <p
        role="alert"
        className="text-sm text-red-600"
      >
        {clinicsErrorMessage}
      </p>
    )}

    {!isLoadingDoctors &&
      !isLoadingClinics &&
      !doctorsErrorMessage &&
      !clinicsErrorMessage &&
      doctorVisitFields.length === 0 && (
        <div
          className="
            rounded-md
            border
            border-dashed
            p-5
            text-center
            text-sm
            text-muted-foreground
          "
        >
          No doctor visits added.
        </div>
      )}

    <div className="space-y-4">
      {doctorVisitFields.map(
        (field, index) => (
          <div
            key={field.id}
            className="
              rounded-lg
              border
              bg-muted
              p-4
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                gap-4
              "
            >
              <h3 className="font-medium text-foreground">
                Doctor visit {index + 1}
              </h3>

              <button
                type="button"
                onClick={() =>
                  removeDoctorVisit(index)
                }
                className="
                  text-sm
                  font-medium
                  text-red-600
                  hover:text-red-700
                "
              >
                Remove
              </button>
            </div>

            <div
              className="
                mt-4
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-2
              "
            >
              <div>
                <label
                  htmlFor={`doctorVisits.${index}.userDoctorId`}
                  className="
                    block
                    text-sm
                    font-medium
                    text-foreground
                  "
                >
                  Doctor
                </label>

                <select
                  id={`doctorVisits.${index}.userDoctorId`}
                  {...register(
                    `doctorVisits.${index}.userDoctorId`,
                  )}
                  className="
                    mt-1
                    block
                    w-full
                    rounded-md
                    border
                    border-gray-300
                    bg-card
                    px-3
                    py-2
                    text-sm
                    outline-none
                    focus:border-gray-500
                    focus:ring-1
                    focus:ring-gray-500
                  "
                >
                  <option value="">
                    Select a doctor
                  </option>

                  {doctors.map(
                    (doctor) => (
                      <option
                        key={doctor.id}
                        value={doctor.id}
                      >
                        {doctor.doctor.name}
                      </option>
                    ),
                  )}
                </select>

                {formErrors.doctorVisits?.[
                  index
                ]?.userDoctorId && (
                  <p className="mt-1 text-sm text-red-600">
                    {
                      formErrors.doctorVisits[
                        index
                      ]?.userDoctorId
                        ?.message
                    }
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor={`doctorVisits.${index}.userClinicId`}
                  className="
                    block
                    text-sm
                    font-medium
                    text-foreground
                  "
                >
                  Clinic
                </label>

                <select
                  id={`doctorVisits.${index}.userClinicId`}
                  {...register(
                    `doctorVisits.${index}.userClinicId`,
                  )}
                  className="
                    mt-1
                    block
                    w-full
                    rounded-md
                    border
                    border-gray-300
                    bg-card
                    px-3
                    py-2
                    text-sm
                    outline-none
                    focus:border-gray-500
                    focus:ring-1
                    focus:ring-gray-500
                  "
                >
                  <option value="">
                    Select a clinic
                  </option>

                  {clinics.map(
                    (clinic) => (
                      <option
                        key={clinic.id}
                        value={clinic.id}
                      >
                        {clinic.clinic.name}
                      </option>
                    ),
                  )}
                </select>

                {formErrors.doctorVisits?.[
                  index
                ]?.userClinicId && (
                  <p className="mt-1 text-sm text-red-600">
                    {
                      formErrors.doctorVisits[
                        index
                      ]?.userClinicId
                        ?.message
                    }
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label
                htmlFor={`doctorVisits.${index}.summary`}
                className="
                  block
                  text-sm
                  font-medium
                  text-foreground
                "
              >
                Summary
              </label>

              <textarea
                id={`doctorVisits.${index}.summary`}
                rows={4}
                placeholder="Describe the reason for or result of the visit..."
                {...register(
                  `doctorVisits.${index}.summary`,
                )}
                className="
                  mt-1
                  block
                  w-full
                  resize-y
                  rounded-md
                  border
                  border-gray-300
                  bg-card
                  px-3
                  py-2
                  text-sm
                  outline-none
                  focus:border-gray-500
                  focus:ring-1
                  focus:ring-gray-500
                "
              />

              {formErrors.doctorVisits?.[
                index
              ]?.summary && (
                <p className="mt-1 text-sm text-red-600">
                  {
                    formErrors.doctorVisits[
                      index
                    ]?.summary
                      ?.message
                  }
                </p>
              )}
            </div>

            <div className="mt-4">
              <label
                htmlFor={`doctorVisits.${index}.notes`}
                className="
                  block
                  text-sm
                  font-medium
                  text-foreground
                "
              >
                Notes
              </label>

              <textarea
                id={`doctorVisits.${index}.notes`}
                rows={3}
                placeholder="Optional notes..."
                {...register(
                  `doctorVisits.${index}.notes`,
                )}
                className="
                  mt-1
                  block
                  w-full
                  resize-y
                  rounded-md
                  border
                  border-gray-300
                  bg-card
                  px-3
                  py-2
                  text-sm
                  outline-none
                  focus:border-gray-500
                  focus:ring-1
                  focus:ring-gray-500
                "
              />

              {formErrors.doctorVisits?.[
                index
              ]?.notes && (
                <p className="mt-1 text-sm text-red-600">
                  {
                    formErrors.doctorVisits[
                      index
                    ]?.notes
                      ?.message
                  }
                </p>
              )}
            </div>
          </div>
        ),
      )}
    </div>
  </section>

  {/* ================================================== */}
  {/* FORM ACTIONS                                       */}
  {/* ================================================== */}

  <div
    className="
      flex
      flex-col-reverse
      gap-3
      border-t
      pt-6
      sm:flex-row
      sm:justify-end
    "
  >
    <button
      type="button"
      onClick={cancelForm}
      disabled={isFormBusy}
      className="
        rounded-md
        border
        border-gray-300
        px-4
        py-2
        text-sm
        font-medium
        text-foreground
        transition
        hover:bg-muted
        disabled:cursor-not-allowed
        disabled:opacity-50
      "
    >
      Cancel
    </button>

    <button
      type="submit"
      disabled={isFormBusy}
      className="
        rounded-md
        bg-gray-900
        px-4
        py-2
        text-sm
        font-medium
        text-white
        transition
        hover:bg-gray-800
        disabled:cursor-not-allowed
        disabled:opacity-50
      "
    >
      {isFormBusy
        ? isCreateMode
          ? "Submitting..."
          : "Updating..."
        : isCreateMode
          ? "Submit entry"
          : isEditMode
            ? "Update entry"
            : "Save entry"}
    </button>
  </div>
</form>


);
}
