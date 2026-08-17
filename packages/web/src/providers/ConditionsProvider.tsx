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
  useAllConditionSymptoms,
  useConditionCatalogSearch,
  useCreateProfileCondition,
  useEnsureConditionCatalog,
  useLinkConditionSymptom,
  useOnlineConditionSearch,
  useProfileConditions,
  useRemoveProfileCondition,
  useUnlinkConditionSymptom,
  useUpdateProfileCondition,
} from "../hooks/health/useConditions";
import { useProfileSymptoms } from "../hooks/health/useSymptoms";
import {
  emptyConditionFormValues,
  conditionFormSchema,
  toConditionFormValues,
  toConditionSubmitPayload,
  type ConditionCatalog,
  type ConditionFormSubmitPayload,
  type ConditionFormValues,
  type ConditionSymptom,
  type UserCondition,
  type UserSymptom,
} from "../lib/health/health-export";
import type { Pagination } from "../lib/api/types";

export const CONDITIONS_PAGE_SIZE = 15;
const CONDITION_SYMPTOMS_PAGE_SIZE = 100;
const PROFILE_SYMPTOMS_PAGE_SIZE = 100;

const AUTOCOMPLETE_DEBOUNCE_MS = 300;
const AUTOCOMPLETE_MIN_CHARS = 2;
const ONLINE_WHEN_CATALOG_BELOW = 5;

export type ConditionPanelState =
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "detail"; condition: UserCondition }
  | { kind: "edit"; condition: UserCondition };

export type ConditionSelection =
  | { source: "catalog"; condition: ConditionCatalog }
  | { source: "online"; name: string };

interface ConditionsContextValue {
  conditions: UserCondition[];
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

  panel: ConditionPanelState;
  panelOpen: boolean;
  panelTitle: string | undefined;
  selectedId: string | null;
  formMode: "create" | "edit" | null;

  formError: string | null;
  isFormBusy: boolean;
  isRemoving: boolean;

  register: UseFormRegister<ConditionFormValues>;
  watch: UseFormWatch<ConditionFormValues>;
  setValue: UseFormSetValue<ConditionFormValues>;
  formErrors: FieldErrors<ConditionFormValues>;
  handleFormSubmit: UseFormHandleSubmit<ConditionFormValues>;
  nameQuery: string;

  catalogResults: ConditionCatalog[];
  onlineResults: string[];
  isAutocompleteLoading: boolean;
  isAutocompleteFetched: boolean;

  openCreate: () => void;
  openDetail: (condition: UserCondition) => void;
  openEdit: (condition: UserCondition) => void;
  closePanel: () => void;
  cancelForm: () => void;

  onNameQueryChange: (value: string) => void;
  selectCondition: (selection: ConditionSelection) => void;
  submitForm: (values: ConditionFormValues) => Promise<void>;
  remove: (id: string) => Promise<void>;

  linkedSymptomsByConditionId: Record<string, ConditionSymptom[]>;
  profileSymptoms: UserSymptom[];
  isLinkingSymptom: boolean;
  isUnlinkingSymptom: boolean;
  linkSymptom: (
    userConditionId: string,
    userSymptomId: string,
  ) => Promise<void>;
  unlinkSymptom: (
    userConditionId: string,
    userSymptomId: string,
  ) => Promise<void>;
}

const ConditionsContext = createContext<ConditionsContextValue | null>(null);

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

interface ConditionsProviderProps {
  children: ReactNode;
  onActivate?: () => void;
  panelCloseRef?: MutableRefObject<(() => void) | null>;
}

