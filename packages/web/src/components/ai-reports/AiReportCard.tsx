import { Link } from "react-router-dom";
import { CalendarRange, ChevronRight, Trash2 } from "lucide-react";
import type { AiReport } from "../../lib/ai-reports/ai-reports-exports";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";

interface AiReportCardProps {
  report: AiReport;
  className?: string;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

function formatDate(value: string): string {
  const date = new Date(
    value.includes("T") ? value : `${value}T00:00:00`,
  );
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function AiReportCard({
  report,
  className,
  onDelete,
  isDeleting = false,
}: AiReportCardProps) {
  const summary =
    typeof report.reportContent?.summary === "string"
      ? report.reportContent.summary
      : null;

  return (
    <article
      className={cn(
        "rounded-lg border bg-card p-5 text-card-foreground shadow-sm transition hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-xs text-muted-foreground">
            Created {formatDate(report.createdAt)}
          </p>

          <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <CalendarRange className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span>
              {formatDate(report.dateRangeStart)} –{" "}
              {formatDate(report.dateRangeEnd)}
            </span>
          </h3>

          {summary ? (
            <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
              {summary}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              No summary available for this report.
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {onDelete && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={isDeleting}
              aria-label="Delete report"
              onClick={() => onDelete(report.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
          <Link
            to={`/ai-reports/${report.id}`}
            className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            View
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
