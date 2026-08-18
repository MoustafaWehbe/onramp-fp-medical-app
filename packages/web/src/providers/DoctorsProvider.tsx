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
  useCatalogDoctorSearch,
  useCreateProfileDoctor,
  useEnsureDoctorCatalog,
  useProfileDoctors,
  useRemoveProfileDoctor,
  useSavedClinics,
  useUpdateProfileDoctor,
} from "../hooks/health/useDoctors";
import {
  emptyDoctorFormValues,
  doctorFormSchema,
  toDoctorFormValues,
  toDoctorSubmitPayload,
  type Doctor,
  type DoctorFormSubmitPayload,
  type DoctorFormValues,
  type UserClinic,
  type UserDoctor,
} from "../lib/health/health-export";
import type { Pagination } from "../lib/api/types";

export const DOCTORS_PAGE_SIZE = 15;

const AUTOCOMPLETE_DEBOUNCE_MS = 300;
const AUTOCOMPLETE_MIN_CHARS = 2;

export type DoctorPanelState =
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "detail"; doctor: UserDoctor }
  | { kind: "edit"; doctor: UserDoctor };

export type DoctorSelection = { source: "catalog"; doctor: Doctor };

interface DoctorsContextValue {
  doctors: UserDoctor[];
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

  panel: DoctorPanelState;
  panelOpen: boolean;
  panelTitle: string | undefined;
  selectedId: string | null;
  formMode: "create" | "edit" | null;

  formError: string | null;
  isFormBusy: boolean;
  isRemoving: boolean;

  register: UseFormRegister<DoctorFormValues>;
  watch: UseFormWatch<DoctorFormValues>;
  setValue: UseFormSetValue<DoctorFormValues>;
  formErrors: FieldErrors<DoctorFormValues>;
  handleFormSubmit: UseFormHandleSubmit<DoctorFormValues>;
  nameQuery: string;

  catalogResults: Doctor[];
  isAutocompleteLoading: boolean;
  savedClinics: UserClinic[];

  openCreate: () => void;
  openDetail: (doctor: UserDoctor) => void;
  openEdit: (doctor: UserDoctor) => void;
  closePanel: () => void;
  cancelForm: () => void;

