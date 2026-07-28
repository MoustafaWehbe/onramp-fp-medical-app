import { useEffect, useState, type FormEvent } from "react";
import {
  CatalogManager,
  getCatalogErrorMessage,
  useDebouncedValue,
} from "../../components/admin/CatalogManager";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  useAdminDoctors,
  useCreateAdminDoctor,
} from "../../hooks/admin/useAdminCatalogs";
import type { Doctor } from "../../lib/admin/doctors/types";

export function AdminDoctors() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [createOpen, setCreateOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [phone, setPhone] = useState("");

  const listQuery = useAdminDoctors(currentPage, debouncedSearch);
  const createMutation = useCreateAdminDoctor();

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  function resetForm() {
    setName("");
    setSpecialty("");
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
    const trimmedSpecialty = specialty.trim();
    const trimmedPhone = phone.trim();
    if (!trimmedName || !trimmedSpecialty || !trimmedPhone) {
      setFormError("Name, specialty, and phone are required");
      return;
    }

    try {
      setFormError(null);
      await createMutation.mutateAsync({
        name: trimmedName,
        specialty: trimmedSpecialty,
        phone: trimmedPhone,
      });
      setCurrentPage(1);
      closeCreate();
    } catch (error) {
      setFormError(getCatalogErrorMessage(error, "Failed to add doctor"));
    }
  }

  return (
    <CatalogManager<Doctor>
      title="Doctors"
      description="Doctor directory patients can link from their provider list."
      columns={[
        {
          header: "Name",
          cell: (item) => <span className="font-medium">{item.name}</span>,
        },
        {
          header: "Specialty",
          cell: (item) => item.specialty,
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
          ? getCatalogErrorMessage(listQuery.error, "Failed to load doctors")
          : null
      }
      pagination={listQuery.data?.pagination ?? null}
      search={search}
      onSearchChange={setSearch}
      onPageChange={setCurrentPage}
      createTitle="Add doctor"
      createOpen={createOpen}
      onCreateOpen={() => {
        resetForm();
        setCreateOpen(true);
      }}
      onCreateClose={closeCreate}
      formError={formError}
      isCreating={createMutation.isPending}
      onCreateSubmit={onCreateSubmit}
      emptyLabel="No doctors in the catalog yet."
      getRowKey={(item) => item.id}
      createForm={
        <>
          <div className="space-y-2">
            <Label htmlFor="doctor-name">Name</Label>
            <Input
              id="doctor-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="doctor-specialty">Specialty</Label>
            <Input
              id="doctor-specialty"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="doctor-phone">Phone</Label>
            <Input
              id="doctor-phone"
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
