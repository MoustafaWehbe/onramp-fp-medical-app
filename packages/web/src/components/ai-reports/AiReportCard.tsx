import { useNavigate } from "react-router-dom";
import { CalendarRange, Eye, FileText, Trash2 } from "lucide-react";
import type { AiReport } from "../../lib/ai-reports/ai-reports-exports";
import { cn } from "../../lib/utils";
import { RowActionsMenu } from "../shared/RowActionsMenu";
import { formatReportDate } from "./formatReportDate";

interface AiReportCardProps {
  report: AiReport;
  onDelete: () => void;
}

export function AiReportCard({ report, onDelete }: AiReportCardProps) {
  const navigate = useNavigate();
  const summary =
    typeof report.reportContent?.summary === "string"
      ? report.reportContent.summary
      : null;
  const rangeLabel = `${formatReportDate(report.dateRangeStart)} – ${formatReportDate(report.dateRangeEnd)}`;

  function openReport() {
    navigate(`/ai-reports/${report.id}`);
  }

  return (
    <article
      className={cn(
        "group flex items-start gap-1 rounded-2xl border border-border/80 bg-card p-2 pl-4 shadow-soft transition-[border-color,box-shadow,transform] duration-200",
        "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lift",
      )}
    >
      <button
        type="button"
        onClick={openReport}
        aria-label={`View report for ${rangeLabel}`}
        className="flex min-w-0 flex-1 cursor-pointer gap-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
          <FileText className="h-5 w-5" aria-hidden />
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="truncate font-semibold leading-tight tracking-tight">
              {rangeLabel}
            </h3>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarRange className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Created {formatReportDate(report.createdAt)}
            </span>
          </div>

          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
            {summary ?? "No summary available for this report."}
          </p>
        </div>
      </button>

      <RowActionsMenu
        label={`Actions for report ${rangeLabel}`}
        actions={[
          {
            id: "view",
            label: "View",
            icon: Eye,
            onSelect: openReport,
          },
          {
            id: "delete",
            label: "Delete",
            icon: Trash2,
            variant: "destructive",
            onSelect: onDelete,
          },
        ]}
      />
    </article>
  );
}
