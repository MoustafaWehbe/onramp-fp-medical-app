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
  type UseFormReset,
  type UseFormSetValue,
  type UseFormWatch,
} from "react-hook-form";

import {
  useDailyEntries,
  useDailyEntry,
  useCreateDailyEntry,
  useUpdateDailyEntry,
  useRemoveDailyEntry,
} from "../hooks/daily-entries/useDailyEntries";

import {
  useProfileMedications,
} from "../hooks/health/useMedications";

import {
  useProfileSymptoms,
} from "../hooks/health/useSymptoms";

import {
  useProfileConditions,
} from "../hooks/health/useConditions";

import {
  useProfileDoctorVisits,
} from "../hooks/health/useDoctorVisits";

import type {
  DailyEntry,
  CreateDailyEntryRequest,
  UpdateDailyEntryRequest,
} from "../lib/daily-entries/daily-entries-exports";

import type {
  Medication,
  UserMedication,
} from "../lib/health/health-export";

import type {
  Pagination,
} from "../lib/api/types";

// Adjust these imports to your actual daily-entry form exports.
import {
  dailyEntryFormSchema,
  emptyDailyEntryFormValues,
  toDailyEntryFormValues,
  toDailyEntrySubmitPayload,
  type DailyEntryFormValues,
  type DailyEntryFormSubmitPayload,
} from "../lib/daily-entries/daily-entry-form";

// -----------------------------------------------------
// Constants
// -----------------------------------------------------

export const DAILY_ENTRIES_PAGE_SIZE = 15;

// -----------------------------------------------------
// Panel state
// -----------------------------------------------------

export type DailyEntryPanelState =
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "detail"; entry: DailyEntry }
  | { kind: "edit"; entry: DailyEntry };

// -----------------------------------------------------
// Context type
// -----------------------------------------------------

interface DailyEntriesContextValue {
  // -----------------------------
  // Daily entries list
  // -----------------------------

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

  // -----------------------------
  // Selected daily entry
  // -----------------------------

  selectedEntry: DailyEntry | null;

  detailEntry: DailyEntry | undefined;
  isDetailLoading: boolean;

  // -----------------------------
  // Panel
  // -----------------------------

  panel: DailyEntryPanelState;

  panelOpen: boolean;

  panelTitle: string | undefined;

  selectedId: string | null;

  formMode: "create" | "edit" | null;

  // -----------------------------
  // Form
  // -----------------------------

  register: UseFormRegister<DailyEntryFormValues>;

  watch: UseFormWatch<DailyEntryFormValues>;

  setValue: UseFormSetValue<DailyEntryFormValues>;

  reset: UseFormReset<DailyEntryFormValues>;

  formErrors: FieldErrors<DailyEntryFormValues>;

  handleFormSubmit: UseFormHandleSubmit<DailyEntryFormValues>;

  // -----------------------------
  // Profile data
  // -----------------------------

  medications: UserMedication[];

  symptoms: UserSymptom[];

  conditions: UserCondition[];

  doctorVisits: UserDoctorVisit[];

  // -----------------------------
  // Form state
  // -----------------------------

  formError: string | null;

  isFormBusy: boolean;

  isRemoving: boolean;

  // -----------------------------
  // Actions
  // -----------------------------

  openCreate: () => void;

  openDetail: (entry: DailyEntry) => void;

  openEdit: (entry: DailyEntry) => void;

  closePanel: () => void;

  cancelForm: () => void;

  submitForm: (
    values: DailyEntryFormValues,
  ) => Promise<void>;

  remove: (id: string) => Promise<void>;
}

// -----------------------------------------------------
// Context
// -----------------------------------------------------

const DailyEntriesContext =
  createContext<DailyEntriesContextValue | null>(null);

// -----------------------------------------------------
// Helpers
// -----------------------------------------------------

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

// -----------------------------------------------------
// Provider
// -----------------------------------------------------

