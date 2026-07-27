import { useEffect, useState, type FormEvent } from "react";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [createOpen, setCreateOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [strength, setStrength] = useState("");

  const listQuery = useAdminMedications(currentPage, debouncedSearch);
  const createMutation = useCreateAdminMedication();

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  function resetForm() {
    setName("");
    setStrength("");
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
        ...(strength.trim() ? { strength: strength.trim() } : {}),
      });
      setCurrentPage(1);
      closeCreate();
    } catch (error) {
      setFormError(getCatalogErrorMessage(error, "Failed to add medication"));
    }
  }

  return (
    <CatalogManager<Medication>
      title="Medications"
      description="Shared medication catalog used by patient autocomplete."
      columns={[
        {
          header: "Name",
          cell: (item) => <span className="font-medium">{item.name}</span>,
        },
        {
          header: "Strength",
          cell: (item) => item.strength || "—",
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
          ? getCatalogErrorMessage(listQuery.error, "Failed to load medications")
          : null
      }
      pagination={listQuery.data?.pagination ?? null}
      search={search}
      onSearchChange={setSearch}
      onPageChange={setCurrentPage}
      createTitle="Add medication"
      createOpen={createOpen}
      onCreateOpen={() => {
        resetForm();
        setCreateOpen(true);
      }}
      onCreateClose={closeCreate}
      formError={formError}
      isCreating={createMutation.isPending}
      onCreateSubmit={onCreateSubmit}
      emptyLabel="No medications in the catalog yet."
      getRowKey={(item) => item.id}
      createForm={
        <>
          <div className="space-y-2">
            <Label htmlFor="med-name">Name</Label>
            <Input
              id="med-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Category is looked up automatically from OpenFDA when saved.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="med-strength">Strength</Label>
            <Input
              id="med-strength"
              value={strength}
              onChange={(e) => setStrength(e.target.value)}
              placeholder="Optional"
            />
          </div>
        </>
      }
    />
  );
}
