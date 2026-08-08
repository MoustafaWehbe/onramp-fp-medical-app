import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { isAxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  type FieldErrors,
  type UseFormHandleSubmit,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch,
  type Control,
} from "react-hook-form";

import {
  useDailyEntries,
  useDailyEntry,
  useCreateDailyEntry,
  useRemoveDailyEntry,
  useUpdateDailyEntry,
} from "../hooks/useDailyEntries";

import {
  useProfileSymptoms,
} from "../hooks/health/useSymptoms";

import {
  useProfileMedications,
} from "../hooks/health/useMedications";

import {
  useProfileConditions,
} from "../hooks/health/useConditions";

import {
  useProfileDoctors,
} from "../hooks/health/useDoctors";

import {
  useProfileClinics,
} from "../hooks/health/useClinics";

import type {
  UserSymptom,
  UserMedication,
  UserCondition,
  UserDoctor,
  UserClinic,
} from "../lib/health/health-export";

import type {
  DailyEntry,
} from "../lib/daily-entries/daily-entries-exports";
import type { Pagination } from "../lib/api/types";

import {
  emptyDailyEntryFormValues,
  dailyEntryFormSchema,
  toDailyEntryFormValues,
  toCreateDailyEntryRequest,
  toUpdateDailyEntryRequest,
  toDailyEntrySubmitPayload,
  type DailyEntryFormValues,
} from "../lib/daily-entries/daily-entries-exports";

import { useAuth } from "../hooks/useAuth";

/**
 * Number of entries displayed per page.
 */
export const DAILY_ENTRIES_PAGE_SIZE = 15;

/**
 * Defines the state of the daily-entry side panel.
 */
export type DailyEntryPanelState =
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "detail"; entry: DailyEntry }
  | { kind: "edit"; entry: DailyEntry };

interface DailyEntriesContextValue {
  /**
   * Daily entry list.
   */
  entries: DailyEntry[];

  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;

  listErrorMessage: string | null;

  /**
   * Pagination.
   */
  pagination: Pagination | null;
  currentPage: number;
  pageSize: number;

  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPrevPage: () => void;

  /**
   * Date filters.
   */
  fromDate: string | undefined;
  toDate: string | undefined;
  isInvalidDateRange: boolean;

  setFromDate: (date: string | undefined) => void;
  setToDate: (date: string | undefined) => void;
  clearDateFilters: () => void;

  /**
   * Currently selected daily-entry detail.
   */
  selectedEntry: DailyEntry | null;
  isDetailLoading: boolean;
  detailErrorMessage: string | null;

  /**
   * Panel state.
   */
  panel: DailyEntryPanelState;
  panelOpen: boolean;
  panelTitle: string | undefined;
  selectedId: string | null;
  formMode: "create" | "edit" | null;

  /**
   * Form.
   */
  control: Control<DailyEntryFormValues>;
  register: UseFormRegister<DailyEntryFormValues>;
  watch: UseFormWatch<DailyEntryFormValues>;
  setValue: UseFormSetValue<DailyEntryFormValues>;
  formErrors: FieldErrors<DailyEntryFormValues>;
  handleFormSubmit: UseFormHandleSubmit<DailyEntryFormValues>;

  /**
   * Form state.
   */
  formError: string | null;
  isFormBusy: boolean;
  isRemoving: boolean;

  /**
   * User profile resources used by
   * daily-entry dropdowns.
   *
   * All resources are already sorted
   * alphabetically by display name.
   */
  symptoms: UserSymptom[];
  medications: UserMedication[];
  conditions: UserCondition[];
  doctors: UserDoctor[];
  clinics: UserClinic[];

  /**
   * Dropdown loading states.
   */
  isLoadingSymptoms: boolean;
  isLoadingMedications: boolean;
  isLoadingConditions: boolean;
  isLoadingDoctors: boolean;
  isLoadingClinics: boolean;

  /**
   * Dropdown errors.
   */
  symptomsErrorMessage: string | null;
  medicationsErrorMessage: string | null;
  conditionsErrorMessage: string | null;
  doctorsErrorMessage: string | null;
  clinicsErrorMessage: string | null;

