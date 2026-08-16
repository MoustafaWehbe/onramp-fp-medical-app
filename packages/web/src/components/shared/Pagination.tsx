import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Pagination as ApiPagination } from "../../lib/api/types";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onNext?: () => void;
  onPrev?: () => void;
  onPageChange?: (page: number) => void;
  totalCount?: number;
  pageSize?: number;
  hideWhenSinglePage?: boolean;
  showSummary?: boolean;
  siblingCount?: number;
  disabled?: boolean;
  className?: string;
}

export function paginationFromApi(
  pagination: ApiPagination,
): Pick<
  PaginationProps,
  "currentPage" | "totalPages" | "totalCount" | "pageSize"
> {
  return {
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    totalCount: pagination.totalCount,
    pageSize: pagination.pageSize,
  };
}

type PageToken = number | "ellipsis-start" | "ellipsis-end";

function buildPageTokens(
  currentPage: number,
  totalPages: number,
  siblingCount: number,
): PageToken[] {
  if (totalPages <= 0) return [];
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const firstPage = 1;
  const lastPage = totalPages;
  const left = Math.max(currentPage - siblingCount, firstPage + 1);
  const right = Math.min(currentPage + siblingCount, lastPage - 1);

  const tokens: PageToken[] = [firstPage];

  if (left > firstPage + 1) {
    tokens.push("ellipsis-start");
  }

  for (let page = left; page <= right; page += 1) {
    if (page > firstPage && page < lastPage) {
      tokens.push(page);
    }
  }

  if (right < lastPage - 1) {
    tokens.push("ellipsis-end");
  }

  tokens.push(lastPage);
  return tokens;
}

export function Pagination({
  currentPage,
  totalPages,
  onNext,
  onPrev,
  onPageChange,
  totalCount,
  pageSize,
  hideWhenSinglePage = true,
  showSummary = true,
  siblingCount = 1,
  disabled = false,
  className,
}: PaginationProps) {
  if (totalPages <= 0) return null;
  if (hideWhenSinglePage && totalPages <= 1) return null;

  const canPrev = currentPage > 1 && !disabled;
  const canNext = currentPage < totalPages && !disabled;
  const pages = buildPageTokens(currentPage, totalPages, siblingCount);

  function handlePrev() {
    if (!canPrev) return;
    onPrev?.();
    if (!onPrev && onPageChange) onPageChange(currentPage - 1);
  }

  function handleNext() {
    if (!canNext) return;
    onNext?.();
    if (!onNext && onPageChange) onPageChange(currentPage + 1);
  }

  function handlePage(page: number) {
    if (disabled || page === currentPage) return;
    onPageChange?.(page);
  }

  const rangeStart =
    pageSize && totalCount != null
      ? Math.min((currentPage - 1) * pageSize + 1, totalCount)
      : null;
  const rangeEnd =
    pageSize && totalCount != null
      ? Math.min(currentPage * pageSize, totalCount)
      : null;

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        "flex flex-col items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card px-4 py-3 shadow-sm sm:flex-row",
        className,
      )}
    >
      {showSummary && (
        <p className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
          {totalCount != null && (
            <>
              <span className="mx-1.5">·</span>
              {rangeStart != null && rangeEnd != null ? (
                <>
                  {rangeStart}–{rangeEnd} of {totalCount}
                </>
              ) : (
                <>{totalCount} total</>
              )}
            </>
          )}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label="Previous page"
          disabled={!canPrev}
          onClick={handlePrev}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>

        {pages.map((token) => {
          if (token === "ellipsis-start" || token === "ellipsis-end") {
            return (
              <span
                key={token}
                className="px-2 text-sm text-muted-foreground"
                aria-hidden
              >
                …
              </span>
            );
          }

          const isActive = token === currentPage;
          return (
            <Button
              key={token}
              type="button"
              variant={isActive ? "default" : "outline"}
              size="sm"
              aria-label={`Page ${token}`}
              aria-current={isActive ? "page" : undefined}
              disabled={disabled}
              className="min-w-9 px-2"
              onClick={() => handlePage(token)}
            >
              {token}
            </Button>
          );
        })}

        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label="Next page"
          disabled={!canNext}
          onClick={handleNext}
        >
          Next
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}
