import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { FileText, Sparkles } from "lucide-react";
import { isAxiosError } from "axios";
import { Button } from "../../components/ui/button";
import { LoadingSpinner } from "../../components/shared/LoadingSpinner";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import {
  Pagination,
  paginationFromApi,
} from "../../components/shared/Pagination";
import { PageHeader } from "../../components/shared/PageHeader";
import { SectionPanel } from "../../components/shared/SectionPanel";
import { AiReportCard } from "../../components/ai-reports/AiReportCard";
import { useAuth } from "../../hooks/useAuth";
import { useAiReports, useRemoveAiReport } from "../../hooks/useAIReports";

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
  const navigate = useNavigate();
  const { t } = useTranslation();
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

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow={t("aiReports.eyebrow")}
        title={t("aiReports.title")}
        description={t("aiReports.description")}
        icon={FileText}
        badge={
          !isLoading && pagination ? (
            <span className="inline-flex items-center rounded-full border bg-secondary/80 px-2.5 py-1 text-xs font-semibold tabular-nums text-secondary-foreground">
              {pagination.totalCount}{" "}
              {t(pagination.totalCount === 1 ? "aiReports.countOne" : "aiReports.countOther")}
            </span>
          ) : undefined
        }
        action={(
          <Button
            type="button"
            className="w-full sm:w-auto"
            onClick={() => navigate("/ai-reports/generate")}
          >
            <Sparkles className="mr-1.5 h-4 w-4" aria-hidden />
            {t("aiReports.generate")}
          </Button>
        )}
      />

      {isError ? (
        <div
          role="alert"
          className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6 text-center shadow-soft"
        >
          <p className="text-sm text-destructive">{getErrorMessage(error)}</p>
        </div>
      ) : (
        <SectionPanel
          title={t("aiReports.historyTitle")}
          description={t("aiReports.historyDescription")}
          icon={FileText}
        >
          {isLoading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner />
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 px-6 py-16 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <FileText className="h-6 w-6" aria-hidden />
              </div>
              <p className="font-medium">{t("aiReports.noReports")}</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {t("aiReports.noReportsDescription")}
              </p>
              <Button
                type="button"
                className="mt-4"
                onClick={() => navigate("/ai-reports/generate")}
              >
                <Sparkles className="mr-1.5 h-4 w-4" aria-hidden />
                {t("aiReports.generate")}
              </Button>
            </div>
          ) : (
            <div className={isFetching ? "opacity-70" : undefined}>
              {remove.isError && (
                <p
                  role="alert"
                  className="mb-4 rounded-xl border border-destructive/20 bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
                >
                  {getErrorMessage(remove.error)}
                </p>
              )}
              <ul className="grid grid-cols-1 gap-3">
                {reports.map((report) => (
                  <li key={report.id}>
                    <AiReportCard
                      report={report}
                      onDelete={() => setPendingDeleteId(report.id)}
                    />
                  </li>
                ))}
              </ul>
              {pagination && (
                <div className="mt-5">
                  <Pagination
                    {...paginationFromApi(pagination)}
                    onPageChange={setCurrentPage}
                    disabled={isFetching || remove.isPending}
                  />
                </div>
              )}
            </div>
          )}
        </SectionPanel>
      )}

      <ConfirmDialog
        open={pendingDeleteId != null}
        onOpenChange={(open) => {
          if (!open && !remove.isPending) {
            setPendingDeleteId(null);
          }
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
