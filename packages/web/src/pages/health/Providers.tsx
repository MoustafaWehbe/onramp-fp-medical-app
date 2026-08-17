import { useRef, useState, type KeyboardEvent } from "react";
import { Building2, ClipboardList, Plus, Stethoscope } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
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
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { LoadingSpinner } from "../../components/shared/LoadingSpinner";
import {
  Pagination,
  paginationFromApi,
} from "../../components/shared/Pagination";
import { Button } from "../../components/ui/button";
import { PageHeader } from "../../components/shared/PageHeader";
import { SectionPanel } from "../../components/shared/SectionPanel";
import {
  ClinicsProvider,
  useClinicsContext,
} from "../../providers/ClinicsProvider";
import {
  DoctorsProvider,
  useDoctorsContext,
} from "../../providers/DoctorsProvider";
import type { UserClinic, UserDoctor } from "../../lib/health/health-export";
import { cn } from "../../lib/utils";

type ProviderTab = "clinics" | "doctors";

interface ProviderTabSwitchProps {
  value: ProviderTab;
  onChange: (tab: ProviderTab) => void;
  clinicCount: number | null;
  doctorCount: number | null;
}

function ProviderTabSwitch({
  value,
  onChange,
  clinicCount,
  doctorCount,
}: ProviderTabSwitchProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const clinicsRef = useRef<HTMLButtonElement>(null);
  const doctorsRef = useRef<HTMLButtonElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const pill = pillRef.current;
      const active = value === "clinics" ? clinicsRef.current : doctorsRef.current;
      if (!root || !pill || !active) return;

      const rootBox = root.getBoundingClientRect();
      const activeBox = active.getBoundingClientRect();
      const target = {
        x: activeBox.left - rootBox.left,
        y: activeBox.top - rootBox.top,
        width: activeBox.width,
        height: activeBox.height,
      };

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(pill, target);
      });
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(pill, { ...target, duration: 0.32, ease: "power2.out" });
      });
      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [value], revertOnUpdate: false },
  );

  function handleTabListKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const next: ProviderTab = value === "clinics" ? "doctors" : "clinics";
    onChange(next);
    requestAnimationFrame(() => {
      (next === "clinics" ? clinicsRef : doctorsRef).current?.focus();
    });
  }

  return (
    <div
      ref={rootRef}
      role="tablist"
      aria-label="Provider sections"
      className="relative grid grid-cols-2 rounded-2xl border border-border/70 bg-muted/70 p-1.5 shadow-soft"
      onKeyDown={handleTabListKeyDown}
    >
      <span
        ref={pillRef}
        className="pointer-events-none absolute left-0 top-0 z-0 h-12 w-1/2 rounded-xl bg-card shadow-glow"
        aria-hidden
      />
      <button
        ref={clinicsRef}
        type="button"
        role="tab"
        id="providers-tab-clinics"
        aria-controls={value === "clinics" ? "providers-panel-clinics" : undefined}
        aria-selected={value === "clinics"}
        tabIndex={value === "clinics" ? 0 : -1}
        className={cn(
          "relative z-10 flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors",
          value === "clinics" ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        )}
        onClick={() => onChange("clinics")}
      >
        <Building2 className="h-4 w-4" aria-hidden />
        Clinics
        {clinicCount != null && (
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs tabular-nums">
            {clinicCount}
          </span>
        )}
      </button>
      <button
        ref={doctorsRef}
        type="button"
        role="tab"
        id="providers-tab-doctors"
        aria-controls={value === "doctors" ? "providers-panel-doctors" : undefined}
        aria-selected={value === "doctors"}
        tabIndex={value === "doctors" ? 0 : -1}
        className={cn(
          "relative z-10 flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors",
          value === "doctors" ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        )}
        onClick={() => onChange("doctors")}
      >
        <Stethoscope className="h-4 w-4" aria-hidden />
        Doctors
        {doctorCount != null && (
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs tabular-nums">
            {doctorCount}
          </span>
        )}
      </button>
    </div>
  );
}

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
    closePanel,
    remove,
  } = useClinicsContext();

  const [pendingDelete, setPendingDelete] = useState<UserClinic | null>(null);
  const totalCount = pagination?.totalCount ?? 0;

  async function confirmDelete() {
    if (!pendingDelete) return;
    try {
      await remove(pendingDelete.id);
      setPendingDelete(null);
    } catch {
      // Keep the confirmation dialog open after a failed remove.
    }
  }

  return (
    <SectionPanel
      title="Clinics"
      description="Saved clinics and medical facilities."
      icon={Building2}
      action={(
        <div className="flex flex-wrap items-center gap-2">
          {isSuccess && (
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-secondary/80 px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
              <ClipboardList className="h-3.5 w-3.5" aria-hidden />
              {totalCount} {totalCount === 1 ? "clinic" : "clinics"}
            </span>
          )}
          <Button type="button" className="w-full sm:w-auto" onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add clinic
          </Button>
        </div>
      )}
    >

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
              <ClinicCard
                clinic={clinic}
                onDelete={() => setPendingDelete(clinic)}
              />
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

      <ConfirmDialog
        open={pendingDelete != null}
        onOpenChange={(open) => {
          if (!open && !isRemoving) setPendingDelete(null);
        }}
        title={pendingDelete ? `Delete ${pendingDelete.clinic.name}?` : "Delete clinic?"}
        description={
          <>
            This removes the clinic from your saved providers. This cannot be undone.
            {listErrorMessage ? (
              <span className="mt-2 block text-destructive">{listErrorMessage}</span>
            ) : null}
          </>
        }
        confirmLabel="Delete"
        loading={isRemoving}
        onConfirm={confirmDelete}
      />
    </SectionPanel>
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
    closePanel,
    remove,
  } = useDoctorsContext();

  const [pendingDelete, setPendingDelete] = useState<UserDoctor | null>(null);
  const totalCount = pagination?.totalCount ?? 0;

  async function confirmDelete() {
    if (!pendingDelete) return;
    try {
      await remove(pendingDelete.id);
      setPendingDelete(null);
    } catch {
      // Keep the confirmation dialog open after a failed remove.
    }
  }

  return (
    <SectionPanel
      title="Doctors"
      description="Saved doctors and healthcare providers."
      icon={Stethoscope}
      action={(
        <div className="flex flex-wrap items-center gap-2">
          {isSuccess && (
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-secondary/80 px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
              <ClipboardList className="h-3.5 w-3.5" aria-hidden />
              {totalCount} {totalCount === 1 ? "doctor" : "doctors"}
            </span>
          )}
          <Button type="button" className="w-full sm:w-auto" onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add doctor
          </Button>
        </div>
      )}
    >

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
              <DoctorCard
                doctor={doctor}
                onDelete={() => setPendingDelete(doctor)}
              />
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

      <ConfirmDialog
        open={pendingDelete != null}
        onOpenChange={(open) => {
          if (!open && !isRemoving) setPendingDelete(null);
        }}
        title={pendingDelete ? `Delete ${pendingDelete.doctor.name}?` : "Delete doctor?"}
        description={
          <>
            This removes the doctor from your saved providers. This cannot be undone.
            {listErrorMessage ? (
              <span className="mt-2 block text-destructive">{listErrorMessage}</span>
            ) : null}
          </>
        }
        confirmLabel="Delete"
        loading={isRemoving}
        onConfirm={confirmDelete}
      />
    </SectionPanel>
  );
}

