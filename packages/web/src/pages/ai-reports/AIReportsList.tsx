import { useState } from "react";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { isAxiosError } from "axios";
import { Button } from "../../components/ui/button";
import { LoadingSpinner } from "../../components/shared/LoadingSpinner";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import {
  Pagination,
  paginationFromApi,
} from "../../components/shared/Pagination";
import { AiReportCard } from "../../components/ai-reports/AiReportCard";
import { useAuth } from "../../hooks/useAuth";
import { useAiReports, useRemoveAiReport } from "../../hooks/useAIReports";
import { PageHeader } from "../../components/shared/PageHeader";

const PAGE_SIZE = 10;

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
  return "Something went wrong while loading your AI reports.";
}

export function AIReportsList() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const { data, isLoading, isError, error, isFetching } = useAiReports(
    user?.id,
    { currentPage, pageSize: PAGE_SIZE },
  );
  const remove = useRemoveAiReport();

  const reports = data?.data ?? [];
  const pagination = data?.pagination;
  const isConfirmOpen = pendingDeleteId != null;

  async function confirmDelete() {
    if (!pendingDeleteId) return;

    try {
      await remove.mutateAsync(pendingDeleteId);
      if (reports.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
      }
      setPendingDeleteId(null);
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

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/40">
        <h2 className="text-lg font-semibold text-red-800 dark:text-red-200">
          Unable to load AI reports
        </h2>
        <p className="mt-2 text-sm text-red-700 dark:text-red-300">
          {getErrorMessage(error)}
        </p>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Clinical summaries"
        title="AI Reports"
        description="Review previous summaries or generate a new physician-ready report."
        icon={FileText}
        action={(
          <Link to="/ai-reports/generate">
            <Button className="w-full sm:w-auto">Generate New Report</Button>
          </Link>
        )}
      />

      {remove.isError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {getErrorMessage(remove.error)}
        </div>
      )}

      {reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card p-10 text-center shadow-soft">
          <p className="text-sm text-muted-foreground">
            No reports yet. Generate your first physician-ready summary.
          </p>
          <Link to="/ai-reports/generate" className="mt-4 inline-block">
            <Button variant="outline">Generate New Report</Button>
          </Link>
        </div>
      ) : (
        <div className={`space-y-4 ${isFetching ? "opacity-70" : ""}`}>
          {reports.map((report) => (
            <AiReportCard
              key={report.id}
              report={report}
              isDeleting={
                remove.isPending && pendingDeleteId === report.id
              }
              onDelete={setPendingDeleteId}
            />
          ))}
        </div>
      )}

      {pagination && (
        <Pagination
          {...paginationFromApi(pagination)}
          onPageChange={setCurrentPage}
          disabled={isFetching || remove.isPending}
        />
      )}

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={(open) => {
          if (!open && !remove.isPending) {
            setPendingDeleteId(null);
          }
        }}
        title="Delete this report?"
        description="This permanently removes the report. This cannot be undone."
        confirmLabel="Delete report"
        loading={remove.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
