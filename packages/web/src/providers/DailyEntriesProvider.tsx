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

import {
  emptyDailyEntryFormValues,
  dailyEntryFormSchema,
  toDailyEntryFormValues,
  toCreateDailyEntryRequest,
  toUpdateDailyEntryRequest,
  toDailyEntrySubmitPayload,
  type DailyEntry,
  type DailyEntryFormValues,
} from "../lib/daily-entries/daily-entries-exports";
import type { Pagination } from "../lib/api/types";

import { useAuth } from "../hooks/useAuth";

export const DAILY_ENTRIES_PAGE_SIZE = 15;

export type DailyEntryPanelState =
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "detail"; entry: DailyEntry }
  | { kind: "edit"; entry: DailyEntry };

interface DailyEntriesContextValue {
  entries: DailyEntry[];

  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;

  listErrorMessage: string | null;

  pagination: Pagination | null;
  currentPage: number;
  pageSize: number;

  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPrevPage: () => void;

  fromDate: string | undefined;
  toDate: string | undefined;
  isInvalidDateRange: boolean;

  setFromDate: (date: string | undefined) => void;
  setToDate: (date: string | undefined) => void;
  clearDateFilters: () => void;

  selectedEntry: DailyEntry | null;
  isDetailLoading: boolean;
  detailErrorMessage: string | null;

  panel: DailyEntryPanelState;
  panelOpen: boolean;
  panelTitle: string | undefined;
  selectedId: string | null;
  formMode: "create" | "edit" | null;

  control: Control<DailyEntryFormValues>;
  register: UseFormRegister<DailyEntryFormValues>;
  watch: UseFormWatch<DailyEntryFormValues>;
  setValue: UseFormSetValue<DailyEntryFormValues>;
  formErrors: FieldErrors<DailyEntryFormValues>;
  handleFormSubmit: UseFormHandleSubmit<DailyEntryFormValues>;

  formError: string | null;
  isFormBusy: boolean;
  isRemoving: boolean;

  symptoms: UserSymptom[];
  medications: UserMedication[];
  conditions: UserCondition[];
  doctors: UserDoctor[];
  clinics: UserClinic[];

  isLoadingSymptoms: boolean;
  isLoadingMedications: boolean;
  isLoadingConditions: boolean;
  isLoadingDoctors: boolean;
  isLoadingClinics: boolean;

  symptomsErrorMessage: string | null;
  medicationsErrorMessage: string | null;
  conditionsErrorMessage: string | null;
  doctorsErrorMessage: string | null;
  clinicsErrorMessage: string | null;

  openCreate: () => void;
  openDetail: (entry: DailyEntry) => void;
  openEdit: (entry: DailyEntry) => void;
  closePanel: () => void;
  cancelForm: () => void;

  submitForm: (values: DailyEntryFormValues) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

const DailyEntriesContext =
  createContext<DailyEntriesContextValue | null>(null);

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

  const listQuery = useDailyEntries(
    user?.id,{
    currentPage,
    pageSize: DAILY_ENTRIES_PAGE_SIZE,
    fromDate,
    toDate,
  },
    !isInvalidDateRange,);

  const detailEntryId =
    panel.kind === "detail" || panel.kind === "edit"
      ? panel.entry.id
      : undefined;

  const detailQuery =
    useDailyEntry(detailEntryId);

  const createEntry =
    useCreateDailyEntry();

  const updateEntry =
    useUpdateDailyEntry();

  const removeEntry =
    useRemoveDailyEntry();

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

  const entries =
    listQuery.data?.data ?? [];

  const pagination =
    listQuery.data?.pagination ?? null;

  const selectedEntry =
    detailQuery.data ??
    (
      panel.kind === "detail" ||
      panel.kind === "edit"
        ? panel.entry
        : null
    );

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

  const formMode =
    panel.kind === "create" ||
    panel.kind === "edit"
      ? panel.kind
      : null;

  useEffect(() => {
    if (panel.kind === "create") {
      reset(
        emptyDailyEntryFormValues(),
      );

      setFormError(null);

      return;
    }

    if (panel.kind === "edit") {
      if (detailQuery.data) {
        reset(
          toDailyEntryFormValues(
            detailQuery.data,
          ),
        );
      } else {
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

  const isFormBusy =
    createEntry.isPending ||
    updateEntry.isPending;

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

  const value =
    useMemo<DailyEntriesContextValue>(
      () => ({
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
        pagination,

        currentPage,

        pageSize:
          DAILY_ENTRIES_PAGE_SIZE,

        goToPage,

        goToNextPage,

        goToPrevPage,
        fromDate,

        toDate,
        isInvalidDateRange,

        setFromDate:
          handleSetFromDate,

        setToDate:
          handleSetToDate,

        clearDateFilters,

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

        panel,

        panelOpen,

        panelTitle,

        selectedId,

        formMode,

        control,
        register,

        watch,

        setValue,

        formErrors,

        handleFormSubmit:
          handleSubmit,
        formError,

        isFormBusy,

        isRemoving:
          removeEntry.isPending,

        symptoms,

        medications,

        conditions,

        doctors,

        clinics,

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

        openCreate,

        openDetail,

        openEdit,

        closePanel,

        cancelForm,

        submitForm,
        remove,
      }),
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