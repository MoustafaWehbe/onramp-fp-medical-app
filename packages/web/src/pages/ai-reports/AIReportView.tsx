import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { isAxiosError } from "axios";
import {
  Activity,
  ArrowLeft,
  CalendarRange,
  HeartPulse,
  Pill,
  Printer,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { LoadingSpinner } from "../../components/shared/LoadingSpinner";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { PageHeader } from "../../components/shared/PageHeader";
import { SectionPanel } from "../../components/shared/SectionPanel";
import { ReportSection } from "../../components/ai-reports/ReportSection";
import { formatReportDate } from "../../components/ai-reports/formatReportDate";
import { useAiReport, useRemoveAiReport } from "../../hooks/useAIReports";

function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const message = (error.response?.data as { error?: string } | undefined)
      ?.error;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Something went wrong while loading this report.";
}

export function AIReportView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "ar" ? "ar-EG" : "en-US";
  const { data: report, isLoading, isError, error } = useAiReport(id);
  const remove = useRemoveAiReport();
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function confirmDelete() {
    if (!report) return;

    try {
      await remove.mutateAsync(report.id);
      setConfirmOpen(false);
      void navigate("/ai-reports");
    } catch {
      // Error surfaced via remove.error below
    }
  }

  if (isLoading) {
    return (
      <div className="page-shell">
        <PageHeader
          eyebrow={t("aiReports.generateEyebrow")}
          title={t("aiReports.viewTitle")}
          description={t("aiReports.loadingSummary")}
          icon={CalendarRange}
        />
        <div className="flex min-h-64 items-center justify-center rounded-2xl border bg-card shadow-soft">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="page-shell">
        <PageHeader
          eyebrow={t("aiReports.generateEyebrow")}
          title={t("aiReports.viewTitle")}
          description={t("aiReports.failedSummary")}
          icon={CalendarRange}
        />
        <div
          role="alert"
          className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6 shadow-soft"
        >
          <h2 className="text-lg font-semibold text-destructive">
            {t("aiReports.unableLoad")}
          </h2>
          <p className="mt-2 text-sm text-destructive/90">
            {getErrorMessage(error)}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/ai-reports")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
          {t("aiReports.back")}
        </Button>
      </div>
    );
  }

  const content = report.reportContent ?? {};
  const summary =
    typeof content.summary === "string" ? content.summary : null;
  const rangeLabel = `${formatReportDate(report.dateRangeStart, locale)} – ${formatReportDate(report.dateRangeEnd, locale)}`;

  return (
    <div className="page-shell print:max-w-none print:space-y-4">
      <div className="space-y-4 print:hidden">
        <button
          type="button"
          className="inline-flex min-h-11 w-fit items-center gap-1 rounded-xl px-2 text-sm font-semibold text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          onClick={() => navigate("/ai-reports")}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t("aiReports.back")}
        </button>

        <PageHeader
          eyebrow={t("aiReports.generateEyebrow")}
          title={t("aiReports.viewTitle")}
          description={`${rangeLabel}. ${t("aiReports.generated", { date: formatReportDate(report.createdAt, locale) })}`}
          icon={CalendarRange}
          action={(
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => window.print()}
              >
                <Printer className="mr-2 h-4 w-4" aria-hidden />
                {t("aiReports.print")}
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="w-full sm:w-auto"
                disabled={remove.isPending}
                onClick={() => setConfirmOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" aria-hidden />
                {t("aiReports.delete")}
              </Button>
            </div>
          )}
        />
      </div>

      {remove.isError && (
        <p
          role="alert"
          className="rounded-xl border border-destructive/20 bg-destructive/10 px-3.5 py-3 text-sm text-destructive print:hidden"
        >
          {getErrorMessage(remove.error)}
        </p>
      )}

      <div className="hidden print:block">
        <h1 className="text-2xl font-bold">{t("aiReports.viewTitle")}</h1>
        <p className="mt-1 text-sm">{rangeLabel}</p>
        <p className="text-xs text-muted-foreground">
          {t("aiReports.generated", { date: formatReportDate(report.createdAt, locale) })}
        </p>
      </div>

      <SectionPanel title={t("aiReports.summary")} icon={Sparkles} className="print:shadow-none">
        {summary ? (
          <p className="text-sm leading-7 text-foreground">{summary}</p>
        ) : (
          <p className="text-sm text-muted-foreground">{t("aiReports.noSummaryAvailable")}</p>
        )}
      </SectionPanel>

      <div className="grid gap-4 md:grid-cols-2 print:grid-cols-2">
        <ReportSection
          title={t("aiReports.conditions")}
          icon={HeartPulse}
          items={content.conditions as string[] | undefined}
        />
        <ReportSection
          title={t("aiReports.medications")}
          icon={Pill}
          items={content.medications as string[] | undefined}
        />
        <ReportSection
          title={t("aiReports.symptoms")}
          icon={Activity}
          items={content.symptoms as string[] | undefined}
        />
        <ReportSection
          title={t("aiReports.recommendations")}
          icon={Sparkles}
          items={content.recommendations as string[] | undefined}
        />
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!open && !remove.isPending) setConfirmOpen(false);
        }}
        title={t("aiReports.deleteTitle")}
        description={t("aiReports.deleteDescription")}
        confirmLabel={t("aiReports.deleteReport")}
        loading={remove.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
