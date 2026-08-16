import { Link } from "react-router-dom";
import {
  CalendarDays,
  Pill,
  Activity,
  Heart,
  Stethoscope,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useDashboardContext } from "../../providers/DashboardProvider";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { StatCard } from "../../components/dashboard/StatCard";
import { RecentEntries } from "../../components/dashboard/RecentEntries";
import { DashboardSkeleton } from "../../components/dashboard/DashboardSkeleton";
import { PageHeader } from "../../components/shared/PageHeader";

function greetingForNow() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function Dashboard() {
  const { user } = useAuth();
  const { data, isLoading, isError, errorMessage } = useDashboardContext();
  const firstName = user?.name?.trim().split(/\s+/)[0] ?? "";

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-6 shadow-soft">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" aria-hidden />
          {errorMessage ?? "Failed to load dashboard"}
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Health overview"
        title={`${greetingForNow()}${firstName ? `, ${firstName}` : ""}`}
        description="Your latest health signals, records, and next actions—all in one place."
        icon={Heart}
        action={(
          <Link to="/log/view">
            <Button className="w-full sm:w-auto">
              New Daily Log
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Button>
          </Link>
        )}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
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

      <div className="grid items-stretch gap-4 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-8">
          <RecentEntries entries={data?.recentEntries ?? []} />
        </div>

        <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-card via-card to-primary/10 lg:col-span-4">
          <CardContent className="flex h-full flex-col items-start gap-1 p-5 sm:p-6">
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
              <Stethoscope className="h-5 w-5" aria-hidden />
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Last Visit
            </p>

            {data?.lastVisit ? (
              <>
                <p className="text-lg font-bold tracking-tight">{data.lastVisit.doctorName}</p>
                <p className="text-sm text-muted-foreground">
                  {data.lastVisit.date}
                  {data.lastVisit.clinicName && ` — ${data.lastVisit.clinicName}`}
                </p>

                {data.lastVisit.summary && (
                  <p className="mt-2 text-sm leading-6 text-muted-foreground line-clamp-3">
                    {data.lastVisit.summary}
                  </p>
                )}

                <Link
                  to="/visits"
                  className="mt-auto pt-4 text-sm font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Open visits
                </Link>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">No visits recorded yet.</p>
                <Link
                  to="/visits"
                  className="mt-auto pt-4 text-sm font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Add a visit
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <section aria-labelledby="quick-actions-title">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 id="quick-actions-title" className="text-lg font-bold">Quick actions</h2>
            <p className="text-sm text-muted-foreground">Keep your health record moving.</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link to="/ai-reports/generate" className="flex-1">
            <Card className="group h-full overflow-hidden bg-card/90 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-glow">
              <CardContent className="flex items-center gap-4 p-4 sm:p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Activity className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">Generate AI Report</p>
                  <p className="text-sm text-muted-foreground">Create a physician-ready health summary.</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden />
              </CardContent>
            </Card>
          </Link>
          <Link to="/health-profile" className="flex-1">
            <Card className="group h-full overflow-hidden bg-card/90 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-glow">
              <CardContent className="flex items-center gap-4 p-4 sm:p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Heart className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">Update Health Profile</p>
                  <p className="text-sm text-muted-foreground">Review conditions and tracked symptoms.</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden />
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
}