  /**
   * Panel actions.
   */
  openCreate: () => void;
  openDetail: (entry: DailyEntry) => void;
  openEdit: (entry: DailyEntry) => void;
  closePanel: () => void;
  cancelForm: () => void;

  /**
   * Daily-entry actions.
   */
  submitForm: (values: DailyEntryFormValues) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

const DailyEntriesContext =
  createContext<DailyEntriesContextValue | null>(null);

/**
 * Extracts a useful error message from Axios/API errors.
 */
function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { error?: string }
      | undefined;

    if (data?.error) {
      return data.error;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

/**
 * Sorts an array alphabetically.
 */
function sortAlphabetically<T>(
  items: T[],
  getName: (item: T) => string,
): T[] {
  return [...items].sort((a, b) =>
    getName(a).localeCompare(getName(b), undefined, {
      sensitivity: "base",
    }),
  );
}

export function DailyEntriesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useAuth();
  const [panel, setPanel] =
    useState<DailyEntryPanelState>({
      kind: "closed",
    });

  const [formError, setFormError] =
    useState<string | null>(null);

  const [listError, setListError] =
    useState<string | null>(null);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [fromDate, setFromDate] =
    useState<string | undefined>(undefined);

  const [toDate, setToDate] =
    useState<string | undefined>(undefined);

    const isInvalidDateRange =
  Boolean(
    fromDate &&
    toDate &&
    fromDate > toDate,
  );
  /**
   * ----------------------------------------------------
   * Daily-entry queries
   * ----------------------------------------------------
   */

  const listQuery = useDailyEntries(
    user?.id,{
    currentPage,
    pageSize: DAILY_ENTRIES_PAGE_SIZE,
    fromDate,
    toDate,
  },
    !isInvalidDateRange,);

  /**
   * The detail query is enabled only when
   * a detail/edit panel has an entry selected.
   */
  const detailEntryId =
    panel.kind === "detail" || panel.kind === "edit"
      ? panel.entry.id
      : undefined;

  const detailQuery =
    useDailyEntry(detailEntryId);

  /**
   * ----------------------------------------------------
   * Daily-entry mutations
   * ----------------------------------------------------
   */

  const createEntry =
    useCreateDailyEntry();

  const updateEntry =
    useUpdateDailyEntry();

  const removeEntry =
    useRemoveDailyEntry();

  /**
   * ----------------------------------------------------
   * Profile resources for dropdowns
   * ----------------------------------------------------
   *
   * We intentionally request 100 records here.
   *
   * The dropdown is expected to contain the user's
   * saved profile resources, not just the first 15.
   */

  const symptomsQuery =
    useProfileSymptoms({
      currentPage: 1,
      pageSize: 100,
    });

  const medicationsQuery =
    useProfileMedications({
      currentPage: 1,
      pageSize: 100,
    });

  const conditionsQuery =
    useProfileConditions({
      currentPage: 1,
      pageSize: 100,
    });

  const doctorsQuery =
    useProfileDoctors({
      currentPage: 1,
      pageSize: 100,
    });

  const clinicsQuery =
    useProfileClinics({
      currentPage: 1,
      pageSize: 100,
    });

  /**
   * ----------------------------------------------------
   * React Hook Form
   * ----------------------------------------------------
   */

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: {
      errors: formErrors,
      
    },
  } = useForm<DailyEntryFormValues>({
    
    resolver: zodResolver(
      dailyEntryFormSchema,
    ),
    defaultValues:
      emptyDailyEntryFormValues(),
    
  });

  /**
   * ----------------------------------------------------
   * List data
   * ----------------------------------------------------
   */

  const entries =
    listQuery.data?.data ?? [];

  const pagination =
    listQuery.data?.pagination ?? null;

  /**
   * ----------------------------------------------------
   * Detail data
   * ----------------------------------------------------
   *
   * Prefer the detail endpoint result when
   * available because it is the source of truth
   * for the complete entry.
   */

