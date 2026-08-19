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
  useAdminClinics,
  useCreateAdminClinic,
} from "../../hooks/admin/useAdminCatalogs";
import type { Clinic } from "../../lib/admin/clinics/types";

export function AdminClinics() {
  const { t } = useTranslation();
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
      setFormError(t("admin.validation.clinicRequired"));
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
      setFormError(getCatalogErrorMessage(error, t("admin.errors.addClinic")));
    }
  }

  return (
    <CatalogManager<Clinic>
      title={t("admin.catalogs.clinics.title")}
      description={t("admin.catalogs.clinics.description")}
      columns={[
        {
          header: t("admin.fields.name"),
          cell: (item) => <span className="font-medium">{item.name}</span>,
        },
        {
          header: t("admin.fields.address"),
          cell: (item) => item.address,
        },
        {
          header: t("admin.fields.phone"),
          cell: (item) => item.phone,
        },
      ]}
      items={listQuery.data?.data ?? []}
      isLoading={listQuery.isLoading}
      isError={listQuery.isError}
      errorMessage={
        listQuery.isError
          ? getCatalogErrorMessage(listQuery.error, t("admin.errors.loadClinics"))
          : null
      }
      pagination={listQuery.data?.pagination ?? null}
      search={search}
      onSearchChange={setSearch}
      onPageChange={setCurrentPage}
      createTitle={t("admin.catalogs.clinics.title")}
      createOpen={createOpen}
      onCreateOpen={() => {
        resetForm();
        setCreateOpen(true);
      }}
      onCreateClose={closeCreate}
      formError={formError}
      isCreating={createMutation.isPending}
      onCreateSubmit={onCreateSubmit}
      emptyLabel={t("admin.catalogs.clinics.empty")}
      getRowKey={(item) => item.id}
      createForm={
        <>
          <div className="space-y-2">
            <Label htmlFor="clinic-name">{t("admin.fields.name")}</Label>
            <Input
              id="clinic-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clinic-address">{t("admin.fields.address")}</Label>
            <Input
              id="clinic-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clinic-phone">{t("admin.fields.phone")}</Label>
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
