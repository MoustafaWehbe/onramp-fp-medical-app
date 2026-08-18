import { useRef, useState, type KeyboardEvent } from "react";
import { Activity, ClipboardList, HeartPulse, Plus } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
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
  ConditionsProvider,
  useConditionsContext,
} from "../../providers/ConditionsProvider";
import {
  SymptomsProvider,
  useSymptomsContext,
} from "../../providers/SymptomsProvider";
import { cn } from "../../lib/utils";
import type { UserCondition, UserSymptom } from "../../lib/health/health-export";

type ProfileTab = "conditions" | "symptoms";

interface ProfileTabSwitchProps {
  value: ProfileTab;
  onChange: (tab: ProfileTab) => void;
  conditionCount: number | null;
  symptomCount: number | null;
}

function ProfileTabSwitch({
  value,
  onChange,
  conditionCount,
  symptomCount,
}: ProfileTabSwitchProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const conditionsRef = useRef<HTMLButtonElement>(null);
  const symptomsRef = useRef<HTMLButtonElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const pill = pillRef.current;
      const active = value === "conditions" ? conditionsRef.current : symptomsRef.current;
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
    const next: ProfileTab = value === "conditions" ? "symptoms" : "conditions";
    onChange(next);
    requestAnimationFrame(() => {
      (next === "conditions" ? conditionsRef : symptomsRef).current?.focus();
    });
  }

  return (
    <div
      ref={rootRef}
      role="tablist"
      aria-label="Health profile sections"
      className="relative grid grid-cols-2 rounded-2xl border border-border/70 bg-muted/70 p-1.5 shadow-soft"
      onKeyDown={handleTabListKeyDown}
    >
      <span
        ref={pillRef}
        className="pointer-events-none absolute left-0 top-0 z-0 h-12 w-1/2 rounded-xl bg-card shadow-glow"
        aria-hidden
      />
      <button
        ref={conditionsRef}
        type="button"
        role="tab"
        id="profile-tab-conditions"
        aria-controls={value === "conditions" ? "profile-panel-conditions" : undefined}
        aria-selected={value === "conditions"}
        tabIndex={value === "conditions" ? 0 : -1}
        className={cn(
          "relative z-10 flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors",
          value === "conditions" ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        )}
        onClick={() => onChange("conditions")}
      >
        <HeartPulse className="h-4 w-4" aria-hidden />
        Conditions
        {conditionCount != null && (
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs tabular-nums">
            {conditionCount}
          </span>
        )}
      </button>
      <button
        ref={symptomsRef}
        type="button"
        role="tab"
        id="profile-tab-symptoms"
        aria-controls={value === "symptoms" ? "profile-panel-symptoms" : undefined}
        aria-selected={value === "symptoms"}
        tabIndex={value === "symptoms" ? 0 : -1}
        className={cn(
          "relative z-10 flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors",
          value === "symptoms" ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        )}
        onClick={() => onChange("symptoms")}
      >
        <Activity className="h-4 w-4" aria-hidden />
        Symptoms
        {symptomCount != null && (
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs tabular-nums">
            {symptomCount}
          </span>
        )}
      </button>
    </div>
  );
}

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
    closePanel,
    remove,
  } = useConditionsContext();

  const [pendingDelete, setPendingDelete] = useState<UserCondition | null>(null);
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
      title="Conditions"
      description="Track diagnosed conditions, status, and notes."
      icon={HeartPulse}
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
            <HeartPulse className="h-6 w-6" aria-hidden />
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
              <ConditionCard
                condition={cond}
                onDelete={() => setPendingDelete(cond)}
              />
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

      <ConfirmDialog
        open={pendingDelete != null}
        onOpenChange={(open) => {
          if (!open && !isRemoving) setPendingDelete(null);
        }}
        title={pendingDelete ? `Delete ${pendingDelete.condition.name}?` : "Delete condition?"}
        description={
          <>
            This removes the condition from your health profile. This cannot be undone.
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

  const [pendingDelete, setPendingDelete] = useState<UserSymptom | null>(null);
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
              <SymptomCard
                symptom={sym}
                onDelete={() => setPendingDelete(sym)}
              />
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
      >
        {formError && (
          <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </p>
        )}

        {panel.kind === "detail" && <SymptomDetail />}
        {panel.kind === "create" && <SymptomForm />}
      </AsidePanel>

      <ConfirmDialog
        open={pendingDelete != null}
        onOpenChange={(open) => {
          if (!open && !isRemoving) setPendingDelete(null);
        }}
        title={pendingDelete ? `Delete ${pendingDelete.catalog.name}?` : "Delete symptom?"}
        description={
          <>
            This removes the symptom from your health profile. This cannot be undone.
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

function HealthProfileView({
  closeConditions,
  closeSymptoms,
}: {
  closeConditions: () => void;
  closeSymptoms: () => void;
}) {
  const [tab, setTab] = useState<ProfileTab>("conditions");
  const contentRef = useRef<HTMLDivElement>(null);
  const skipEntrance = useRef(true);
  const { pagination: conditionPagination, isSuccess: conditionsReady } =
    useConditionsContext();
  const { pagination: symptomPagination, isSuccess: symptomsReady } =
    useSymptomsContext();

  useGSAP(
    () => {
      const panel = contentRef.current;
      if (!panel) return;

      if (skipEntrance.current) {
        skipEntrance.current = false;
        gsap.set(panel, { opacity: 1, x: 0 });
        return;
      }

      const fromX = tab === "symptoms" ? 28 : -28;
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

  function selectTab(next: ProfileTab) {
    if (next === tab) return;
    if (next === "conditions") closeSymptoms();
    else closeConditions();
    setTab(next);
  }

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Clinical profile"
        title="Health Profile"
        description="Switch between the conditions and symptoms you track."
        icon={Activity}
      />

      <ProfileTabSwitch
        value={tab}
        onChange={selectTab}
        conditionCount={conditionsReady ? (conditionPagination?.totalCount ?? 0) : null}
        symptomCount={symptomsReady ? (symptomPagination?.totalCount ?? 0) : null}
      />

      <div
        ref={contentRef}
        id={tab === "conditions" ? "profile-panel-conditions" : "profile-panel-symptoms"}
        role="tabpanel"
        aria-labelledby={
          tab === "conditions" ? "profile-tab-conditions" : "profile-tab-symptoms"
        }
      >
        {tab === "conditions" ? <ConditionsSection /> : <SymptomsSection />}
      </div>
    </div>
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
        <HealthProfileView
          closeConditions={() => conditionsCloseRef.current?.()}
          closeSymptoms={() => symptomsCloseRef.current?.()}
        />
      </SymptomsProvider>
    </ConditionsProvider>
  );
}

export function HealthProfile() {
  return <HealthProfileContent />;
}