  const selectedEntry =
    detailQuery.data ??
    (
      panel.kind === "detail" ||
      panel.kind === "edit"
        ? panel.entry
        : null
    );

  /**
   * ----------------------------------------------------
   * Alphabetically sorted dropdown resources
   * ----------------------------------------------------
   */

  const symptoms = useMemo(
    () =>
      sortAlphabetically<UserSymptom>(
        (symptomsQuery.data?.data as UserSymptom[]) ?? [],
        (symptom) =>
          symptom.catalog.name,
      ),
    [symptomsQuery.data?.data],
  );

  const medications = useMemo(
    () =>
      sortAlphabetically<UserMedication>(
        (medicationsQuery.data?.data as UserMedication[]) ?? [],
        (medication) =>
          medication.medication.name,
      ),
    [medicationsQuery.data?.data],
  );

  const conditions = useMemo(
    () =>
      sortAlphabetically<UserCondition>(
        (conditionsQuery.data?.data as UserCondition[]) ?? [],
        (condition) => condition.condition.name,
      ),
    [conditionsQuery.data?.data],
  );

  const doctors = useMemo(
    () =>
      sortAlphabetically<UserDoctor>(
        doctorsQuery.data?.data ?? [],
        (doctor) =>
          doctor.doctor.name,
      ),
    [doctorsQuery.data?.data],
  );

  const clinics = useMemo(
    () =>
      sortAlphabetically<UserClinic>(
        clinicsQuery.data?.data ?? [],
        (clinic) =>
          clinic.clinic.name,
      ),
    [clinicsQuery.data?.data],
  );

  /**
   * ----------------------------------------------------
   * Form mode
   * ----------------------------------------------------
   */

  const formMode =
    panel.kind === "create" ||
    panel.kind === "edit"
      ? panel.kind
      : null;

  /**
   * ----------------------------------------------------
   * Reset form when panel changes
   * ----------------------------------------------------
   */

  useEffect(() => {
    if (panel.kind === "create") {
      reset(
        emptyDailyEntryFormValues(),
      );

      setFormError(null);

      return;
    }

    if (panel.kind === "edit") {
      /**
       * If detail data is already loaded,
       * use it to populate the form.
       */
      if (detailQuery.data) {
        reset(
          toDailyEntryFormValues(
            detailQuery.data,
          ),
        );
      } else {
        /**
         * Fallback to the entry from the list
         * while detail data is loading.
         */
        reset(
          toDailyEntryFormValues(
            panel.entry,
          ),
        );
      }

      setFormError(null);
    }
  }, [
    panel,
    detailQuery.data,
    reset,
  ]);

  /**
   * ----------------------------------------------------
   * Keep current page valid
   * ----------------------------------------------------
   */

  useEffect(() => {
    if (!pagination) {
      return;
    }

    if (pagination.totalPages === 0) {
      if (currentPage !== 1) {
        setCurrentPage(1);
      }

      return;
    }

    if (
      currentPage >
      pagination.totalPages
    ) {
      setCurrentPage(
        pagination.totalPages,
      );
    }
  }, [
    pagination,
    currentPage,
  ]);

  /**
   * ----------------------------------------------------
   * Busy states
   * ----------------------------------------------------
   */

  const isFormBusy =
    createEntry.isPending ||
    updateEntry.isPending;

  /**
   * ----------------------------------------------------
   * Panel information
   * ----------------------------------------------------
   */

  const panelOpen =
    panel.kind !== "closed";

  const selectedId =
    panel.kind === "detail" ||
    panel.kind === "edit"
      ? panel.entry.id
      : null;

  const panelTitle =
    panel.kind === "create"
      ? "Add daily entry"
      : panel.kind === "edit"
        ? "Edit daily entry"
        : panel.kind === "detail"
          ? `Entry - ${panel.entry.entryDate}`
          : undefined;

  /**
   * ----------------------------------------------------
   * Pagination actions
   * ----------------------------------------------------
   */

