import { ClipboardList, Pill, Plus } from "lucide-react";
import {
  MedicationCard,
  MedicationDetail,
} from "../../components/health/medications/MedicationCard";
import { MedicationForm } from "../../components/health/medications/MedicationForm";
import { AsidePanel } from "../../components/shared/AsidePanel";
import { LoadingSpinner } from "../../components/shared/LoadingSpinner";
import {
  Pagination,
  paginationFromApi,
} from "../../components/shared/Pagination";
import { Button } from "../../components/ui/button";
import { PageHeader } from "../../components/shared/PageHeader";
import { SectionPanel } from "../../components/shared/SectionPanel";
import {
  MedicationsProvider,
  useMedicationsContext,
} from "../../providers/MedicationsProvider";

function MedicationsView() {
  const {
    medications,
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
  } = useMedicationsContext();

  const totalCount = pagination?.totalCount ?? 0;

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Personal registry"
        title="Medications"
        description="Keep dosages, schedules, and notes organized in one reliable record."
        icon={Pill}
        badge={isSuccess ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-secondary/80 px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
            <ClipboardList className="h-3.5 w-3.5" aria-hidden />
            {totalCount} {totalCount === 1 ? "medication" : "medications"}
          </span>
        ) : undefined}
        action={(
          <Button type="button" className="w-full sm:w-auto" onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" aria-hidden />
            Add medication
          </Button>
        )}
      />

      {listErrorMessage && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {listErrorMessage}
        </p>
      )}

      <SectionPanel
        title="Medication list"
        description="Select a medication to view or update its details."
        icon={ClipboardList}
        contentClassName="min-h-48"
      >
        {isLoading && (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        )}

        {isSuccess && medications.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 px-6 py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Pill className="h-6 w-6" aria-hidden />
          </div>
          <p className="font-medium">No medications yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Add a medication to build your registry. Search the catalog or
            OpenFDA when you type.
          </p>
          <Button type="button" className="mt-4" onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add medication
          </Button>
        </div>
      )}

        {isSuccess && medications.length > 0 && (
        <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {medications.map((med) => (
            <li key={med.id} className="min-h-0">
              <MedicationCard medication={med} />
            </li>
          ))}
        </ul>
      )}

        {isError && !listErrorMessage && (
        <p className="text-sm text-destructive">Failed to load medications</p>
      )}

        {isSuccess && pagination && (
        <div className="mt-5">
        <Pagination
          {...paginationFromApi(pagination)}
          onNext={goToNextPage}
          onPrev={goToPrevPage}
          onPageChange={goToPage}
        />
        </div>
      )}
      </SectionPanel>

      <AsidePanel
        open={panelOpen}
        onClose={closePanel}
        title={panelTitle}
        onEdit={
          panel.kind === "detail"
            ? () => openEdit(panel.medication)
            : undefined
        }
        onDelete={
          panel.kind === "detail"
            ? () => void remove(panel.medication.id)
            : undefined
        }
        deleteDisabled={isRemoving}
      >
        {formError && (
          <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </p>
        )}

        {panel.kind === "detail" && <MedicationDetail />}
        {(panel.kind === "create" || panel.kind === "edit") && (
          <MedicationForm />
        )}
      </AsidePanel>
    </div>
  );
}

export function Medications() {
  return (
    <MedicationsProvider>
      <MedicationsView />
    </MedicationsProvider>
  );
}
