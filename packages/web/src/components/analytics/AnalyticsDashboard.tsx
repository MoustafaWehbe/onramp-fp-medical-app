import {
  Activity,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { useAnalyticsContext } from "../../providers/AnalyticsProvider";
import { MoodChart } from "./MoodChart";
import { SleepChart } from "./SleepChart";
import { SymptomFrequency } from "./SymptomFrequency";

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
      <div className="flex min-h-64 items-center justify-center rounded-xl border bg-card shadow-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading analytics...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-xl border bg-card shadow-sm">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" aria-hidden />
          {errorMessage ?? "Failed to load analytics"}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-xl border bg-card shadow-sm">
        <p className="text-sm text-muted-foreground">
          No analytics data available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Activity
              className="h-5 w-5"
              aria-hidden
            />
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Health Analytics
            </h2>

            <p className="text-sm text-muted-foreground">
              Overview for the last {days} days
            </p>
          </div>
        </div>

        <label className="sr-only" htmlFor="analytics-period">
          Analytics period
        </label>

        <select
          id="analytics-period"
          value={days}
          onChange={(event) =>
            setDays(Number(event.target.value))
          }
          className="rounded-lg border bg-background px-3 py-2 text-sm"
        >
          <option value={7}>
            Last 7 days
          </option>

          <option value={30}>
            Last 30 days
          </option>

          <option value={90}>
            Last 90 days
          </option>
        </select>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
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