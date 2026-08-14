import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
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
  useCatalogClinicSearch,
  useCreateProfileClinic,
  useEnsureClinicCatalog,
  useProfileClinics,
  useRemoveProfileClinic,
  useUpdateProfileClinic,
} from "../hooks/health/useClinics";
import {
  emptyClinicFormValues,
  clinicFormSchema,
  toClinicFormValues,
  toClinicSubmitPayload,
  type Clinic,
  type ClinicFormSubmitPayload,
  type ClinicFormValues,
  type UserClinic,
} from "../lib/health/health-export";
import type { Pagination } from "../lib/api/types";

export const CLINICS_PAGE_SIZE = 15;

const AUTOCOMPLETE_DEBOUNCE_MS = 300;
const AUTOCOMPLETE_MIN_CHARS = 2;

export type ClinicPanelState =
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "detail"; clinic: UserClinic }
  | { kind: "edit"; clinic: UserClinic };

export type ClinicSelection = { source: "catalog"; clinic: Clinic };

interface ClinicsContextValue {
  clinics: UserClinic[];
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

  panel: ClinicPanelState;
  panelOpen: boolean;
  panelTitle: string | undefined;
  selectedId: string | null;
  formMode: "create" | "edit" | null;

  formError: string | null;
  isFormBusy: boolean;
  isRemoving: boolean;

  register: UseFormRegister<ClinicFormValues>;
  watch: UseFormWatch<ClinicFormValues>;
  setValue: UseFormSetValue<ClinicFormValues>;
  formErrors: FieldErrors<ClinicFormValues>;
  handleFormSubmit: UseFormHandleSubmit<ClinicFormValues>;
  nameQuery: string;

  catalogResults: Clinic[];
  isAutocompleteLoading: boolean;

  openCreate: () => void;
  openDetail: (clinic: UserClinic) => void;
  openEdit: (clinic: UserClinic) => void;
  closePanel: () => void;
  cancelForm: () => void;

  onNameQueryChange: (value: string) => void;
  selectClinic: (selection: ClinicSelection) => void;
  submitForm: (values: ClinicFormValues) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

const ClinicsContext = createContext<ClinicsContextValue | null>(null);

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

interface ClinicsProviderProps {
  children: ReactNode;
  onActivate?: () => void;
  panelCloseRef?: MutableRefObject<(() => void) | null>;
}

export function ClinicsProvider({
  children,
  onActivate,
  panelCloseRef,
}: ClinicsProviderProps) {
  const [panel, setPanel] = useState<ClinicPanelState>({ kind: "closed" });
  const [formError, setFormError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const listQuery = useProfileClinics({
    currentPage,
    pageSize: CLINICS_PAGE_SIZE,
  });
  const ensureCatalog = useEnsureClinicCatalog();
  const createProfile = useCreateProfileClinic();
  const updateProfile = useUpdateProfileClinic();
  const removeProfile = useRemoveProfileClinic();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors: formErrors },
  } = useForm<ClinicFormValues>({
    resolver: zodResolver(clinicFormSchema),
    defaultValues: emptyClinicFormValues(),
  });

  const nameQuery = watch("nameQuery") ?? "";
  const formMode =
    panel.kind === "create" || panel.kind === "edit" ? panel.kind : null;
  const autocompleteActive = formMode === "create";
  const debouncedSearch = useDebouncedValue(
    autocompleteActive ? nameQuery : "",
    AUTOCOMPLETE_DEBOUNCE_MS,
  );

  const catalogQuery = useCatalogClinicSearch(debouncedSearch);
  const catalogResults = autocompleteActive
    ? (catalogQuery.data?.data ?? [])
    : [];

  const isAutocompleteLoading =
    debouncedSearch.trim().length >= AUTOCOMPLETE_MIN_CHARS &&
    catalogQuery.isFetching;

  useEffect(() => {
    if (panel.kind === "create") {
      reset(emptyClinicFormValues());
      setFormError(null);
    } else if (panel.kind === "edit") {
      reset(toClinicFormValues(panel.clinic));
      setFormError(null);
    }
  }, [panel, reset]);

