import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Database, Plus, Search,X } from "lucide-react";
import { isAxiosError } from "axios";
import { useTranslation } from "react-i18next";
import type { Pagination as ApiPagination } from "../../lib/api/types";
import { AsidePanel } from "../shared/AsidePanel";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import {
  Pagination,
  paginationFromApi,
} from "../shared/Pagination";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { PageHeader } from "../shared/PageHeader";

export interface CatalogColumn<T> {
  header: string;
  cell: (item: T) => ReactNode;
}

interface CatalogManagerProps<T> {
  title: string;
  description: string;
  columns: CatalogColumn<T>[];
  items: T[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string | null;
  pagination: ApiPagination | null;
  search: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  createTitle: string;
  createForm: ReactNode;
  createOpen: boolean;
  onCreateOpen: () => void;
  onCreateClose: () => void;
  formError: string | null;
  isCreating: boolean;
  onCreateSubmit: (event: FormEvent<HTMLFormElement>) => void;
  emptyLabel: string;
  getRowKey: (item: T) => string;

  sortBy: "name" | "createdAt";
  sortOrder: "asc" | "desc";
  onSortByChange: (value: "name" | "createdAt") => void;
  onSortOrderChange: (value: "asc" | "desc") => void;

  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onClearFilters: () => void;
}

export function getCatalogErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { error?: string } | undefined;
    if (data?.error) return data.error;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export function useDebouncedValue(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function CatalogManager<T>({
  title,
  description,
  columns,
  items,
  isLoading,
  isError,
  errorMessage,
  pagination,
  search,
  onSearchChange,
  onPageChange,
  createTitle,
  createForm,
  createOpen,
  onCreateOpen,
  onCreateClose,
  formError,
  isCreating,
  onCreateSubmit,
  emptyLabel,
  getRowKey,
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onClearFilters

}: CatalogManagerProps<T>) {
  const totalCount = pagination?.totalCount ?? 0;
  const { t } = useTranslation();

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow={t("admin.referenceCatalog")}
        title={title}
        description={description}
        icon={Database}
        action={(
          <Button type="button" className="w-full sm:w-auto" onClick={onCreateOpen}>
            <Plus className="mr-1.5 h-4 w-4" aria-hidden />
            {t("admin.addRecord")}
          </Button>
        )}
      />

      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t("admin.searchCatalog")}
          className="pl-9"
        />
      </div>
       
  <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
   <div className="space-y-1">
    <label  htmlFor="admin-sort-by" className="text-sm font-medium">
      {t("admin.sortBy")}
    </label>

    <select
      id="admin-sort-by"
      value={sortBy}
      onChange={(event) =>
        onSortByChange(
          event.target.value as "name" | "createdAt",
        )
      }
      className="h-10 rounded-md border bg-background px-3 text-sm"
    >
      <option value="name">{t("admin.fields.name")}</option>
      <option value="createdAt">{t("admin.createdAt")}</option>
    </select>
  </div>

  <div className="space-y-1">
    <label htmlFor="admin-sort-order" className="text-sm font-medium">
      {t("admin.sortOrder")}
    </label>

    <select
      id="admin-sort-order"
      value={sortOrder}
      onChange={(event) =>
        onSortOrderChange(
          event.target.value as "asc" | "desc",
        )
      }
      className="h-10 rounded-md border bg-background px-3 text-sm"
    >
      <option value="asc">{t("admin.ascending")}</option>
      <option value="desc">{t("admin.descending")}</option>
    </select>
  </div>

  <div className="space-y-1">
    <label htmlFor="admin-date-from" className="text-sm font-medium">
      {t("admin.dateFrom")}
    </label>

    <Input
      id="admin-date-from"
      type="date"
      value={dateFrom}
      onChange={(event) => onDateFromChange(event.target.value)}
    />
  </div>

  <div className="space-y-1">
    <label htmlFor="admin-date-to" className="text-sm font-medium">
      {t("admin.dateTo")}
    </label>

    <Input
      id="admin-date-to"
      type="date"
      value={dateTo}
      onChange={(event) => onDateToChange(event.target.value)}
    />
  </div>

  <Button
    type="button"
    variant="outline"
    onClick={onClearFilters}
  >
    <X className="mr-1.5 h-4 w-4" />
    {t("admin.clearFilters")}
  </Button>
</div>

      {(isError || errorMessage) && (
        <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/10 px-3.5 py-3 text-sm text-destructive">
          {errorMessage ?? t("admin.failedLoadCatalog")}
        </p>
      )}

      {isLoading && (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="rounded-2xl border border-dashed bg-card px-6 py-16 text-center text-sm text-muted-foreground shadow-soft">
          {emptyLabel}
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-border/80 bg-card shadow-soft">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.header}
                    className="px-4 py-3 font-medium text-muted-foreground"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={getRowKey(item)} className="border-b transition-colors hover:bg-muted/40 last:border-0">
                  {columns.map((column) => (
                    <td key={column.header} className="px-4 py-3 align-top">
                      {column.cell(item)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && totalCount > 0 && (
        <Pagination
          {...paginationFromApi(pagination)}
          onPageChange={onPageChange}
        />
      )}

      <AsidePanel open={createOpen} onClose={onCreateClose} title={createTitle}>
        <form className="space-y-4" onSubmit={onCreateSubmit}>
          {formError && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </p>
          )}
          {createForm}
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isCreating}>
              {isCreating ? t("admin.saving") : t("admin.save")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCreateClose}
              disabled={isCreating}
            >
              {t("admin.cancel")}
            </Button>
          </div>
        </form>
      </AsidePanel>
    </div>
  );
}
