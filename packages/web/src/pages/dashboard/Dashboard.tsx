import { Link } from "react-router-dom";
import {
  CalendarDays,
  Pill,
  Activity,
  Heart,
  Stethoscope,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useDashboardContext } from "../../providers/DashboardProvider";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { StatCard } from "../../components/dashboard/StatCard";
import { RecentEntries } from "../../components/dashboard/RecentEntries";
import { DashboardSkeleton } from "../../components/dashboard/DashboardSkeleton";

export function Dashboard() {
  const { user } = useAuth();
  const { data, isLoading, isError, errorMessage } = useDashboardContext();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-xl border bg-card shadow-sm">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" aria-hidden />
          {errorMessage ?? "Failed to load dashboard"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name}!</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={CalendarDays}
          label="Monthly Entries"
          value={data?.stats.entryCount ?? 0}
          subtext="Last 30 days"
        />

        <StatCard
          icon={Pill}
          label="Active Meds"
          value={data?.stats.activeMedicationCount ?? 0}
          subtext="Current medications"
        />

        <StatCard
          icon={Heart}
          label="Active Conditions"
          value={data?.stats.activeConditionCount ?? 0}
          subtext="Tracked conditions"
        />

        <StatCard
          icon={Activity}
          label="Avg Mood"
          value={data?.stats.avgMood != null ? data.stats.avgMood.toFixed(1) : "--"}
          subtext="Last 7 days"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentEntries entries={data?.recentEntries ?? []} />
        </div>

        <Card>
          <CardContent className="flex flex-col items-start gap-1 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Stethoscope className="h-5 w-5" aria-hidden />
            </div>

            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Last Visit
            </p>

            {data?.lastVisit ? (
              <>
                <p className="text-sm font-medium">{data.lastVisit.doctorName}</p>
                <p className="text-xs text-muted-foreground">
                  {data.lastVisit.date}
                  {data.lastVisit.clinicName && ` — ${data.lastVisit.clinicName}`}
                </p>

                {data.lastVisit.summary && (
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {data.lastVisit.summary}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No visits recorded</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-2 p-6 sm:flex-row">
          <Link to="/log/view" className="flex-1">
            <Button variant="default" className="w-full">
              New Daily Log
            </Button>
          </Link>

          <Link to="/ai-reports/generate" className="flex-1">
            <Button variant="outline" className="w-full">
              Generate AI Report
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