  const clinics = listQuery.data?.data ?? [];
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
      ? panel.clinic.id
      : null;
  const panelTitle =
    panel.kind === "create"
      ? "Add clinic"
      : panel.kind === "edit"
        ? "Edit clinic"
        : panel.kind === "detail"
          ? panel.clinic.clinic.name
          : undefined;

  const closePanelRef = useRef<(() => void) | null>(null);

  function openCreate() {
    onActivate?.();
    setFormError(null);
    setPanel({ kind: "create" });
  }

  function openDetail(clinic: UserClinic) {
    onActivate?.();
    setFormError(null);
    setPanel({ kind: "detail", clinic });
  }

  function openEdit(clinic: UserClinic) {
    onActivate?.();
    setFormError(null);
    setPanel({ kind: "edit", clinic });
  }

  function closePanel() {
    setPanel({ kind: "closed" });
    setFormError(null);
  }

  useEffect(() => {
    closePanelRef.current = closePanel;
  });

  useEffect(() => {
    if (panelCloseRef) {
      panelCloseRef.current = () => closePanelRef.current?.();
    }
  });

  function cancelForm() {
    if (panel.kind === "edit") {
      openDetail(panel.clinic);
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
    if (formMode === "edit") return;
    setValue("nameQuery", value, { shouldValidate: true });
    setValue("clinicId", undefined);
  }

  function selectClinic(selection: ClinicSelection) {
    if (formMode === "edit") return;
    setValue("nameQuery", selection.clinic.name, {
      shouldValidate: true,
    });
    setValue("clinicId", selection.clinic.id, {
      shouldValidate: true,
    });
    setValue("address", "", { shouldValidate: true });
    setValue("phone", "", { shouldValidate: true });
  }

  async function resolveClinicId(
    payload: ClinicFormSubmitPayload,
  ): Promise<string> {
    if (payload.clinicId) return payload.clinicId;
    if (!payload.address?.trim() || !payload.phone?.trim()) {
      throw new Error(
        "Address and phone are required for new clinics",
      );
    }
    const catalog = await ensureCatalog.mutateAsync({
      name: nameQuery.trim(),
      address: payload.address.trim(),
      phone: payload.phone.trim(),
    });
    return catalog.id;
  }

  async function submitForm(values: ClinicFormValues) {
    const payload = toClinicSubmitPayload(values);

    try {
      setFormError(null);

      if (panel.kind === "create") {
        const clinicId = await resolveClinicId(payload);
        await createProfile.mutateAsync({
          clinicId,
          notes: payload.notes,
        });
        setCurrentPage(1);
        closePanel();
        return;
      }

      if (panel.kind === "edit") {
        await updateProfile.mutateAsync({
          id: panel.clinic.id,
          body: { notes: payload.notes ?? null },
        });
        closePanel();
      }
    } catch (error) {
      setFormError(
        getErrorMessage(
          error,
          panel.kind === "edit"
            ? "Failed to update clinic"
            : "Failed to add clinic",
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
      setListError(getErrorMessage(error, "Failed to remove clinic"));
    }
  }

  const value = useMemo<ClinicsContextValue>(
    () => ({
      clinics,
      isLoading: listQuery.isLoading,
      isError: listQuery.isError,
      isSuccess: listQuery.isSuccess,
      listErrorMessage:
        listError ??
        (listQuery.isError
          ? getErrorMessage(listQuery.error, "Failed to load clinics")
          : null),

      pagination,
      currentPage,
      pageSize: CLINICS_PAGE_SIZE,
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
      isAutocompleteLoading,

      openCreate,
      openDetail,
      openEdit,
      closePanel,
      cancelForm,

      onNameQueryChange,
      selectClinic,
      submitForm,
      remove,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      clinics,
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
      isAutocompleteLoading,
    ],
  );

  return (
    <ClinicsContext.Provider value={value}>
      {children}
    </ClinicsContext.Provider>
  );
}

export function useClinicsContext(): ClinicsContextValue {
  const ctx = useContext(ClinicsContext);
  if (!ctx)
    throw new Error(
      "useClinicsContext must be used within <ClinicsProvider>",
    );
  return ctx;
}
