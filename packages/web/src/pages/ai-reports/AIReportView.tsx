import { Link, useNavigate, useParams } from "react-router-dom";
import { isAxiosError } from "axios";
import { ArrowLeft, CalendarRange, Printer, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { LoadingSpinner } from "../../components/shared/LoadingSpinner";
import { ReportSection } from "../../components/ai-reports/ReportSection";
import { PageHeader } from "../../components/shared/PageHeader";
import { useAiReport, useRemoveAiReport } from "../../hooks/useAIReports";

function formatDate(value: string): string {
  const date = new Date(
    value.includes("T") ? value : `${value}T00:00:00`,
  );
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

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
  const { data: report, isLoading, isError, error } = useAiReport(id);
  const remove = useRemoveAiReport();

  async function handleDelete() {
    if (!report) return;
    const confirmed = window.confirm(
      "Delete this report permanently? This cannot be undone.",
    );
    if (!confirmed) return;

    try {
      await remove.mutateAsync(report.id);
      void navigate("/ai-reports");
    } catch {
      // Error surfaced via remove.error below
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="page-shell max-w-3xl">
        <div
          role="alert"
          className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6 shadow-soft"
        >
          <h2 className="text-lg font-semibold text-destructive">
            Unable to load report
          </h2>
          <p className="mt-2 text-sm text-destructive/90">
            {getErrorMessage(error)}
          </p>
        </div>
        <Link to="/ai-reports">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to reports
          </Button>
        </Link>
      </div>
    );
  }

  const content = report.reportContent ?? {};
  const summary =
    typeof content.summary === "string" ? content.summary : null;

  return (
    <div className="page-shell max-w-3xl print:max-w-none print:space-y-4">
      <div className="print:hidden">
        <Link
          to="/ai-reports"
          className="mb-4 inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-muted-foreground transition hover:bg-secondary hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to reports
        </Link>
        <PageHeader
          eyebrow="AI reports"
          title="Physician-ready report"
          description={`${formatDate(report.dateRangeStart)} – ${formatDate(report.dateRangeEnd)}. Generated ${formatDate(report.createdAt)}.`}
          icon={CalendarRange}
          action={(
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => window.print()}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="w-full sm:w-auto"
                disabled={remove.isPending}
                onClick={() => {
                  void handleDelete();
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {remove.isPending ? "Deleting…" : "Delete"}
              </Button>
            </div>
          )}
        />
      </div>

      {remove.isError && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive print:hidden"
        >
          {getErrorMessage(remove.error)}
        </div>
      )}

      {/* Print-only header */}
      <div className="hidden print:block">
        <h1 className="text-2xl font-bold">Physician-ready report</h1>
        <p className="mt-1 text-sm">
          {formatDate(report.dateRangeStart)} –{" "}
          {formatDate(report.dateRangeEnd)}
        </p>
        <p className="text-xs text-muted-foreground">
          Generated {formatDate(report.createdAt)}
        </p>
      </div>

      <Card className="print:border-0 print:shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {summary ? (
            <p className="text-sm leading-7 text-foreground">{summary}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              No summary available.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 print:grid-cols-2">
        <Card className="print:border print:shadow-none">
          <CardContent className="pt-6">
            <ReportSection
              title="Conditions"
              items={content.conditions as string[] | undefined}
            />
          </CardContent>
        </Card>
        <Card className="print:border print:shadow-none">
          <CardContent className="pt-6">
            <ReportSection
              title="Medications"
              items={content.medications as string[] | undefined}
            />
          </CardContent>
        </Card>
        <Card className="print:border print:shadow-none">
          <CardContent className="pt-6">
            <ReportSection
              title="Symptoms"
              items={content.symptoms as string[] | undefined}
            />
          </CardContent>
        </Card>
        <Card className="print:border print:shadow-none">
          <CardContent className="pt-6">
            <ReportSection
              title="Recommendations"
              items={content.recommendations as string[] | undefined}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
