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
  useCreateProfileSymptom,
  useEnsureSymptomCatalog,
  useOnlineSymptomSearch,
  useProfileSymptoms,
  useRemoveProfileSymptom,
  useSymptomCatalogSearch,
} from "../hooks/health/useSymptoms";
import {
  emptySymptomFormValues,
  symptomFormSchema,
  toSymptomSubmitPayload,
  type SymptomCatalog,
  type SymptomFormSubmitPayload,
  type SymptomFormValues,
  type UserSymptom,
} from "../lib/health/health-export";
import type { Pagination } from "../lib/api/types";

export const SYMPTOMS_PAGE_SIZE = 15;

const AUTOCOMPLETE_DEBOUNCE_MS = 300;
const AUTOCOMPLETE_MIN_CHARS = 2;
const ONLINE_WHEN_CATALOG_BELOW = 5;

export type SymptomPanelState =
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "detail"; symptom: UserSymptom };

export type SymptomSelection =
  | { source: "catalog"; symptom: SymptomCatalog }
  | { source: "online"; name: string };

interface SymptomsContextValue {
  symptoms: UserSymptom[];
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

  panel: SymptomPanelState;
  panelOpen: boolean;
  panelTitle: string | undefined;
  selectedId: string | null;
  formMode: "create" | null;

  formError: string | null;
  isFormBusy: boolean;
  isRemoving: boolean;

  register: UseFormRegister<SymptomFormValues>;
  watch: UseFormWatch<SymptomFormValues>;
  setValue: UseFormSetValue<SymptomFormValues>;
  formErrors: FieldErrors<SymptomFormValues>;
  handleFormSubmit: UseFormHandleSubmit<SymptomFormValues>;
  nameQuery: string;

  catalogResults: SymptomCatalog[];
  onlineResults: string[];
  isAutocompleteLoading: boolean;
  isAutocompleteFetched: boolean;

  openCreate: () => void;
  openDetail: (symptom: UserSymptom) => void;
  closePanel: () => void;
  cancelForm: () => void;

  onNameQueryChange: (value: string) => void;
  selectSymptom: (selection: SymptomSelection) => void;
  submitForm: (values: SymptomFormValues) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

const SymptomsContext = createContext<SymptomsContextValue | null>(null);

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

interface SymptomsProviderProps {
  children: ReactNode;
  onActivate?: () => void;
  panelCloseRef?: MutableRefObject<(() => void) | null>;
}

export function SymptomsProvider({ children, onActivate, panelCloseRef }: SymptomsProviderProps) {
  const [panel, setPanel] = useState<SymptomPanelState>({ kind: "closed" });
  const [formError, setFormError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const listQuery = useProfileSymptoms({
    currentPage,
    pageSize: SYMPTOMS_PAGE_SIZE,
  });
  const ensureCatalog = useEnsureSymptomCatalog();
  const createProfile = useCreateProfileSymptom();
  const removeProfile = useRemoveProfileSymptom();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors: formErrors },
  } = useForm<SymptomFormValues>({
    resolver: zodResolver(symptomFormSchema),
    defaultValues: emptySymptomFormValues(),
  });

  const nameQuery = watch("nameQuery") ?? "";
  const formMode = panel.kind === "create" ? "create" : null;
  const autocompleteActive = formMode === "create";
  const debouncedSearch = useDebouncedValue(
    autocompleteActive ? nameQuery : "",
    AUTOCOMPLETE_DEBOUNCE_MS,
  );

  const catalogQuery = useSymptomCatalogSearch(debouncedSearch);
  const catalogResults = autocompleteActive
    ? (catalogQuery.data?.data ?? [])
    : [];
  const shouldSearchOnline =
    autocompleteActive &&
    debouncedSearch.trim().length >= AUTOCOMPLETE_MIN_CHARS &&
    !catalogQuery.isFetching &&
    catalogResults.length < ONLINE_WHEN_CATALOG_BELOW;

  const onlineQuery = useOnlineSymptomSearch(
    debouncedSearch,
    shouldSearchOnline,
  );

