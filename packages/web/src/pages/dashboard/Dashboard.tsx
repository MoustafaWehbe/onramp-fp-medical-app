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
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { useDashboardContext } from "../../providers/DashboardProvider";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { StatCard } from "../../components/dashboard/StatCard";
import { RecentEntries } from "../../components/dashboard/RecentEntries";
import { DashboardSkeleton } from "../../components/dashboard/DashboardSkeleton";
import { PageHeader } from "../../components/shared/PageHeader";
import { formatDate } from "../../lib/utils";

export function Dashboard() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "ar" ? "ar-EG" : "en-US";
  const { user } = useAuth();
  const { data, isLoading, isError, errorMessage } = useDashboardContext();
  const firstName = user?.name?.trim().split(/\s+/)[0] ?? "";

  const greetingForNow = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("dashboard.greetingMorning");
    if (hour < 17) return t("dashboard.greetingAfternoon");
    return t("dashboard.greetingEvening");
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-6 shadow-soft">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" aria-hidden />
          {errorMessage ?? t("dashboard.errorLoadDashboard")}
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow={t("dashboard.healthOverview")}
        title={`${greetingForNow()}${firstName ? `, ${firstName}` : ""}`}
        description={t("settings.description")}
        icon={Heart}
        action={(
          <Link to="/log/view">
            <Button className="w-full sm:w-auto">
              {t("dashboard.newDailyLog")}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Button>
          </Link>
        )}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        <StatCard
          icon={CalendarDays}
          label={t("dashboard.monthlyEntries")}
          value={data?.stats.entryCount ?? 0}
          subtext={t("dashboard.last30Days")}
        />

        <StatCard
          icon={Pill}
          label={t("dashboard.activeMeds")}
          value={data?.stats.activeMedicationCount ?? 0}
          subtext={t("dashboard.currentMeds")}
        />

        <StatCard
          icon={Heart}
          label={t("dashboard.activeConditions")}
          value={data?.stats.activeConditionCount ?? 0}
          subtext={t("dashboard.trackedConditions")}
        />

        <StatCard
          icon={Activity}
          label={t("dashboard.avgMood")}
          value={data?.stats.avgMood != null ? data.stats.avgMood.toFixed(1) : "--"}
          subtext={t("dashboard.last7Days")}
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
              {t("dashboard.lastVisit")}
            </p>

            {data?.lastVisit ? (
              <>
                <p className="text-lg font-bold tracking-tight">{data.lastVisit.doctorName}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(`${data.lastVisit.date}T00:00:00`, locale)}
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
                  {t("dashboard.openVisits")}
                </Link>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">{t("dashboard.noVisits")}</p>
                <Link
                  to="/visits"
                  className="mt-auto pt-4 text-sm font-semibold text-primary underline-offset-4 hover:underline"
                >
                  {t("dashboard.addVisit")}
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <section aria-labelledby="quick-actions-title">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 id="quick-actions-title" className="text-lg font-bold">{t("dashboard.quickActions")}</h2>
            <p className="text-sm text-muted-foreground">{t("dashboard.keepHealthRecordMoving")}</p>
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
                  <p className="font-bold">{t("dashboard.generateAiReport")}</p>
                  <p className="text-sm text-muted-foreground">{t("dashboard.generateAiReportDescription")}</p>
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
                  <p className="font-bold">{t("dashboard.updateHealthProfile")}</p>
                  <p className="text-sm text-muted-foreground">{t("dashboard.updateHealthProfileDescription")}</p>
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
