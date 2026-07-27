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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Medications</h1>
            {isSuccess && (
              <span className="inline-flex items-center gap-1.5 rounded-full border bg-secondary/80 px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                <ClipboardList className="h-3.5 w-3.5" aria-hidden />
                {totalCount}{" "}
                {totalCount === 1 ? "medication" : "medications"}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Track dosage, frequency, and notes in your personal registry.
          </p>
        </div>
        <Button type="button" className="shrink-0 self-start sm:self-auto" onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add medication
        </Button>
      </div>

      {listErrorMessage && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {listErrorMessage}
        </p>
      )}

      {isLoading && (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      )}

      {isSuccess && medications.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-16 text-center">
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
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
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
        <Pagination
          {...paginationFromApi(pagination)}
          onNext={goToNextPage}
          onPrev={goToPrevPage}
          onPageChange={goToPage}
        />
      )}

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