export function ConditionsProvider({ children, onActivate, panelCloseRef }: ConditionsProviderProps) {
  const [panel, setPanel] = useState<ConditionPanelState>({ kind: "closed" });
  const [formError, setFormError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const listQuery = useProfileConditions({
    currentPage,
    pageSize: CONDITIONS_PAGE_SIZE,
  });
  const conditionSymptomsQuery = useAllConditionSymptoms({
    pageSize: CONDITION_SYMPTOMS_PAGE_SIZE,
  });
  const profileSymptomsQuery = useProfileSymptoms({
    pageSize: PROFILE_SYMPTOMS_PAGE_SIZE,
    fetchAll: true,
  });
  const ensureCatalog = useEnsureConditionCatalog();
  const createProfile = useCreateProfileCondition();
  const updateProfile = useUpdateProfileCondition();
  const removeProfile = useRemoveProfileCondition();
  const linkConditionSymptom = useLinkConditionSymptom();
  const unlinkConditionSymptom = useUnlinkConditionSymptom();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors: formErrors },
  } = useForm<ConditionFormValues>({
    resolver: zodResolver(conditionFormSchema),
    defaultValues: emptyConditionFormValues(),
  });

  const nameQuery = watch("nameQuery") ?? "";
  const formMode =
    panel.kind === "create" || panel.kind === "edit" ? panel.kind : null;
  const autocompleteActive = formMode === "create";
  const debouncedSearch = useDebouncedValue(
    autocompleteActive ? nameQuery : "",
    AUTOCOMPLETE_DEBOUNCE_MS,
  );

  const catalogQuery = useConditionCatalogSearch(debouncedSearch);
  const catalogResults = autocompleteActive
    ? (catalogQuery.data?.data ?? [])
    : [];
  const shouldSearchOnline =
    autocompleteActive &&
    debouncedSearch.trim().length >= AUTOCOMPLETE_MIN_CHARS &&
    !catalogQuery.isFetching &&
    catalogResults.length < ONLINE_WHEN_CATALOG_BELOW;

  const onlineQuery = useOnlineConditionSearch(
    debouncedSearch,
    shouldSearchOnline,
  );

  const catalogNames = new Set(
    catalogResults.map((c: ConditionCatalog) => c.name.toLocaleLowerCase()),
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
      reset(emptyConditionFormValues());
      setFormError(null);
    } else if (panel.kind === "edit") {
      reset(toConditionFormValues(panel.condition));
      setFormError(null);
    }
  }, [panel, reset]);

  const conditions = listQuery.data?.data ?? [];
  const pagination = listQuery.data?.pagination ?? null;
  const profileSymptoms = profileSymptomsQuery.data?.data ?? [];
  const linkedSymptomsByConditionId = useMemo(() => {
    const links = conditionSymptomsQuery.data?.data ?? [];
    const map: Record<string, ConditionSymptom[]> = {};
    for (const link of links) {
      const key = link.userConditionId;
      if (!map[key]) map[key] = [];
      map[key].push(link);
    }
    return map;
  }, [conditionSymptomsQuery.data?.data]);

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
      ? panel.condition.id
      : null;
  const panelTitle =
    panel.kind === "create"
      ? "Add condition"
      : panel.kind === "edit"
        ? "Edit condition"
        : panel.kind === "detail"
          ? panel.condition.condition.name
          : undefined;

  const closePanelRef = useRef<(() => void) | null>(null);

  function openCreate() {
    onActivate?.();
    setFormError(null);
    setPanel({ kind: "create" });
  }

  function openDetail(condition: UserCondition) {
    onActivate?.();
    setFormError(null);
    setPanel({ kind: "detail", condition });
  }

  function openEdit(condition: UserCondition) {
    onActivate?.();
    setFormError(null);
    setPanel({ kind: "edit", condition });
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
      openDetail(panel.condition);
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
    setValue("conditionId", undefined);
    setValue("onlineName", undefined);
  }

  function selectCondition(selection: ConditionSelection) {
    if (formMode === "edit") return;
    if (selection.source === "catalog") {
      setValue("nameQuery", selection.condition.name, {
        shouldValidate: true,
      });
      setValue("conditionId", selection.condition.id, {
        shouldValidate: true,
      });
      setValue("onlineName", undefined);
      return;
    }

    setValue("nameQuery", selection.name, { shouldValidate: true });
    setValue("conditionId", undefined);
    setValue("onlineName", selection.name, { shouldValidate: true });
  }

  async function resolveConditionId(
    payload: ConditionFormSubmitPayload,
  ): Promise<string> {
    if (payload.conditionId) return payload.conditionId;
    if (!payload.onlineName) {
      throw new Error("Select a condition from the suggestions");
    }
    const catalog = await ensureCatalog.mutateAsync(payload.onlineName);
    return catalog.id;
  }

  async function submitForm(values: ConditionFormValues) {
    const payload = toConditionSubmitPayload(values);

    try {
      setFormError(null);

      if (panel.kind === "create") {
        const conditionId = await resolveConditionId(payload);
        await createProfile.mutateAsync({
          conditionId,
          description: payload.description,
          diagnosedDate: payload.diagnosedDate,
          status: payload.status,
          notes: payload.notes,
        });
        setCurrentPage(1);
        closePanel();
        return;
      }

      if (panel.kind === "edit") {
        await updateProfile.mutateAsync({
          id: panel.condition.id,
          body: {
            description: payload.description,
            diagnosedDate: payload.diagnosedDate,
            status: payload.status,
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
            ? "Failed to update condition"
            : "Failed to add condition",
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
      setListError(getErrorMessage(error, "Failed to remove condition"));
      throw error;
    }
  }

  async function linkSymptom(
    userConditionId: string,
    userSymptomId: string,
  ) {
    try {
      setFormError(null);
      await linkConditionSymptom.mutateAsync({
        userConditionId,
        body: { userSymptomId },
      });
    } catch (error) {
      setFormError(
        getErrorMessage(error, "Failed to link symptom to condition"),
      );
      throw error;
    }
  }

  async function unlinkSymptom(
    userConditionId: string,
    userSymptomId: string,
  ) {
    try {
      setFormError(null);
      await unlinkConditionSymptom.mutateAsync({
        userConditionId,
        userSymptomId,
      });
    } catch (error) {
      setFormError(
        getErrorMessage(error, "Failed to unlink symptom from condition"),
      );
    }
  }

  const value = useMemo<ConditionsContextValue>(
    () => ({
      conditions,
      isLoading: listQuery.isLoading,
      isError: listQuery.isError,
      isSuccess: listQuery.isSuccess,
      listErrorMessage:
        listError ??
        (listQuery.isError
          ? getErrorMessage(listQuery.error, "Failed to load conditions")
          : null),

      pagination,
      currentPage,
      pageSize: CONDITIONS_PAGE_SIZE,
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
      selectCondition,
      submitForm,
      remove,

      linkedSymptomsByConditionId,
      profileSymptoms,
      isLinkingSymptom: linkConditionSymptom.isPending,
      isUnlinkingSymptom: unlinkConditionSymptom.isPending,
      linkSymptom,
      unlinkSymptom,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      conditions,
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
      linkedSymptomsByConditionId,
      profileSymptoms,
      linkConditionSymptom.isPending,
      unlinkConditionSymptom.isPending,
    ],
  );

  return (
    <ConditionsContext.Provider value={value}>
      {children}
    </ConditionsContext.Provider>
  );
}

export function useConditionsContext(): ConditionsContextValue {
  const ctx = useContext(ConditionsContext);
  if (!ctx)
    throw new Error(
      "useConditionsContext must be used within <ConditionsProvider>",
    );
  return ctx;
}
