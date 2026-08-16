import { useRef } from "react";
import { Activity, ClipboardList, Plus } from "lucide-react";
import {
  ConditionCard,
  ConditionDetail,
} from "../../components/health/conditions/ConditionCard";
import { ConditionForm } from "../../components/health/conditions/ConditionForm";
import {
  SymptomCard,
  SymptomDetail,
} from "../../components/health/symptoms/SymptomCard";
import { SymptomForm } from "../../components/health/symptoms/SymptomForm";
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
  ConditionsProvider,
  useConditionsContext,
} from "../../providers/ConditionsProvider";
import {
  SymptomsProvider,
  useSymptomsContext,
} from "../../providers/SymptomsProvider";

function ConditionsSection() {
  const {
    conditions,
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
  } = useConditionsContext();

  const totalCount = pagination?.totalCount ?? 0;

  return (
    <SectionPanel
      title="Conditions"
      description="Track diagnosed conditions, status, and notes."
      icon={Activity}
      action={(
        <div className="flex flex-wrap items-center gap-2">
          {isSuccess && (
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-secondary/80 px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
              <ClipboardList className="h-3.5 w-3.5" aria-hidden />
              {totalCount} {totalCount === 1 ? "condition" : "conditions"}
            </span>
          )}
          <Button type="button" className="w-full sm:w-auto" onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add condition
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

      {isSuccess && conditions.length === 0 && (
        <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Activity className="h-6 w-6" aria-hidden />
          </div>
          <p className="font-medium">No conditions yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Add a condition to track its status and details. Search the catalog
            or NLM when you type.
          </p>
          <Button type="button" className="mt-4" onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add condition
          </Button>
        </div>
      )}

      {isSuccess && conditions.length > 0 && (
        <ul className="mt-4 grid grid-cols-1 gap-3">
          {conditions.map((cond) => (
            <li key={cond.id} className="min-h-0">
              <ConditionCard condition={cond} />
            </li>
          ))}
        </ul>
      )}

      {isError && !listErrorMessage && (
        <p className="mt-4 text-sm text-destructive">Failed to load conditions</p>
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
            ? () => openEdit(panel.condition)
            : undefined
        }
        onDelete={
          panel.kind === "detail"
            ? () => void remove(panel.condition.id)
            : undefined
        }
        deleteDisabled={isRemoving}
      >
        {formError && (
          <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </p>
        )}

        {panel.kind === "detail" && <ConditionDetail />}
        {(panel.kind === "create" || panel.kind === "edit") && (
          <ConditionForm />
        )}
      </AsidePanel>
    </SectionPanel>
  );
}

function SymptomsSection() {
  const {
    symptoms,
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
  } = useSymptomsContext();

  const totalCount = pagination?.totalCount ?? 0;

  return (
    <SectionPanel
      title="Symptoms"
      description="Track symptoms from the catalog or BioPortal (SNOMED)."
      icon={Activity}
      action={(
        <div className="flex flex-wrap items-center gap-2">
          {isSuccess && (
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-secondary/80 px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
              <ClipboardList className="h-3.5 w-3.5" aria-hidden />
              {totalCount} {totalCount === 1 ? "symptom" : "symptoms"}
            </span>
          )}
          <Button type="button" className="w-full sm:w-auto" onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add symptom
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

      {isSuccess && symptoms.length === 0 && (
        <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Activity className="h-6 w-6" aria-hidden />
          </div>
          <p className="font-medium">No symptoms yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Add a symptom to track. Search the catalog or BioPortal when you
            type.
          </p>
          <Button type="button" className="mt-4" onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add symptom
          </Button>
        </div>
      )}

      {isSuccess && symptoms.length > 0 && (
        <ul className="mt-4 grid grid-cols-1 gap-3">
          {symptoms.map((sym) => (
            <li key={sym.id} className="min-h-0">
              <SymptomCard symptom={sym} />
            </li>
          ))}
        </ul>
      )}

      {isError && !listErrorMessage && (
        <p className="mt-4 text-sm text-destructive">Failed to load symptoms</p>
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
        onDelete={
          panel.kind === "detail"
            ? () => void remove(panel.symptom.id)
            : undefined
        }
        deleteDisabled={isRemoving}
      >
        {formError && (
          <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </p>
        )}

        {panel.kind === "detail" && <SymptomDetail />}
        {panel.kind === "create" && <SymptomForm />}
      </AsidePanel>
    </SectionPanel>
  );
}

function HealthProfileContent() {
  const symptomsCloseRef = useRef<(() => void) | null>(null);
  const conditionsCloseRef = useRef<(() => void) | null>(null);

  return (
    <ConditionsProvider
      onActivate={() => symptomsCloseRef.current?.()}
      panelCloseRef={conditionsCloseRef}
    >
      <SymptomsProvider
        onActivate={() => conditionsCloseRef.current?.()}
        panelCloseRef={symptomsCloseRef}
      >
        <div className="page-shell">
          <PageHeader
            eyebrow="Clinical profile"
            title="Health Profile"
            description="Build a clear, connected view of the conditions and symptoms you track."
            icon={Activity}
          />

          <div className="grid items-start gap-5 xl:grid-cols-2">
            <ConditionsSection />
            <SymptomsSection />
          </div>
        </div>
      </SymptomsProvider>
    </ConditionsProvider>
  );
}

export function HealthProfile() {
  return <HealthProfileContent />;
}
