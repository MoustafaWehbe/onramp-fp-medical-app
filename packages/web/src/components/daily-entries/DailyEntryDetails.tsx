import { useTranslation } from "react-i18next";
import type { DailyEntry } from "../../lib/daily-entries/daily-entries-exports";
import { formatEntryDate } from "../../lib/daily-entries/daily-entries-exports";

import type {
  UserSymptom,
  UserCondition,
  UserDoctor,
  UserMedication,
  UserClinic
} from "../../lib/health/health-export";


interface DailyEntryDetailsProps {
  entry: DailyEntry;
  symptoms: UserSymptom[];
  conditions: UserCondition[];
  medications: UserMedication[];
  doctors: UserDoctor[];
  clinics: UserClinic[];
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
  isRemoving?: boolean;
}

function displayValue(
  value: string | number | null | undefined,
  notRecordedText: string,
): string {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return notRecordedText;
  }

  return String(value);
}

export function DailyEntryDetails({
  entry,
  symptoms,
  conditions,
  doctors,
  clinics,
  medications,
  onEdit,
  onDelete,
  onClose,
  isRemoving = false,
}: DailyEntryDetailsProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "ar" ? "ar-EG" : "en-US";
  const notRecordedText = t("dailyEntries.notRecorded");

  function getSymptomName(userSymptomId: string) {
    const symptom = symptoms.find((item) => item.id === userSymptomId);
    return symptom?.catalog.name ?? t("dailyEntries.unknownSymptom");
  }

  function getConditionName(userConditionId: string) {
    const condition = conditions.find((item) => item.id === userConditionId);
    return condition?.condition.name ?? t("dailyEntries.unknownCondition");
  }

  function getMedicationName(userMedicationId: string) {
    const medication = medications.find((item) => item.id === userMedicationId);
    return medication?.medication.name ?? t("dailyEntries.unknownMedication");
  }

  function getDoctorName(userDoctorId: string) {
    const doctor = doctors.find((item) => item.id === userDoctorId);
    return doctor?.doctor.name ?? t("dailyEntries.unknownDoctor");
  }

  function getClinicName(userClinicId: string) {
    const clinic = clinics.find((item) => item.id === userClinicId);
    return clinic?.clinic.name ?? t("dailyEntries.unknownClinic");
  }

  return (
    <div className="space-y-8">
      {/* ================================================== */}
      {/* HEADER                                             */}
      {/* ================================================== */}

      <header
        className="
          flex
          flex-col
          gap-4
          border-b
          pb-6
          sm:flex-row
          sm:items-start
          sm:justify-between
        "
      >
        <div>
          <p
            className="
              text-sm
              font-medium
              text-muted-foreground
            "
          >
            {t("dailyEntries.dailyHealthEntry")}
          </p>

          <h2
            className="
              mt-1
              text-2xl
              font-semibold
              text-foreground
            "
          >
            {formatEntryDate(
              entry.entryDate,
              locale,
            )}
          </h2>
        </div>

        <div
          className="
            flex
            gap-3
          "
        >
          <button
            type="button"
            onClick={onEdit}
            disabled={isRemoving}
            className="
              rounded-md
              border
              border-border
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
            {t("dailyEntries.edit")}
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={isRemoving}
            className="
              rounded-md
              border
              border-red-200
              px-4
              py-2
              text-sm
              font-medium
              text-red-600
              transition
              hover:bg-red-50
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {isRemoving ? t("dailyEntries.deleting") : t("dailyEntries.delete")}
          </button>
        </div>
      </header>

      {/* ================================================== */}
      {/* BASIC DAILY INFORMATION                            */}
      {/* ================================================== */}

      <section className="space-y-5">
        <div>
          <h3
            className="
              text-lg
              font-semibold
              text-foreground
            "
          >
            {t("dailyEntries.dailyInformation")}
          </h3>

          <p
            className="
              mt-1
              text-sm
              text-muted-foreground
            "
          >
            {t("dailyEntries.dailyInformationDescription")}
          </p>
        </div>

        <div
          className="
            grid
            grid-cols-1
            gap-4
            sm:grid-cols-2
          "
        >
          {/* Mood */}

          <div
            className="
              rounded-lg
              border
              bg-muted
              p-4
            "
          >
            <p
              className="
                text-xs
                font-medium
                uppercase
                tracking-wide
                text-muted-foreground
              "
            >
              {t("dailyEntries.moodRating")}
            </p>

            <p
              className="
                mt-2
                text-xl
                font-semibold
                text-foreground
              "
            >
              {entry.moodRating !== null
                ? `${entry.moodRating} / 5`
                : notRecordedText}
            </p>
          </div>

          {/* Sleep */}

          <div
            className="
              rounded-lg
              border
              bg-muted
              p-4
            "
          >
            <p
              className="
                text-xs
                font-medium
                uppercase
                tracking-wide
                text-muted-foreground
              "
            >
              {t("dailyEntries.sleepHours")}
            </p>

            <p
              className="
                mt-2
                text-xl
                font-semibold
                text-foreground
              "
            >
              {entry.sleepHours !== null
                ? `${entry.sleepHours} hours`
                : notRecordedText}
            </p>
          </div>
        </div>

        {/* Journal */}

        <div
          className="
            rounded-lg
            border
            bg-card
            p-4
          "
        >
          <p
            className="
              text-xs
              font-medium
              uppercase
              tracking-wide
              text-muted-foreground
            "
          >
            {t("dailyEntries.journalNote")}
          </p>

          <p
            className="
              mt-2
              whitespace-pre-wrap
              text-sm
              leading-6
              text-foreground
            "
          >
            {entry.journalNotes?.trim()
              ? entry.journalNotes
              : t("dailyEntries.noAdditionalDetails")}
          </p>
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
        <div>
          <h3
            className="
              text-lg
              font-semibold
              text-foreground
            "
          >
            {t("dailyEntries.symptomPlural")}
          </h3>

          <p
            className="
              mt-1
              text-sm
              text-muted-foreground
            "
          >
            {t("dailyEntries.dailyInformationDescription")}
          </p>
        </div>

        {entry.symptoms.length === 0 ? (
          <EmptySectionMessage message="No symptoms recorded." />
        ) : (
          <div className="space-y-4">
            {entry.symptoms.map(
              (symptom, index) => (
                <div
                  key={
                    symptom.id ??
                    `symptom-${index}`
                  }
                  className="
                    rounded-lg
                    border
                   bg-card
                    p-4
                  "
                >
                  <div
                    className="
                      flex
                      flex-col
                      gap-3
                      sm:flex-row
                      sm:items-start
                      sm:justify-between
                    "
                  >
                    <div>
                      <p
                        className="
                          text-base
                          font-semibold
                          text-foreground
                        "
                      >
                        {getSymptomName(symptom.userSymptomId)}
                      </p>
                    </div>

                    <span
                      className="
                        inline-flex
                        w-fit
                        rounded-full
                       bg-muted
                        px-3
                        py-1
                        text-xs
                        font-medium
                        text-muted-foreground
                      "
                    >
                      {t("dailyEntries.moodRating")}: {" "}
                      {displayValue(
                        symptom.severity,
                        notRecordedText,
                      )}
                    </span>
                  </div>

                  <div className="mt-4">
                    <p
                      className="
                        text-xs
                        font-medium
                        uppercase
                        tracking-wide
                        text-muted-foreground
                      "
                    >
                      Notes
                    </p>

                    <p
                      className="
                        mt-1
                        whitespace-pre-wrap
                        text-sm
                        leading-6
                        text-foreground
                      "
                    >
                      {symptom.notes?.trim()
                        ? symptom.notes
                        : "No notes recorded."}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
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
        <div>
          <h3
            className="
              text-lg
              font-semibold
              text-foreground
            "
          >
            {t("navigation.medications")}
          </h3>

          <p
            className="
              mt-1
              text-sm
              text-muted-foreground
            "
          >
            Medications recorded for this daily entry.
          </p>
        </div>

        {entry.medications.length === 0 ? (
          <EmptySectionMessage message="No medications recorded." />
        ) : (
          <div className="space-y-4">
            {entry.medications.map(
              (medication, index) => (
                <div
                  key={
                    medication.id ??
                    `medication-${index}`
                  }
                  className="
                    rounded-lg
                    border
                   bg-card
                    p-4
                  "
                >
                  <div
                    className="
                      flex
                      flex-col
                      gap-3
                      sm:flex-row
                      sm:items-start
                      sm:justify-between
                    "
                  >
                    <div>
                      <p
                        className="
                          text-base
                          font-semibold
                          text-foreground
                        "
                      >
                        {getMedicationName(medication.userMedicationId,)}
                      </p>

                      <p
                        className="
                          mt-1
                          text-sm
                          text-muted-foreground
                        "
                      >
                        {t("health.medications.dosage")}: {" "}
                        {displayValue(
                          medication.quantity,
                          notRecordedText,
                        )}{" "}
                        {displayValue(
                          medication.unit,
                          notRecordedText,
                        )}
                      </p>
                    </div>

                    <span
                      className={`
                        inline-flex
                        w-fit
                        rounded-full
                        px-3
                        py-1
                        text-xs
                        font-medium
                        ${
                          medication.taken
                            ? "bg-green-500/10 text-green-500"
                            : "bg-muted text-muted-foreground"
                        }
                      `}
                    >
                      {medication.taken ? t("common.on") : t("common.off")}
                    </span>
                  </div>

                  {medication.takenAt && (
                    <div className="mt-4">
                      <p
                        className="
                          text-xs
                          font-medium
                          uppercase
                          tracking-wide
                          text-muted-foreground
                        "
                      >
                        {t("dailyEntries.view")}
                      </p>

                      <p
                        className="
                          mt-1
                          text-sm
                          text-foreground
                        "
                      >
                        {formatDateTime(
                          medication.takenAt,
                        )}
                      </p>
                    </div>
                  )}

                  <div className="mt-4">
                    <p
                      className="
                        text-xs
                        font-medium
                        uppercase
                        tracking-wide
                        text-muted-foreground
                      "
                    >
                      Notes
                    </p>

                    <p
                      className="
                        mt-1
                        whitespace-pre-wrap
                        text-sm
                        leading-6
                        text-foreground
                      "
                    >
                      {medication.notes?.trim()
                        ? medication.notes
                        : "No notes recorded."}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
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
        <div>
          <h3
            className="
              text-lg
              font-semibold
              text-foreground
            "
          >
            {t("navigation.health")}
          </h3>

          <p
            className="
              mt-1
              text-sm
              text-muted-foreground
            "
          >
            Health conditions and their status for
            this entry.
          </p>
        </div>

        {entry.conditions.length === 0 ? (
          <EmptySectionMessage message="No conditions recorded." />
        ) : (
          <div className="space-y-4">
            {entry.conditions.map(
              (condition, index) => (
                <div
                  key={
                    condition.id ??
                    `condition-${index}`
                  }
                  className="
                    rounded-lg
                    border
                    bg-card
                    p-4
                  "
                >
                  <div
                    className="
                      flex
                      flex-col
                      gap-3
                      sm:flex-row
                      sm:items-start
                      sm:justify-between
                    "
                  >
                    <p
                      className="
                        text-base
                        font-semibold
                        text-foreground
                      "
                    >
                      {getConditionName(condition.userConditionId)}
                    </p>

                    <span
                      className="
                        inline-flex
                        w-fit
                        rounded-full
                        bg-muted
                        px-3
                        py-1
                        text-xs
                        font-medium
                        capitalize
                        text-muted-foreground
                      "
                    >
                      {displayValue(
                        condition.status,
                        notRecordedText,
                      )}
                    </span>
                  </div>

                  <div className="mt-4">
                    <p
                      className="
                        text-xs
                        font-medium
                        uppercase
                        tracking-wide
                        text-muted-foreground
                      "
                    >
                      Notes
                    </p>

                    <p
                      className="
                        mt-1
                        whitespace-pre-wrap
                        text-sm
                        leading-6
                        text-foreground
                      "
                    >
                      {condition.notes?.trim()
                        ? condition.notes
                        : "No notes recorded."}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
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
        <div>
          <h3
            className="
              text-lg
              font-semibold
              text-foreground
            "
          >
            {t("navigation.doctorVisits")}
          </h3>

          <p
            className="
              mt-1
              text-sm
              text-muted-foreground
            "
          >
            Doctor visits associated with this entry.
          </p>
        </div>

        {entry.doctorVisits.length === 0 ? (
          <EmptySectionMessage message="No doctor visits recorded." />
        ) : (
          <div className="space-y-4">
            {entry.doctorVisits.map(
              (visit, index) => (
                <div
                  key={
                    visit.id ??
                    `doctor-visit-${index}`
                  }
                  className="
                    rounded-lg
                    border
                    bg-card
                    p-4
                  "
                >
                  <div
                    className="
                      grid
                      grid-cols-1
                      gap-4
                      sm:grid-cols-2
                    "
                  >
                    <DetailField
                      label="Doctor"
                      value={
                        getDoctorName(visit.userDoctorId)
                      }
                    />

                    <DetailField
                      label="Clinic"
                      value={
                        getClinicName(visit.userClinicId)
                      }
                    />
                  </div>

                  <div className="mt-4">
                    <DetailField
                      label="Summary"
                      value={
                        visit.summary?.trim()
                          ? visit.summary
                          : "No summary recorded."
                      }
                    />
                  </div>

                  <div className="mt-4">
                    <DetailField
                      label="Notes"
                      value={
                        visit.notes?.trim()
                          ? visit.notes
                          : "No notes recorded."
                      }
                    />
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </section>

      {/* ================================================== */}
      {/* FOOTER ACTIONS                                     */}
      {/* ================================================== */}

      <footer
        className="
          flex
          flex-col-reverse
          gap-3
          border-t
          pt-6
          sm:flex-row
          sm:justify-between
        "
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isRemoving}
          className="
            rounded-md
            border
           border-border
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
          {t("common.close")}
        </button>

        <div
          className="
            flex
            flex-col
            gap-3
            sm:flex-row
          "
        >
          <button
            type="button"
            onClick={onDelete}
            disabled={isRemoving}
            className="
              rounded-md
              border
              border-red-500/30
              px-4
              py-2
              text-sm
              font-medium
              text-red-500
              transition
              hover:bg-red-500/10
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {isRemoving ? t("dailyEntries.deleting") : t("dailyEntries.delete")}
          </button>

          <button
            type="button"
            onClick={onEdit}
            disabled={isRemoving}
            className="
              rounded-md
              bg-primary
              px-4
              py-2
              text-sm
              font-medium
              text-primary-foreground
              transition
              hover:bg-primary/90
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {t("dailyEntries.edit")}
          </button>
        </div>
      </footer>
    </div>
  );
}

function EmptySectionMessage({
  message,
}: {
  message: string;
}) {
  return (
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
      {message}
    </div>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p
        className="
          text-xs
          font-medium
          uppercase
          tracking-wide
          text-muted-foreground
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          whitespace-pre-wrap
          text-sm
          leading-6
          text-foreground
        "
      >
        {value}
      </p>
    </div>
  );
}

function formatDateTime(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);
}