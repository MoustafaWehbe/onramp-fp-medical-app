import { useEffect, useState, type FormEvent } from "react";
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
      setFormError("Name is required");
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
      setFormError(getCatalogErrorMessage(error, "Failed to add symptom"));
    }
  }

  return (
    <CatalogManager<SymptomCatalog>
      title="Symptoms"
      description="Shared symptom catalog used by patient tracking and autocomplete."
      columns={[
        {
          header: "Name",
          cell: (item) => <span className="font-medium">{item.name}</span>,
        },
        {
          header: "Category",
          cell: (item) => item.category || "—",
        },
      ]}
      items={listQuery.data?.data ?? []}
      isLoading={listQuery.isLoading}
      isError={listQuery.isError}
      errorMessage={
        listQuery.isError
          ? getCatalogErrorMessage(listQuery.error, "Failed to load symptoms")
          : null
      }
      pagination={listQuery.data?.pagination ?? null}
      search={search}
      onSearchChange={setSearch}
      onPageChange={setCurrentPage}
      createTitle="Add symptom"
      createOpen={createOpen}
      onCreateOpen={() => {
        resetForm();
        setCreateOpen(true);
      }}
      onCreateClose={closeCreate}
      formError={formError}
      isCreating={createMutation.isPending}
      onCreateSubmit={onCreateSubmit}
      emptyLabel="No symptoms in the catalog yet."
      getRowKey={(item) => item.id}
      createForm={
        <>
          <div className="space-y-2">
            <Label htmlFor="symptom-name">Name</Label>
            <Input
              id="symptom-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="symptom-category">Category</Label>
            <Input
              id="symptom-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Optional"
            />
          </div>
        </>
      }
    />
  );
}