export function DailyEntriesProvider({
  children,
}: {
  children: ReactNode;
}) {
  // -----------------------------------------------
  // Panel state
  // -----------------------------------------------

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

  // -----------------------------------------------
  // Daily entry hooks
  // -----------------------------------------------

  const listQuery = useDailyEntries({
    currentPage,
    pageSize: DAILY_ENTRIES_PAGE_SIZE,
  });

  const detailQuery = useDailyEntry(
    panel.kind === "detail" || panel.kind === "edit"
      ? panel.entry.id
      : undefined,
  );

  const createDailyEntry =
    useCreateDailyEntry();

  const updateDailyEntry =
    useUpdateDailyEntry();

  const removeDailyEntry =
    useRemoveDailyEntry();

  // -----------------------------------------------
  // Profile hooks
  //
  // These are assumed to already exist.
  // -----------------------------------------------

  const medicationsQuery =
    useProfileMedications({
      currentPage: 1,
      pageSize: 100,
    });

  const symptomsQuery =
    useProfileSymptoms({
      currentPage: 1,
      pageSize: 100,
    });

  const conditionsQuery =
    useProfileConditions({
      currentPage: 1,
      pageSize: 100,
    });

  const doctorVisitsQuery =
    useProfileDoctorVisits({
      currentPage: 1,
      pageSize: 100,
    });

  // -----------------------------------------------
  // React Hook Form
  // -----------------------------------------------

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
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

  // -----------------------------------------------
  // Derived data
  // -----------------------------------------------

  const entries =
    listQuery.data?.data ?? [];

  const pagination =
    listQuery.data?.pagination ?? null;

  const selectedEntry =
    panel.kind === "detail" ||
    panel.kind === "edit"
      ? panel.entry
      : null;

  const detailEntry =
    detailQuery.data;

  const formMode =
    panel.kind === "create" ||
    panel.kind === "edit"
      ? panel.kind
      : null;

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
          ? "Daily entry details"
          : undefined;

  // -----------------------------------------------
  // Profile data
  // -----------------------------------------------

  const medications =
    medicationsQuery.data?.data ?? [];

  const symptoms =
    symptomsQuery.data?.data ?? [];

  const conditions =
    conditionsQuery.data?.data ?? [];

  const doctorVisits =
    doctorVisitsQuery.data?.data ?? [];

  // -----------------------------------------------
  // Reset form when panel changes
  // -----------------------------------------------

  useEffect(() => {
    if (panel.kind === "create") {
      reset(
        emptyDailyEntryFormValues(),
      );

      setFormError(null);

      return;
    }

    if (panel.kind === "edit") {
      reset(
        toDailyEntryFormValues(
          panel.entry,
        ),
      );

      setFormError(null);
    }
  }, [panel, reset]);

  // -----------------------------------------------
  // Keep current page valid
  // -----------------------------------------------

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

  // -----------------------------------------------
  // Busy states
  // -----------------------------------------------

  const isFormBusy =
    createDailyEntry.isPending ||
    updateDailyEntry.isPending;

  // -----------------------------------------------
  // Panel actions
  // -----------------------------------------------

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

  // -----------------------------------------------
  // Pagination
  // -----------------------------------------------

  function goToPage(
    page: number,
  ) {
    const totalPages =
      pagination?.totalPages ?? 1;

    const nextPage = Math.min(
      Math.max(1, page),
      Math.max(1, totalPages),
    );

    setCurrentPage(
      nextPage,
    );
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

  // -----------------------------------------------
  // Submit form
  // -----------------------------------------------

  async function submitForm(
    values: DailyEntryFormValues,
  ) {
    try {
      setFormError(null);

      const payload =
        toDailyEntrySubmitPayload(
          values,
        );

      if (panel.kind === "create") {
        await createDailyEntry.mutateAsync(
          payload as CreateDailyEntryRequest,
        );

        setCurrentPage(1);

        closePanel();

        return;
      }

      if (panel.kind === "edit") {
        await updateDailyEntry.mutateAsync(
          {
            id: panel.entry.id,

            body:
              payload as UpdateDailyEntryRequest,
          },
        );

        closePanel();
      }
    } catch (error) {
      setFormError(
        getErrorMessage(
          error,
          panel.kind === "edit"
            ? "Failed to update daily entry"
            : "Failed to add daily entry",
        ),
      );
    }
  }

  // -----------------------------------------------
  // Remove
  // -----------------------------------------------

  async function remove(
    id: string,
  ) {
    try {
      setListError(null);

      await removeDailyEntry.mutateAsync(
        id,
      );

      closePanel();
    } catch (error) {
      setListError(
        getErrorMessage(
          error,
          "Failed to remove daily entry",
        ),
      );
    }
  }

  // -----------------------------------------------
  // Context value
  // -----------------------------------------------

  const value =
    useMemo<DailyEntriesContextValue>(
      () => ({
        // Daily entries
        entries,

        isLoading:
          listQuery.isLoading,

        isError:
          listQuery.isError,

        isSuccess:
          listQuery.isSuccess,

        listErrorMessage:
          listError ??
          (listQuery.isError
            ? getErrorMessage(
                listQuery.error,
                "Failed to load daily entries",
              )
            : null),

        pagination,

        currentPage,

        pageSize:
          DAILY_ENTRIES_PAGE_SIZE,

        goToPage,

        goToNextPage,

        goToPrevPage,

        // Selected entry
        selectedEntry,

        detailEntry,

        isDetailLoading:
          detailQuery.isLoading,

        // Panel
        panel,

        panelOpen,

        panelTitle,

        selectedId,

        formMode,

        // Form
        register,

        watch,

        setValue,

        reset,

        formErrors,

        handleFormSubmit:
          handleSubmit,

        // Profile data
        medications,

        symptoms,

        conditions,

        doctorVisits,

        // Form state
        formError,

        isFormBusy,

        isRemoving:
          removeDailyEntry.isPending,

        // Actions
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

        panel,

        panelOpen,

        panelTitle,

        selectedId,

        formMode,

        selectedEntry,

        detailEntry,

        detailQuery.isLoading,

        register,
        watch,
        setValue,
        reset,
        formErrors,
        handleSubmit,

        medications,
        symptoms,
        conditions,
        doctorVisits,

        formError,

        isFormBusy,

        removeDailyEntry.isPending,
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

// -----------------------------------------------------
// Context hook
// -----------------------------------------------------

export function useDailyEntriesContext(): DailyEntriesContextValue {
  const ctx =
    useContext(
      DailyEntriesContext,
    );

  if (!ctx) {
    throw new Error(
      "useDailyEntriesContext must be used within <DailyEntriesProvider>",
    );
  }

  return ctx;
}