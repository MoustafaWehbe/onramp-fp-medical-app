import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  CatalogManager,
  getCatalogErrorMessage,
  useDebouncedValue,
} from "../../components/admin/CatalogManager";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  useAdminMedications,
  useCreateAdminMedication,
} from "../../hooks/admin/useAdminCatalogs";
import type { Medication } from "../../lib/health/health-export";

export function AdminMedications() {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [sortBy, setSortBy] =
  useState<"name" | "createdAt">("name");
  const [sortOrder, setSortOrder] =
  useState<"asc" | "desc">("asc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [strength, setStrength] = useState("");

  const listQuery = useAdminMedications(currentPage, debouncedSearch,sortBy,sortOrder,dateFrom,dateTo);
  const createMutation = useCreateAdminMedication();

  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedSearch,
    sortBy,
    sortOrder,
    dateFrom,
    dateTo,
  ]);

  function resetForm() {
    setName("");
    setStrength("");
    setFormError(null);
  }

  function closeCreate() {
    setCreateOpen(false);
    resetForm();
  }

    function clearFilters() {
    setSearch("");
    setSortBy("name");
    setSortOrder("asc");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  }

  async function onCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setFormError(t("admin.validation.nameRequired"));
      return;
    }

    try {
      setFormError(null);
      await createMutation.mutateAsync({
        name: trimmedName,
        ...(strength.trim() ? { strength: strength.trim() } : {}),
      });
      setCurrentPage(1);
      closeCreate();
    } catch (error) {
      setFormError(getCatalogErrorMessage(error, t("admin.errors.addMedication")));
    }
  }

  return (
    <CatalogManager<Medication>
      title={t("admin.catalogs.medications.title")}
      description={t("admin.catalogs.medications.description")}
      columns={[
        {
          header: t("admin.fields.name"),
          cell: (item) => <span className="font-medium">{item.name}</span>,
        },
        {
          header: t("admin.fields.strength"),
          cell: (item) => item.strength || "—",
        },
        {
          header: t("admin.fields.category"),
          cell: (item) => item.category || "—",
        },
      ]}
      items={listQuery.data?.data ?? []}
      isLoading={listQuery.isLoading}
      isError={listQuery.isError}
      errorMessage={
        listQuery.isError
          ? getCatalogErrorMessage(listQuery.error, t("admin.errors.loadMedications"))
          : null
      }
      pagination={listQuery.data?.pagination ?? null}
      search={search}
      onSearchChange={setSearch}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSortByChange={setSortBy}
      onSortOrderChange={setSortOrder}
      dateFrom={dateFrom}
      dateTo={dateTo}
      onDateFromChange={setDateFrom}
      onDateToChange={setDateTo}
      onClearFilters={clearFilters}
      onPageChange={setCurrentPage}
      createTitle={t("admin.catalogs.medications.title")}
      createOpen={createOpen}
      onCreateOpen={() => {
        resetForm();
        setCreateOpen(true);
      }}
      onCreateClose={closeCreate}
      formError={formError}
      isCreating={createMutation.isPending}
      onCreateSubmit={onCreateSubmit}
      emptyLabel={t("admin.catalogs.medications.empty")}
      getRowKey={(item) => item.id}
      createForm={
        <>
          <div className="space-y-2">
            <Label htmlFor="med-name">{t("admin.fields.name")}</Label>
            <Input
              id="med-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              {t("admin.fields.openFdaCategory")}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="med-strength">{t("admin.fields.strength")}</Label>
            <Input
              id="med-strength"
              value={strength}
              onChange={(e) => setStrength(e.target.value)}
              placeholder={t("admin.fields.optional")}
            />
          </div>
        </>
      }
    />
  );
}
