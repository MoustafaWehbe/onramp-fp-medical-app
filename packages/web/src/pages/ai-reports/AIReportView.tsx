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
      <div className="space-y-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/40">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-200">
            Unable to load report
          </h2>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">
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
    <div className="mx-auto max-w-3xl space-y-6 print:max-w-none print:space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between print:hidden">
        <div>
          <Link
            to="/ai-reports"
            className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to reports
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">
            Physician-ready report
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-muted-foreground">
            <CalendarRange className="h-4 w-4" />
            <span>
              {formatDate(report.dateRangeStart)} –{" "}
              {formatDate(report.dateRangeEnd)}
            </span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Generated {formatDate(report.createdAt)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.print()}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={remove.isPending}
            onClick={() => {
              void handleDelete();
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {remove.isPending ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>

      {remove.isError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 print:hidden dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
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