  const catalogNames = new Set(
    catalogResults.map((s: SymptomCatalog) => s.name.toLocaleLowerCase()),
  );
  const onlineResults = (onlineQuery.data ?? []).filter(
    (name: string) => !catalogNames.has(name.toLocaleLowerCase()),
  );

  const isAutocompleteLoading =
    (debouncedSearch.trim().length >= AUTOCOMPLETE_MIN_CHARS &&
      catalogQuery.isFetching) ||
    (shouldSearchOnline && onlineQuery.isFetching);

  useEffect(() => {
    if (panel.kind === "create") {
      reset(emptySymptomFormValues());
      setFormError(null);
    }
  }, [panel, reset]);

  const symptoms = listQuery.data?.data ?? [];
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
    ensureCatalog.isPending || createProfile.isPending;

  const panelOpen = panel.kind !== "closed";
  const selectedId =
    panel.kind === "detail" ? panel.symptom.id : null;
  const panelTitle =
    panel.kind === "create"
      ? "Add symptom"
      : panel.kind === "detail"
        ? panel.symptom.catalog.name
        : undefined;

  const closePanelRef = useRef<(() => void) | null>(null);

  function openCreate() {
    onActivate?.();
    setFormError(null);
    setPanel({ kind: "create" });
  }

  function openDetail(symptom: UserSymptom) {
    onActivate?.();
    setFormError(null);
    setPanel({ kind: "detail", symptom });
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
    setValue("catalogId", undefined);
    setValue("onlineName", undefined);
  }

  function selectSymptom(selection: SymptomSelection) {
    if (selection.source === "catalog") {
      setValue("nameQuery", selection.symptom.name, {
        shouldValidate: true,
      });
      setValue("catalogId", selection.symptom.id, {
        shouldValidate: true,
      });
      setValue("onlineName", undefined);
      return;
    }

    setValue("nameQuery", selection.name, { shouldValidate: true });
    setValue("catalogId", undefined);
    setValue("onlineName", selection.name, { shouldValidate: true });
  }

  async function resolveCatalogId(
    payload: SymptomFormSubmitPayload,
  ): Promise<string> {
    if (payload.catalogId) return payload.catalogId;
    if (!payload.onlineName) {
      throw new Error("Select a symptom from the suggestions");
    }
    const catalog = await ensureCatalog.mutateAsync(payload.onlineName);
    return catalog.id;
  }

  async function submitForm(values: SymptomFormValues) {
    const payload = toSymptomSubmitPayload(values);

    try {
      setFormError(null);

      if (panel.kind === "create") {
        const catalogId = await resolveCatalogId(payload);
        await createProfile.mutateAsync({ catalogId });
        setCurrentPage(1);
        closePanel();
        return;
      }
    } catch (error) {
      setFormError(
        getErrorMessage(error, "Failed to add symptom"),
      );
    }
  }

  async function remove(id: string) {
    try {
      setListError(null);
      await removeProfile.mutateAsync(id);
      closePanel();
    } catch (error) {
      setListError(getErrorMessage(error, "Failed to remove symptom"));
    }
  }

  const value = useMemo<SymptomsContextValue>(
    () => ({
      symptoms,
      isLoading: listQuery.isLoading,
      isError: listQuery.isError,
      isSuccess: listQuery.isSuccess,
      listErrorMessage:
        listError ??
        (listQuery.isError
          ? getErrorMessage(listQuery.error, "Failed to load symptoms")
          : null),

      pagination,
      currentPage,
      pageSize: SYMPTOMS_PAGE_SIZE,
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
      closePanel,
      cancelForm,

      onNameQueryChange,
      selectSymptom,
      submitForm,
      remove,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      symptoms,
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
    <SymptomsContext.Provider value={value}>
      {children}
    </SymptomsContext.Provider>
  );
}

export function useSymptomsContext(): SymptomsContextValue {
  const ctx = useContext(SymptomsContext);
  if (!ctx)
    throw new Error(
      "useSymptomsContext must be used within <SymptomsProvider>",
    );
  return ctx;
}
