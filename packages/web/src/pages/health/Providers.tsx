import { useRef } from "react";
import { Building2, ClipboardList, Plus, Stethoscope } from "lucide-react";
import {
  ClinicCard,
  ClinicDetail,
} from "../../components/health/providers/ClinicCard";
import { ClinicForm } from "../../components/health/providers/ClinicForm";
import {
  DoctorCard,
  DoctorDetail,
} from "../../components/health/providers/DoctorCard";
import { DoctorForm } from "../../components/health/providers/DoctorForm";
import { AsidePanel } from "../../components/shared/AsidePanel";
import { LoadingSpinner } from "../../components/shared/LoadingSpinner";
import {
  Pagination,
  paginationFromApi,
} from "../../components/shared/Pagination";
import { Button } from "../../components/ui/button";
import {
  ClinicsProvider,
  useClinicsContext,
} from "../../providers/ClinicsProvider";
import {
  DoctorsProvider,
  useDoctorsContext,
} from "../../providers/DoctorsProvider";

function ClinicsSection() {
  const {
    clinics,
    isLoading,
    isError,
    isSuccess,
    listErrorMessage,
    pagination,
    goToNextPage,
    goToPrevPage,
    goToPage,
    panel,
    panelOpen,
    panelTitle,
    formError,
    isRemoving,
    openCreate,
    openEdit,
    closePanel,
    remove,
  } = useClinicsContext();

  const totalCount = pagination?.totalCount ?? 0;

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight">Clinics</h2>
            {isSuccess && (
              <span className="inline-flex items-center gap-1.5 rounded-full border bg-secondary/80 px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                <ClipboardList className="h-3.5 w-3.5" aria-hidden />
                {totalCount}{" "}
                {totalCount === 1 ? "clinic" : "clinics"}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Saved clinics and medical facilities.
          </p>
        </div>
        <Button type="button" className="shrink-0 self-start sm:self-auto" onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add clinic
        </Button>
      </div>

      {listErrorMessage && (
        <p className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {listErrorMessage}
        </p>
      )}

      {isLoading && (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      )}

      {isSuccess && clinics.length === 0 && (
        <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Building2 className="h-6 w-6" aria-hidden />
          </div>
          <p className="font-medium">No clinics yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Add a clinic to your saved list. Search the catalog by name.
          </p>
          <Button type="button" className="mt-4" onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add clinic
          </Button>
        </div>
      )}

      {isSuccess && clinics.length > 0 && (
        <ul className="mt-4 grid grid-cols-1 gap-3">
          {clinics.map((clinic) => (
            <li key={clinic.id} className="min-h-0">
              <ClinicCard clinic={clinic} />
            </li>
          ))}
        </ul>
      )}

      {isError && !listErrorMessage && (
        <p className="mt-4 text-sm text-destructive">Failed to load clinics</p>
      )}

      {isSuccess && pagination && (
        <div className="mt-4">
          <Pagination
            {...paginationFromApi(pagination)}
            onNext={goToNextPage}
            onPrev={goToPrevPage}
            onPageChange={goToPage}
          />
        </div>
      )}

      <AsidePanel
        open={panelOpen}
        onClose={closePanel}
        title={panelTitle}
        onEdit={
          panel.kind === "detail"
            ? () => openEdit(panel.clinic)
            : undefined
        }
        onDelete={
          panel.kind === "detail"
            ? () => void remove(panel.clinic.id)
            : undefined
        }
        deleteDisabled={isRemoving}
      >
        {formError && (
          <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </p>
        )}

        {panel.kind === "detail" && <ClinicDetail />}
        {(panel.kind === "create" || panel.kind === "edit") && (
          <ClinicForm />
        )}
      </AsidePanel>
    </section>
  );
}

function DoctorsSection() {
  const {
    doctors,
    isLoading,
    isError,
    isSuccess,
    listErrorMessage,
    pagination,
    goToNextPage,
    goToPrevPage,
    goToPage,
    panel,
    panelOpen,
    panelTitle,
    formError,
    isRemoving,
    openCreate,
    openEdit,
    closePanel,
    remove,
  } = useDoctorsContext();

  const totalCount = pagination?.totalCount ?? 0;

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight">Doctors</h2>
            {isSuccess && (
              <span className="inline-flex items-center gap-1.5 rounded-full border bg-secondary/80 px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                <ClipboardList className="h-3.5 w-3.5" aria-hidden />
                {totalCount}{" "}
                {totalCount === 1 ? "doctor" : "doctors"}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Saved doctors and healthcare providers.
          </p>
        </div>
        <Button type="button" className="shrink-0 self-start sm:self-auto" onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add doctor
        </Button>
      </div>

      {listErrorMessage && (
        <p className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {listErrorMessage}
        </p>
      )}

      {isLoading && (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      )}

      {isSuccess && doctors.length === 0 && (
        <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Stethoscope className="h-6 w-6" aria-hidden />
          </div>
          <p className="font-medium">No doctors yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Add a doctor to your saved list. Search the catalog by name.
          </p>
          <Button type="button" className="mt-4" onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add doctor
          </Button>
        </div>
      )}

      {isSuccess && doctors.length > 0 && (
        <ul className="mt-4 grid grid-cols-1 gap-3">
          {doctors.map((doctor) => (
            <li key={doctor.id} className="min-h-0">
              <DoctorCard doctor={doctor} />
            </li>
          ))}
        </ul>
      )}

      {isError && !listErrorMessage && (
        <p className="mt-4 text-sm text-destructive">Failed to load doctors</p>
      )}

      {isSuccess && pagination && (
        <div className="mt-4">
          <Pagination
            {...paginationFromApi(pagination)}
            onNext={goToNextPage}
            onPrev={goToPrevPage}
            onPageChange={goToPage}
          />
        </div>
      )}

      <AsidePanel
        open={panelOpen}
        onClose={closePanel}
        title={panelTitle}
        onEdit={
          panel.kind === "detail"
            ? () => openEdit(panel.doctor)
            : undefined
        }
        onDelete={
          panel.kind === "detail"
            ? () => void remove(panel.doctor.id)
            : undefined
        }
        deleteDisabled={isRemoving}
      >
        {formError && (
          <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </p>
        )}

        {panel.kind === "detail" && <DoctorDetail />}
        {(panel.kind === "create" || panel.kind === "edit") && (
          <DoctorForm />
        )}
      </AsidePanel>
    </section>
  );
}

function ProvidersContent() {
  const clinicsCloseRef = useRef<(() => void) | null>(null);
  const doctorsCloseRef = useRef<(() => void) | null>(null);

  return (
    <ClinicsProvider
      onActivate={() => doctorsCloseRef.current?.()}
      panelCloseRef={clinicsCloseRef}
    >
      <DoctorsProvider
        onActivate={() => clinicsCloseRef.current?.()}
        panelCloseRef={doctorsCloseRef}
      >
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Providers</h1>
            <p className="text-muted-foreground">
              Manage your saved clinics and doctors in one place.
            </p>
          </div>

          <div className="grid gap-8 xl:grid-cols-2">
            <ClinicsSection />
            <DoctorsSection />
          </div>
        </div>
      </DoctorsProvider>
    </ClinicsProvider>
  );
}

export function Providers() {
  return <ProvidersContent />;
}
