import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { isAxiosError } from "axios";
import { useAnalyticsDashboard } from "../hooks/useAnalytics";
import type { AnalyticsDashboard } from "../lib/analytics/types";



interface AnalyticsContextValue {
  data: AnalyticsDashboard | null;

  days: number;
  setDays: (days: number) => void;

  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
}


const AnalyticsContext =
  createContext<AnalyticsContextValue | null>(null);


function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as {
      error?: string;
    };

    if (data?.error) return data.error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}


interface AnalyticsProviderProps {
  children: ReactNode;
}


export function AnalyticsProvider({
  children,
}: AnalyticsProviderProps) {
  const [days, setDays] = useState(30);


  const query = useAnalyticsDashboard({
    days,
  });


  const value = useMemo<AnalyticsContextValue>(
    () => ({
      data: query.data ?? null,

      days,
      setDays,

      isLoading: query.isLoading,

      isError: query.isError,

      errorMessage: query.isError
        ? getErrorMessage(
            query.error,
            "Failed to load analytics",
          )
        : null,
    }),
    [
      query.data,
      query.isLoading,
      query.isError,
      query.error,
      days,
    ],
  );


  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}


export function useAnalyticsContext() {
  const ctx = useContext(AnalyticsContext);

  if (!ctx) {
    throw new Error(
      "useAnalyticsContext must be used within <AnalyticsProvider>",
    );
  }

  return ctx;
}