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
} from "react-hook-form";
import {
  useCatalogMedicationSearch,
  useCreateProfileMedication,
  useEnsureCatalogMedication,
  useOnlineMedicationSearch,
  useProfileMedications,
  useRemoveProfileMedication,
  useUpdateProfileMedication,
} from "../hooks/health/useMedications";
import {
  emptyMedicationFormValues,
  medicationFormSchema,
  toMedicationFormValues,
  toMedicationSubmitPayload,
  type Medication,
  type MedicationFormSubmitPayload,
  type MedicationFormValues,
  type UserMedication,
} from "../lib/health/health-export";
import type { Pagination } from "../lib/api/types";

export const MEDICATIONS_PAGE_SIZE = 15;
export const MEDICATIONS_GRID_COLUMNS = 3;
export const MEDICATIONS_GRID_ROWS = 5;

const AUTOCOMPLETE_DEBOUNCE_MS = 300;
const AUTOCOMPLETE_MIN_CHARS = 2;
const ONLINE_WHEN_CATALOG_BELOW = 5;

export type MedicationPanelState =
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "detail"; medication: UserMedication }
  | { kind: "edit"; medication: UserMedication };

export type MedicationSelection =
  | { source: "catalog"; medication: Medication }
  | { source: "online"; name: string };

interface MedicationsContextValue {
  medications: UserMedication[];
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

  panel: MedicationPanelState;
  panelOpen: boolean;
  panelTitle: string | undefined;
  selectedId: string | null;
  formMode: "create" | "edit" | null;

  formError: string | null;
  isFormBusy: boolean;
  isRemoving: boolean;

  register: UseFormRegister<MedicationFormValues>;
  watch: UseFormWatch<MedicationFormValues>;
  setValue: UseFormSetValue<MedicationFormValues>;
  formErrors: FieldErrors<MedicationFormValues>;
  handleFormSubmit: UseFormHandleSubmit<MedicationFormValues>;
  nameQuery: string;

  catalogResults: Medication[];
  onlineResults: string[];
  isAutocompleteLoading: boolean;
  isAutocompleteFetched: boolean;

  openCreate: () => void;
  openDetail: (medication: UserMedication) => void;
  openEdit: (medication: UserMedication) => void;
  closePanel: () => void;
  cancelForm: () => void;

