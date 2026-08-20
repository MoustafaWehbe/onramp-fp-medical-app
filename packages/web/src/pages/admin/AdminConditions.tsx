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
  useAdminConditions,
  useCreateAdminCondition,
} from "../../hooks/admin/useAdminCatalogs";
import type { ConditionCatalog } from "../../lib/health/conditions/types";

export function AdminConditions() {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [createOpen, setCreateOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [name, setName] = useState("");

  const listQuery = useAdminConditions(currentPage, debouncedSearch);
  const createMutation = useCreateAdminCondition();

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  function resetForm() {
    setName("");
    setFormError(null);
  }

  function closeCreate() {
    setCreateOpen(false);
    resetForm();
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
      await createMutation.mutateAsync({ name: trimmedName });
      setCurrentPage(1);
      closeCreate();
    } catch (error) {
      setFormError(getCatalogErrorMessage(error, t("admin.errors.addCondition")));
    }
  }

  return (
    <CatalogManager<ConditionCatalog>
      title={t("admin.catalogs.conditions.title")}
      description={t("admin.catalogs.conditions.description")}
      columns={[
        {
          header: t("admin.fields.name"),
          cell: (item) => <span className="font-medium">{item.name}</span>,
        },
      ]}
      items={listQuery.data?.data ?? []}
      isLoading={listQuery.isLoading}
      isError={listQuery.isError}
      errorMessage={
        listQuery.isError
          ? getCatalogErrorMessage(listQuery.error, t("admin.errors.loadConditions"))
          : null
      }
      pagination={listQuery.data?.pagination ?? null}
      search={search}
      onSearchChange={setSearch}
      onPageChange={setCurrentPage}
      createTitle={t("admin.catalogs.conditions.title")}
      createOpen={createOpen}
      onCreateOpen={() => {
        resetForm();
        setCreateOpen(true);
      }}
      onCreateClose={closeCreate}
      formError={formError}
      isCreating={createMutation.isPending}
      onCreateSubmit={onCreateSubmit}
      emptyLabel={t("admin.catalogs.conditions.empty")}
      getRowKey={(item) => item.id}
      createForm={
        <div className="space-y-2">
          <Label htmlFor="condition-name">{t("admin.fields.name")}</Label>
          <Input
            id="condition-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
      }
    />
  );
}