function ProvidersView({
  closeClinics,
  closeDoctors,
}: {
  closeClinics: () => void;
  closeDoctors: () => void;
}) {
  const [tab, setTab] = useState<ProviderTab>("clinics");
  const contentRef = useRef<HTMLDivElement>(null);
  const skipEntrance = useRef(true);
  const { pagination: clinicPagination, isSuccess: clinicsReady } =
    useClinicsContext();
  const { pagination: doctorPagination, isSuccess: doctorsReady } =
    useDoctorsContext();

  useGSAP(
    () => {
      const panel = contentRef.current;
      if (!panel) return;

      if (skipEntrance.current) {
        skipEntrance.current = false;
        gsap.set(panel, { opacity: 1, x: 0 });
        return;
      }

      const fromX = tab === "doctors" ? 28 : -28;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(panel, { opacity: 1, x: 0 });
      });
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          panel,
          { opacity: 0, x: fromX },
          { opacity: 1, x: 0, duration: 0.34, ease: "power2.out" },
        );
      });
      return () => mm.revert();
    },
    { scope: contentRef, dependencies: [tab], revertOnUpdate: false },
  );

  function selectTab(next: ProviderTab) {
    if (next === tab) return;
    if (next === "clinics") closeDoctors();
    else closeClinics();
    setTab(next);
  }

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Care network"
        title="Providers"
        description="Switch between the clinics and doctors you keep on file."
        icon={Stethoscope}
      />

      <ProviderTabSwitch
        value={tab}
        onChange={selectTab}
        clinicCount={clinicsReady ? (clinicPagination?.totalCount ?? 0) : null}
        doctorCount={doctorsReady ? (doctorPagination?.totalCount ?? 0) : null}
      />

      <div
        ref={contentRef}
        id={tab === "clinics" ? "providers-panel-clinics" : "providers-panel-doctors"}
        role="tabpanel"
        aria-labelledby={
          tab === "clinics" ? "providers-tab-clinics" : "providers-tab-doctors"
        }
      >
        {tab === "clinics" ? <ClinicsSection /> : <DoctorsSection />}
      </div>
    </div>
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
        <ProvidersView
          closeClinics={() => clinicsCloseRef.current?.()}
          closeDoctors={() => doctorsCloseRef.current?.()}
        />
      </DoctorsProvider>
    </ClinicsProvider>
  );
}

export function Providers() {
  return <ProvidersContent />;
}