  function goToPage(
    page: number,
  ) {
    const totalPages =
      pagination?.totalPages ?? 1;

    const nextPage = Math.min(
      Math.max(1, page),
      Math.max(1, totalPages),
    );

    setCurrentPage(nextPage);
  }

  function goToNextPage() {
    if (!pagination) {
      return;
    }

    if (
      currentPage <
      pagination.totalPages
    ) {
      setCurrentPage(
        currentPage + 1,
      );
    }
  }

  function goToPrevPage() {
    if (currentPage > 1) {
      setCurrentPage(
        currentPage - 1,
      );
    }
  }

  /**
   * ----------------------------------------------------
   * Date filter actions
   * ----------------------------------------------------
   */

  function handleSetFromDate(
    date: string | undefined,
  ) {
    setFromDate(date);
    setCurrentPage(1);
    setListError(null);
  }

  function handleSetToDate(
    date: string | undefined,
  ) {
    setToDate(date);
    setCurrentPage(1);
    setListError(null);
  }

  function clearDateFilters() {
    setFromDate(undefined);
    setToDate(undefined);
    setCurrentPage(1);
    setListError(null);
  }

  /**
   * ----------------------------------------------------
   * Panel actions
   * ----------------------------------------------------
   */

  function openCreate() {
    setFormError(null);

    setPanel({
      kind: "create",
    });
  }

  function openDetail(
    entry: DailyEntry,
  ) {
    setFormError(null);

    setPanel({
      kind: "detail",
      entry,
    });
  }

  function openEdit(
    entry: DailyEntry,
  ) {
    setFormError(null);

    setPanel({
      kind: "edit",
      entry,
    });
  }

  function closePanel() {
    setPanel({
      kind: "closed",
    });

    setFormError(null);
  }

  function cancelForm() {
    if (panel.kind === "edit") {
      openDetail(
        panel.entry,
      );

      return;
    }

    closePanel();
  }


  /**
   * create and update
  **/

