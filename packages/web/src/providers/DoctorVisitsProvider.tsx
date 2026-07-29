import {
createContext,
useContext,
useMemo,
useState,
type ReactNode,
} from "react";

import { useAuth } from "../hooks/useAuth";
import { useDoctorVisits } from "../hooks/useDoctorVisits";

import type {
EntryDoctorVisit,
EntryDoctorVisitsQuery,
} from "../lib/doctor-visit-entries/doctor-visit-exports";

interface DoctorVisitsContextValue {
doctorVisits: EntryDoctorVisit[];
currentPage: number;
pageSize: number;
totalCount: number;
totalPages: number;

isLoading: boolean;
isFetching: boolean;
isError: boolean;
error: Error | null;

setCurrentPage: (page: number) => void;
setPageSize: (pageSize: number) => void;

refetch: () => void;
}

const DoctorVisitsContext = createContext<
DoctorVisitsContextValue | undefined

> (undefined);

interface DoctorVisitsProviderProps {
children: ReactNode;
}

export function DoctorVisitsProvider({
children,
}: DoctorVisitsProviderProps) {
const { user } = useAuth();

const [currentPage, setCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState(10);

const query: EntryDoctorVisitsQuery = {
currentPage,
pageSize,
};

const doctorVisitsQuery = useDoctorVisits(
user?.id,
query,
);

const value = useMemo<DoctorVisitsContextValue>(
() => ({
doctorVisits: doctorVisitsQuery.data?.data ?? [],


  currentPage:
    doctorVisitsQuery.data?.pagination.currentPage ??
    currentPage,

  pageSize:
    doctorVisitsQuery.data?.pagination.pageSize ??
    pageSize,

  totalCount:
    doctorVisitsQuery.data?.pagination.totalCount ?? 0,

  totalPages:
    doctorVisitsQuery.data?.pagination.totalPages ?? 0,

  isLoading: doctorVisitsQuery.isLoading,
  isFetching: doctorVisitsQuery.isFetching,
  isError: doctorVisitsQuery.isError,

  error:
    doctorVisitsQuery.error instanceof Error
      ? doctorVisitsQuery.error
      : null,

  setCurrentPage,
  setPageSize: (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  },

  refetch: () => {
    void doctorVisitsQuery.refetch();
  },
}),
[
  doctorVisitsQuery.data,
  doctorVisitsQuery.isLoading,
  doctorVisitsQuery.isFetching,
  doctorVisitsQuery.isError,
  doctorVisitsQuery.error,
  doctorVisitsQuery.refetch,
  currentPage,
  pageSize,
],


);

return (
<DoctorVisitsContext.Provider value={value}>
{children}
</DoctorVisitsContext.Provider>
);
}

export function useDoctorVisitsContext() {
const context = useContext(DoctorVisitsContext);

if (!context) {
throw new Error(
"useDoctorVisitsContext must be used inside DoctorVisitsProvider",
);
}

return context;
}