  onNameQueryChange: (value: string) => void;
  selectMedication: (selection: MedicationSelection) => void;
  submitForm: (values: MedicationFormValues) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

const MedicationsContext = createContext<MedicationsContextValue | null>(null);

function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { error?: string } | undefined;
    if (data?.error) return data.error;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

function useDebouncedValue(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function MedicationsProvider({ children }: { children: ReactNode }) {
  const [panel, setPanel] = useState<MedicationPanelState>({ kind: "closed" });
  const [formError, setFormError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const listQuery = useProfileMedications({
    currentPage,
    pageSize: MEDICATIONS_PAGE_SIZE,
  });
  const ensureCatalog = useEnsureCatalogMedication();
  const createProfile = useCreateProfileMedication();
  const updateProfile = useUpdateProfileMedication();
  const removeProfile = useRemoveProfileMedication();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors: formErrors },
  } = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationFormSchema),
    defaultValues: emptyMedicationFormValues(),
  });

  const nameQuery = watch("nameQuery") ?? "";
  const formMode =
    panel.kind === "create" || panel.kind === "edit" ? panel.kind : null;
  const autocompleteActive = formMode === "create";
  const debouncedSearch = useDebouncedValue(
    autocompleteActive ? nameQuery : "",
    AUTOCOMPLETE_DEBOUNCE_MS,
  );

  const catalogQuery = useCatalogMedicationSearch(debouncedSearch);
  const catalogResults = autocompleteActive
    ? (catalogQuery.data?.data ?? [])
    : [];
  const shouldSearchOnline =
    autocompleteActive &&
    debouncedSearch.trim().length >= AUTOCOMPLETE_MIN_CHARS &&
    !catalogQuery.isFetching &&
    catalogResults.length < ONLINE_WHEN_CATALOG_BELOW;

  const onlineQuery = useOnlineMedicationSearch(
    debouncedSearch,
    shouldSearchOnline,
  );

  const catalogNames = new Set(
    catalogResults.map((m) => m.name.toLocaleLowerCase()),
  );
  const onlineResults = (onlineQuery.data ?? []).filter(
    (name) => !catalogNames.has(name.toLocaleLowerCase()),
  );

  const isAutocompleteLoading =
    (debouncedSearch.trim().length >= AUTOCOMPLETE_MIN_CHARS &&
      catalogQuery.isFetching) ||
    (shouldSearchOnline && onlineQuery.isFetching);

  useEffect(() => {
    if (panel.kind === "create") {
      reset(emptyMedicationFormValues());
      setFormError(null);
    } else if (panel.kind === "edit") {
      reset(toMedicationFormValues(panel.medication));
      setFormError(null);
    }
  }, [panel, reset]);

  const medications = listQuery.data?.data ?? [];
  const pagination = listQuery.data?.pagination ?? null;

  useEffect(() => {
    if (!pagination) return;
    if (pagination.totalPages === 0) {
      if (currentPage !== 1) setCurrentPage(1);
      return;
    }
    if (currentPage > pagination.totalPages) {
      setCurrentPage(pagination.totalPages);
    }
  }, [pagination, currentPage]);

  const isFormBusy =
    ensureCatalog.isPending ||
    createProfile.isPending ||
    updateProfile.isPending;

  const panelOpen = panel.kind !== "closed";
  const selectedId =
    panel.kind === "detail" || panel.kind === "edit"
      ? panel.medication.id
      : null;
  const panelTitle =
    panel.kind === "create"
      ? "Add medication"
      : panel.kind === "edit"
        ? "Edit medication"
        : panel.kind === "detail"
          ? panel.medication.medication.name
          : undefined;

  function openCreate() {
    setFormError(null);
    setPanel({ kind: "create" });
  }

  function openDetail(medication: UserMedication) {
    setFormError(null);
    setPanel({ kind: "detail", medication });
  }

  function openEdit(medication: UserMedication) {
    setFormError(null);
    setPanel({ kind: "edit", medication });
  }

  function closePanel() {
    setPanel({ kind: "closed" });
    setFormError(null);
  }

  function cancelForm() {
    if (panel.kind === "edit") {
      openDetail(panel.medication);
      return;
    }
    closePanel();
  }

  function goToPage(page: number) {
    const totalPages = pagination?.totalPages ?? 1;
    const next = Math.min(Math.max(1, page), Math.max(1, totalPages));
    setCurrentPage(next);
  }

  function goToNextPage() {
    if (!pagination) return;
    if (currentPage < pagination.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }

  function goToPrevPage() {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }

  function onNameQueryChange(value: string) {
    setValue("nameQuery", value, { shouldValidate: true });
    setValue("medicationId", undefined);
    setValue("onlineName", undefined);
  }

  function selectMedication(selection: MedicationSelection) {
    if (selection.source === "catalog") {
      setValue("nameQuery", selection.medication.name, {
        shouldValidate: true,
      });
      setValue("medicationId", selection.medication.id, {
        shouldValidate: true,
      });
      setValue("onlineName", undefined);
      return;
    }

    setValue("nameQuery", selection.name, { shouldValidate: true });
    setValue("medicationId", undefined);
    setValue("onlineName", selection.name, { shouldValidate: true });
  }

  async function resolveMedicationId(
    payload: MedicationFormSubmitPayload,
  ): Promise<string> {
    if (payload.medicationId) return payload.medicationId;
    if (!payload.onlineName) {
      throw new Error("Select a medication from the suggestions");
    }
    const catalog = await ensureCatalog.mutateAsync(payload.onlineName);
    return catalog.id;
  }

  async function submitForm(values: MedicationFormValues) {
    const payload = toMedicationSubmitPayload(values);

    try {
      setFormError(null);

      if (panel.kind === "create") {
        const medicationId = await resolveMedicationId(payload);
        await createProfile.mutateAsync({
          medicationId,
          dosage: payload.dosage,
          dosageMeasurement: payload.dosageMeasurement,
          frequency: payload.frequency,
          notes: payload.notes,
        });
        setCurrentPage(1);
        closePanel();
        return;
      }

      if (panel.kind === "edit") {
        await updateProfile.mutateAsync({
          id: panel.medication.id,
          body: {
            dosage: payload.dosage,
            dosageMeasurement: payload.dosageMeasurement,
            frequency: payload.frequency,
            notes: payload.notes,
          },
        });
        closePanel();
      }
    } catch (error) {
      setFormError(
        getErrorMessage(
          error,
          panel.kind === "edit"
            ? "Failed to update medication"
            : "Failed to add medication",
        ),
      );
    }
  }

  async function remove(id: string) {
    try {
      setListError(null);
      await removeProfile.mutateAsync(id);
      closePanel();
    } catch (error) {
      setListError(getErrorMessage(error, "Failed to remove medication"));
    }
  }

  const value = useMemo<MedicationsContextValue>(
    () => ({
      medications,
      isLoading: listQuery.isLoading,
      isError: listQuery.isError,
      isSuccess: listQuery.isSuccess,
      listErrorMessage:
        listError ??
        (listQuery.isError
          ? getErrorMessage(listQuery.error, "Failed to load medications")
          : null),

      pagination,
      currentPage,
      pageSize: MEDICATIONS_PAGE_SIZE,
      goToPage,
      goToNextPage,
      goToPrevPage,

      panel,
      panelOpen,
      panelTitle,
      selectedId,
      formMode,

      formError,
      isFormBusy,
      isRemoving: removeProfile.isPending,

      register,
      watch,
      setValue,
      formErrors,
      handleFormSubmit: handleSubmit,
      nameQuery,

      catalogResults,
      onlineResults,
      isAutocompleteLoading,
      isAutocompleteFetched: catalogQuery.isFetched,

      openCreate,
      openDetail,
      openEdit,
      closePanel,
      cancelForm,

      onNameQueryChange,
      selectMedication,
      submitForm,
      remove,
    }),
    [
      medications,
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
      formError,
      isFormBusy,
      removeProfile.isPending,
      register,
      watch,
      setValue,
      formErrors,
      handleSubmit,
      nameQuery,
      catalogResults,
      onlineResults,
      isAutocompleteLoading,
      catalogQuery.isFetched,
    ],
  );

  return (
    <MedicationsContext.Provider value={value}>
      {children}
    </MedicationsContext.Provider>
  );
}

export function useMedicationsContext(): MedicationsContextValue {
  const ctx = useContext(MedicationsContext);
  if (!ctx)
    throw new Error(
      "useMedicationsContext must be used within <MedicationsProvider>",
    );
  return ctx;
}
