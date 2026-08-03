import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { isAxiosError } from "axios";
import { useDashboardQuery } from "../hooks/useDashboard";
import type { DashboardData } from "../lib/dashboard/types";

interface DashboardContextValue {
  data: DashboardData | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { error?: string };
    if (data?.error) return data.error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

interface DashboardProviderProps {
  children: ReactNode;
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  const query = useDashboardQuery();

  const value = useMemo<DashboardContextValue>(
    () => ({
      data: query.data ?? null,
      isLoading: query.isLoading,
      isError: query.isError,
      errorMessage: query.isError
        ? getErrorMessage(query.error, "Failed to load dashboard")
        : null,
    }),
    [query.data, query.isLoading, query.isError, query.error],
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardContext() {
  const ctx = useContext(DashboardContext);

  if (!ctx) {
    throw new Error(
      "useDashboardContext must be used within <DashboardProvider>",
    );
  }

  return ctx;
}
