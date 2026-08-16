import {
  Activity,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { useAnalyticsContext } from "../../providers/AnalyticsProvider";
import { MoodChart } from "./MoodChart";
import { SleepChart } from "./SleepChart";
import { SymptomFrequency } from "./SymptomFrequency";
import { PageHeader } from "../shared/PageHeader";

export function AnalyticsDashboard() {
  const {
    data,
    isLoading,
    isError,
    errorMessage,
    days,
    setDays,
  } = useAnalyticsContext();

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-2xl border bg-card shadow-soft">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading analytics...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 shadow-soft">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" aria-hidden />
          {errorMessage ?? "Failed to load analytics"}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed bg-card shadow-soft">
        <p className="text-sm text-muted-foreground">
          No analytics data available.
        </p>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Trends and patterns"
        title="Health Analytics"
        description={`A visual overview of your recorded health data for the last ${days} days.`}
        icon={Activity}
        action={(
          <>
            <label className="sr-only" htmlFor="analytics-period">Analytics period</label>
            <select
              id="analytics-period"
              value={days}
              onChange={(event) => setDays(Number(event.target.value))}
              className="h-11 w-full cursor-pointer rounded-xl border border-input bg-card px-3.5 text-sm font-semibold shadow-sm outline-none transition-[border-color,box-shadow] duration-200 hover:border-primary/40 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/25 sm:w-auto"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </>
        )}
      />

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <MoodChart
          data={data.moodTrend}
        />

        <SleepChart
          data={data.sleepTrend}
        />
      </div>

      <SymptomFrequency
        data={data.symptomFrequency}
      />
    </div>
  );
}