 function getTodayDate(): string {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(
    today.getMonth() + 1,
  ).padStart(2, "0");
  const day = String(
    today.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

async function submitForm(
  values: DailyEntryFormValues,
) {
  try {
    setFormError(null);

    const payload = toDailyEntrySubmitPayload(values);

    if (panel.kind === "create") {
      const request =
        toCreateDailyEntryRequest(payload);

      await createEntry.mutateAsync(
        request,
      );

      setCurrentPage(1);

      closePanel();

      return;
    }

    if (panel.kind === "edit") {
      const request =
        toUpdateDailyEntryRequest(payload);

      await updateEntry.mutateAsync({
        id: panel.entry.id,
        body: request,
      });

      closePanel();
    }
  } catch (error) {
    setFormError(
      getErrorMessage(
        error,
        panel.kind === "edit"
          ? "Failed to update daily entry"
          : "Failed to create daily entry",
      ),
    );
  }
}

  /**
   * ----------------------------------------------------
   * Delete
   * ----------------------------------------------------
   */

  async function remove(
    id: string,
  ) {
    try {
      setListError(null);
      setFormError(null);

      await removeEntry.mutateAsync(
        id,
      );

      closePanel();
    } catch (error) {
      setFormError(
        getErrorMessage(
          error,
          "Failed to delete daily entry",
        ),
      );
    }
  }

  /**
   * ----------------------------------------------------
   * Context value
   * ----------------------------------------------------
   */

  const value =
    useMemo<DailyEntriesContextValue>(
      () => ({
        /**
         * List
         */
        entries,

        isLoading:
          listQuery.isLoading,

        isError:
          listQuery.isError,

        isSuccess:
          listQuery.isSuccess,

        listErrorMessage:
          listError ??
          (
            listQuery.isError
              ? getErrorMessage(
                  listQuery.error,
                  "Failed to load daily entries",
                )
              : null
          ),

        /**
         * Pagination
         */
        pagination,

        currentPage,

        pageSize:
          DAILY_ENTRIES_PAGE_SIZE,

        goToPage,

        goToNextPage,

        goToPrevPage,

        /**
         * Date filters
         */
        fromDate,

        toDate,
        isInvalidDateRange,

        setFromDate:
          handleSetFromDate,

        setToDate:
          handleSetToDate,

        clearDateFilters,

        /**
         * Detail
         */
        selectedEntry,

        isDetailLoading:
          detailQuery.isLoading,

        detailErrorMessage:
          detailQuery.isError
            ? getErrorMessage(
                detailQuery.error,
                "Failed to load daily entry",
              )
            : null,

        /**
         * Panel
         */
        panel,

        panelOpen,

        panelTitle,

        selectedId,

        formMode,

        /**
         * Form
         */
        control,
        register,

        watch,

        setValue,

        formErrors,

        handleFormSubmit:
          handleSubmit,

        /**
         * Form state
         */
        formError,

        isFormBusy,

        isRemoving:
          removeEntry.isPending,

        /**
         * Dropdown data
         */
        symptoms,

        medications,

        conditions,

        doctors,

        clinics,

        /**
         * Dropdown loading
         */
        isLoadingSymptoms:
          symptomsQuery.isLoading,

        isLoadingMedications:
          medicationsQuery.isLoading,

        isLoadingConditions:
          conditionsQuery.isLoading,

        isLoadingDoctors:
          doctorsQuery.isLoading,

        isLoadingClinics:
          clinicsQuery.isLoading,

        /**
         * Dropdown errors
         */
        symptomsErrorMessage:
          symptomsQuery.isError
            ? getErrorMessage(
                symptomsQuery.error,
                "Failed to load symptoms",
              )
            : null,

        medicationsErrorMessage:
          medicationsQuery.isError
            ? getErrorMessage(
                medicationsQuery.error,
                "Failed to load medications",
              )
            : null,

        conditionsErrorMessage:
          conditionsQuery.isError
            ? getErrorMessage(
                conditionsQuery.error,
                "Failed to load conditions",
              )
            : null,

        doctorsErrorMessage:
          doctorsQuery.isError
            ? getErrorMessage(
                doctorsQuery.error,
                "Failed to load doctors",
              )
            : null,

        clinicsErrorMessage:
          clinicsQuery.isError
            ? getErrorMessage(
                clinicsQuery.error,
                "Failed to load clinics",
              )
            : null,

        /**
         * Panel actions
         */
        openCreate,

        openDetail,

        openEdit,

        closePanel,

        cancelForm,

        /**
         * Form actions
         */
        submitForm,

        /**
         * Delete
         */
        remove,
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [
        entries,

        listQuery.isLoading,
        listQuery.isError,
        listQuery.isSuccess,
        listQuery.error,

        listError,

        pagination,

        currentPage,

        fromDate,
        toDate,

        selectedEntry,

        detailQuery.isLoading,
        detailQuery.isError,
        detailQuery.error,

        panel,

        panelOpen,

        panelTitle,

        selectedId,

        formMode,

        register,
        watch,
        setValue,
        formErrors,
        handleSubmit,

        formError,

        isFormBusy,

        removeEntry.isPending,

        symptoms,
        medications,
        conditions,
        doctors,
        clinics,

        symptomsQuery.isLoading,
        medicationsQuery.isLoading,
        conditionsQuery.isLoading,
        doctorsQuery.isLoading,
        clinicsQuery.isLoading,

        symptomsQuery.isError,
        medicationsQuery.isError,
        conditionsQuery.isError,
        doctorsQuery.isError,
        clinicsQuery.isError,

        symptomsQuery.error,
        medicationsQuery.error,
        conditionsQuery.error,
        doctorsQuery.error,
        clinicsQuery.error,
      ],
    );

  return (
    <DailyEntriesContext.Provider
      value={value}
    >
      {children}
    </DailyEntriesContext.Provider>
  );
}

/**
 * Access the DailyEntriesProvider context.
 */
export function useDailyEntriesContext(): DailyEntriesContextValue {
  const context =
    useContext(
      DailyEntriesContext,
    );

  if (!context) {
    throw new Error(
      "useDailyEntriesContext must be used within <DailyEntriesProvider>",
    );
  }

  return context;
}