import { useEffect, useState, type FormEvent } from "react";
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
      setFormError("Name is required");
      return;
    }

    try {
      setFormError(null);
      await createMutation.mutateAsync({ name: trimmedName });
      setCurrentPage(1);
      closeCreate();
    } catch (error) {
      setFormError(getCatalogErrorMessage(error, "Failed to add condition"));
    }
  }

  return (
    <CatalogManager<ConditionCatalog>
      title="Conditions"
      description="Shared condition catalog used by patient health profiles."
      columns={[
        {
          header: "Name",
          cell: (item) => <span className="font-medium">{item.name}</span>,
        },
      ]}
      items={listQuery.data?.data ?? []}
      isLoading={listQuery.isLoading}
      isError={listQuery.isError}
      errorMessage={
        listQuery.isError
          ? getCatalogErrorMessage(listQuery.error, "Failed to load conditions")
          : null
      }
      pagination={listQuery.data?.pagination ?? null}
      search={search}
      onSearchChange={setSearch}
      onPageChange={setCurrentPage}
      createTitle="Add condition"
      createOpen={createOpen}
      onCreateOpen={() => {
        resetForm();
        setCreateOpen(true);
      }}
      onCreateClose={closeCreate}
      formError={formError}
      isCreating={createMutation.isPending}
      onCreateSubmit={onCreateSubmit}
      emptyLabel="No conditions in the catalog yet."
      getRowKey={(item) => item.id}
      createForm={
        <div className="space-y-2">
          <Label htmlFor="condition-name">Name</Label>
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