  onNameQueryChange: (value: string) => void;
  selectDoctor: (selection: DoctorSelection) => void;
  submitForm: (values: DoctorFormValues) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

const DoctorsContext = createContext<DoctorsContextValue | null>(null);

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

interface DoctorsProviderProps {
  children: ReactNode;
  onActivate?: () => void;
  panelCloseRef?: MutableRefObject<(() => void) | null>;
}

export function DoctorsProvider({
  children,
  onActivate,
  panelCloseRef,
}: DoctorsProviderProps) {
  const [panel, setPanel] = useState<DoctorPanelState>({ kind: "closed" });
  const [formError, setFormError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const listQuery = useProfileDoctors({
    currentPage,
    pageSize: DOCTORS_PAGE_SIZE,
  });
  const savedClinicsQuery = useSavedClinics();
  const ensureCatalog = useEnsureDoctorCatalog();
  const createProfile = useCreateProfileDoctor();
  const updateProfile = useUpdateProfileDoctor();
  const removeProfile = useRemoveProfileDoctor();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors: formErrors },
  } = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: emptyDoctorFormValues(),
  });

  const nameQuery = watch("nameQuery") ?? "";
  const formMode =
    panel.kind === "create" || panel.kind === "edit" ? panel.kind : null;
  const autocompleteActive = formMode === "create";
  const debouncedSearch = useDebouncedValue(
    autocompleteActive ? nameQuery : "",
    AUTOCOMPLETE_DEBOUNCE_MS,
  );

  const catalogQuery = useCatalogDoctorSearch(debouncedSearch);
  const catalogResults = autocompleteActive
    ? (catalogQuery.data?.data ?? [])
    : [];

  const isAutocompleteLoading =
    debouncedSearch.trim().length >= AUTOCOMPLETE_MIN_CHARS &&
    catalogQuery.isFetching;

  useEffect(() => {
    if (panel.kind === "create") {
      reset(emptyDoctorFormValues());
      setFormError(null);
    } else if (panel.kind === "edit") {
      reset(toDoctorFormValues(panel.doctor));
      setFormError(null);
    }
  }, [panel, reset]);

  const doctors = listQuery.data?.data ?? [];
  const savedClinics = savedClinicsQuery.data?.data ?? [];
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
      ? panel.doctor.id
      : null;
  const panelTitle =
    panel.kind === "create"
      ? "Add doctor"
      : panel.kind === "edit"
        ? "Edit doctor"
        : panel.kind === "detail"
          ? panel.doctor.doctor.name
          : undefined;

  const closePanelRef = useRef<(() => void) | null>(null);

  function openCreate() {
    onActivate?.();
    setFormError(null);
    setPanel({ kind: "create" });
  }

  function openDetail(doctor: UserDoctor) {
    onActivate?.();
    setFormError(null);
    setPanel({ kind: "detail", doctor });
  }

  function openEdit(doctor: UserDoctor) {
    onActivate?.();
    setFormError(null);
    setPanel({ kind: "edit", doctor });
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
      openDetail(panel.doctor);
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
    setValue("doctorId", undefined);
  }

  function selectDoctor(selection: DoctorSelection) {
    if (formMode === "edit") return;
    setValue("nameQuery", selection.doctor.name, {
      shouldValidate: true,
    });
    setValue("doctorId", selection.doctor.id, {
      shouldValidate: true,
    });
    setValue("specialty", "", { shouldValidate: true });
    setValue("phone", "", { shouldValidate: true });
  }

  async function resolveDoctorId(
    payload: DoctorFormSubmitPayload,
  ): Promise<string> {
    if (payload.doctorId) return payload.doctorId;
    if (!payload.specialty?.trim() || !payload.phone?.trim()) {
      throw new Error(
        "Specialty and phone are required for new doctors",
      );
    }
    const catalog = await ensureCatalog.mutateAsync({
      name: nameQuery.trim(),
      specialty: payload.specialty.trim(),
      phone: payload.phone.trim(),
    });
    return catalog.id;
  }

  async function submitForm(values: DoctorFormValues) {
    const payload = toDoctorSubmitPayload(values);

    try {
      setFormError(null);

      if (panel.kind === "create") {
        const doctorId = await resolveDoctorId(payload);
        await createProfile.mutateAsync({
          doctorId,
          userClinicId: payload.userClinicId,
          notes: payload.notes,
        });
        setCurrentPage(1);
        closePanel();
        return;
      }

      if (panel.kind === "edit") {
        await updateProfile.mutateAsync({
          id: panel.doctor.id,
          body: {
            userClinicId: payload.userClinicId,
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
            ? "Failed to update doctor"
            : "Failed to add doctor",
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
      setListError(getErrorMessage(error, "Failed to remove doctor"));
      throw error;
    }
  }

  const value = useMemo<DoctorsContextValue>(
    () => ({
      doctors,
      isLoading: listQuery.isLoading,
      isError: listQuery.isError,
      isSuccess: listQuery.isSuccess,
      listErrorMessage:
        listError ??
        (listQuery.isError
          ? getErrorMessage(listQuery.error, "Failed to load doctors")
          : null),

      pagination,
      currentPage,
      pageSize: DOCTORS_PAGE_SIZE,
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
      savedClinics,

      openCreate,
      openDetail,
      openEdit,
      closePanel,
      cancelForm,

      onNameQueryChange,
      selectDoctor,
      submitForm,
      remove,
    }),
    [
      doctors,
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
      savedClinics,
    ],
  );

  return (
    <DoctorsContext.Provider value={value}>
      {children}
    </DoctorsContext.Provider>
  );
}

export function useDoctorsContext(): DoctorsContextValue {
  const ctx = useContext(DoctorsContext);
  if (!ctx)
    throw new Error(
      "useDoctorsContext must be used within <DoctorsProvider>",
    );
  return ctx;
}
