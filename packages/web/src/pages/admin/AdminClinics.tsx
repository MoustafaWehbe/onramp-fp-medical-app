import { useEffect, useState, type FormEvent } from "react";
import {
  CatalogManager,
  getCatalogErrorMessage,
  useDebouncedValue,
} from "../../components/admin/CatalogManager";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  useAdminClinics,
  useCreateAdminClinic,
} from "../../hooks/admin/useAdminCatalogs";
import type { Clinic } from "../../lib/admin/clinics/types";

export function AdminClinics() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [createOpen, setCreateOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const listQuery = useAdminClinics(currentPage, debouncedSearch);
  const createMutation = useCreateAdminClinic();

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  function resetForm() {
    setName("");
    setAddress("");
    setPhone("");
    setFormError(null);
  }

  function closeCreate() {
    setCreateOpen(false);
    resetForm();
  }

  async function onCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedAddress = address.trim();
    const trimmedPhone = phone.trim();
    if (!trimmedName || !trimmedAddress || !trimmedPhone) {
      setFormError("Name, address, and phone are required");
      return;
    }

    try {
      setFormError(null);
      await createMutation.mutateAsync({
        name: trimmedName,
        address: trimmedAddress,
        phone: trimmedPhone,
      });
      setCurrentPage(1);
      closeCreate();
    } catch (error) {
      setFormError(getCatalogErrorMessage(error, "Failed to add clinic"));
    }
  }

  return (
    <CatalogManager<Clinic>
      title="Clinics"
      description="Clinic directory patients can link from their provider list."
      columns={[
        {
          header: "Name",
          cell: (item) => <span className="font-medium">{item.name}</span>,
        },
        {
          header: "Address",
          cell: (item) => item.address,
        },
        {
          header: "Phone",
          cell: (item) => item.phone,
        },
      ]}
      items={listQuery.data?.data ?? []}
      isLoading={listQuery.isLoading}
      isError={listQuery.isError}
      errorMessage={
        listQuery.isError
          ? getCatalogErrorMessage(listQuery.error, "Failed to load clinics")
          : null
      }
      pagination={listQuery.data?.pagination ?? null}
      search={search}
      onSearchChange={setSearch}
      onPageChange={setCurrentPage}
      createTitle="Add clinic"
      createOpen={createOpen}
      onCreateOpen={() => {
        resetForm();
        setCreateOpen(true);
      }}
      onCreateClose={closeCreate}
      formError={formError}
      isCreating={createMutation.isPending}
      onCreateSubmit={onCreateSubmit}
      emptyLabel="No clinics in the catalog yet."
      getRowKey={(item) => item.id}
      createForm={
        <>
          <div className="space-y-2">
            <Label htmlFor="clinic-name">Name</Label>
            <Input
              id="clinic-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clinic-address">Address</Label>
            <Input
              id="clinic-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clinic-phone">Phone</Label>
            <Input
              id="clinic-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
        </>
      }
    />
  );
}
