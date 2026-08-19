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
  useAdminSymptoms,
  useCreateAdminSymptom,
} from "../../hooks/admin/useAdminCatalogs";
import type { SymptomCatalog } from "../../lib/health/symptoms/types";

export function AdminSymptoms() {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [createOpen, setCreateOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");

  const listQuery = useAdminSymptoms(currentPage, debouncedSearch);
  const createMutation = useCreateAdminSymptom();

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  function resetForm() {
    setName("");
    setCategory("");
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
      await createMutation.mutateAsync({
        name: trimmedName,
        ...(category.trim() ? { category: category.trim() } : {}),
      });
      setCurrentPage(1);
      closeCreate();
    } catch (error) {
      setFormError(getCatalogErrorMessage(error, t("admin.errors.addSymptom")));
    }
  }

  return (
    <CatalogManager<SymptomCatalog>
      title={t("admin.catalogs.symptoms.title")}
      description={t("admin.catalogs.symptoms.description")}
      columns={[
        {
          header: t("admin.fields.name"),
          cell: (item) => <span className="font-medium">{item.name}</span>,
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
          ? getCatalogErrorMessage(listQuery.error, t("admin.errors.loadSymptoms"))
          : null
      }
      pagination={listQuery.data?.pagination ?? null}
      search={search}
      onSearchChange={setSearch}
      onPageChange={setCurrentPage}
      createTitle={t("admin.catalogs.symptoms.title")}
      createOpen={createOpen}
      onCreateOpen={() => {
        resetForm();
        setCreateOpen(true);
      }}
      onCreateClose={closeCreate}
      formError={formError}
      isCreating={createMutation.isPending}
      onCreateSubmit={onCreateSubmit}
      emptyLabel={t("admin.catalogs.symptoms.empty")}
      getRowKey={(item) => item.id}
      createForm={
        <>
          <div className="space-y-2">
            <Label htmlFor="symptom-name">{t("admin.fields.name")}</Label>
            <Input
              id="symptom-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="symptom-category">{t("admin.fields.category")}</Label>
            <Input
              id="symptom-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder={t("admin.fields.optional")}
            />
          </div>
        </>
      }
    />
  );
}
