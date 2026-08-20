import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Activity,
  CalendarDays,
  Eye,
  FileText,
  NotebookPen,
  Pencil,
  Plus,
  Stethoscope,
  Trash2,
  X,
} from "lucide-react";
import {
  formatConditionStatus,
  type UserCondition,
} from "../../../lib/health/health-export";
import { cn, formatDate } from "../../../lib/utils";
import { useConditionsContext } from "../../../providers/ConditionsProvider";
import { RowActionsMenu } from "../../shared/RowActionsMenu";
import { Button } from "../../ui/button";

interface ConditionCardProps {
  condition: UserCondition;
  onDelete: () => void;
}

const statusColors: Record<string, string> = {
  active: "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-white",
  inactive: "bg-slate-500 text-white dark:bg-slate-600 dark:text-white",
  resolved: "bg-blue-600 text-white dark:bg-blue-500 dark:text-white",
};

export function ConditionCard({ condition, onDelete }: ConditionCardProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "ar" ? "ar-EG" : "en-US";
  const {
    selectedId,
    openDetail,
    openEdit,
    linkedSymptomsByConditionId,
  } = useConditionsContext();
  const selected = selectedId === condition.id;
  const { name } = condition.condition;
  const linkedSymptoms = linkedSymptomsByConditionId[condition.id] ?? [];
  const statusLabel = t(`health.conditions.status${condition.status.charAt(0).toUpperCase()}${condition.status.slice(1)}`);

  return (
    <article
      className={cn(
        "group flex items-start gap-1 rounded-2xl border border-border/80 bg-card p-2 pl-4 shadow-soft transition-[border-color,box-shadow,transform] duration-200",
        "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lift",
        selected && "border-primary ring-2 ring-primary/20",
      )}
    >
      <button
        type="button"
        onClick={() => openDetail(condition)}
        aria-label={t("health.profile.viewItem", { name })}
        className="flex min-w-0 flex-1 cursor-pointer gap-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
          <Activity className="h-5 w-5" aria-hidden />
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="truncate font-semibold leading-tight tracking-tight">
              {name}
            </h3>
            <span
              className={cn(
                "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
                statusColors[condition.status] ?? statusColors.active,
              )}
            >
              {statusLabel || formatConditionStatus(condition.status)}
            </span>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
            {condition.diagnosedDate && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <time dateTime={condition.diagnosedDate}>
                  {formatDate(condition.diagnosedDate, locale)}
                </time>
              </span>
            )}
          </div>

          {condition.description && (
            <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
              <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="line-clamp-2">{condition.description}</span>
            </p>
          )}

          {condition.notes && (
            <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
              <NotebookPen
                className="mt-0.5 h-3.5 w-3.5 shrink-0"
                aria-hidden
              />
              <span className="line-clamp-2">{condition.notes}</span>
            </p>
          )}

          {linkedSymptoms.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {linkedSymptoms.map((link) => (
                <span
                  key={link.id}
                  className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
                >
                  <Stethoscope className="h-3 w-3 shrink-0" aria-hidden />
                  {link.userSymptom.catalog.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </button>

      <RowActionsMenu
        label={t("health.profile.actionsFor", { name })}
        actions={[
          {
            id: "view",
            label: t("health.profile.view"),
            icon: Eye,
            onSelect: () => openDetail(condition),
          },
          {
            id: "edit",
            label: t("health.profile.edit"),
            icon: Pencil,
            onSelect: () => openEdit(condition),
          },
          {
            id: "delete",
            label: t("health.profile.delete"),
            icon: Trash2,
            variant: "destructive",
            onSelect: onDelete,
          },
        ]}
      />
    </article>
  );
}

export function ConditionDetail() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "ar" ? "ar-EG" : "en-US";
  const {
    panel,
    linkedSymptomsByConditionId,
    profileSymptoms,
    isLinkingSymptom,
    isUnlinkingSymptom,
    linkSymptom,
    unlinkSymptom,
  } = useConditionsContext();
  const [selectedSymptomId, setSelectedSymptomId] = useState("");

  if (panel.kind !== "detail") return null;

  const condition = panel.condition;
  const { name } = condition.condition;
  const linkedSymptoms = linkedSymptomsByConditionId[condition.id] ?? [];
  const linkedSymptomIds = new Set(
    linkedSymptoms.map((link) => link.userSymptomId),
  );
  const availableSymptoms = profileSymptoms.filter(
    (symptom) => !linkedSymptomIds.has(symptom.id),
  );

  const rows = [
    {
      icon: Activity,
      label: t("health.conditions.status"),
      value: t(`health.conditions.status${condition.status.charAt(0).toUpperCase()}${condition.status.slice(1)}`) || formatConditionStatus(condition.status),
    },
    condition.diagnosedDate
      ? {
          icon: CalendarDays,
          label: t("health.conditions.diagnosed"),
          value: formatDate(condition.diagnosedDate, locale),
        }
      : null,
    condition.description
      ? { icon: FileText, label: t("health.conditions.description"), value: condition.description }
      : null,
    condition.notes
      ? { icon: NotebookPen, label: t("health.conditions.notes"), value: condition.notes }
      : null,
  ].filter(Boolean) as Array<{
    icon: typeof Activity;
    label: string;
    value: string;
  }>;

  async function handleLink() {
    if (!selectedSymptomId) return;
    try {
      await linkSymptom(condition.id, selectedSymptomId);
      setSelectedSymptomId("");
    } catch {
      // formError is set by the provider
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Activity className="h-6 w-6" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold leading-tight">{name}</p>
          <p className="text-sm text-muted-foreground">{t("health.conditions.tracked")}</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t("health.conditions.noDetails")}
        </p>
      ) : (
        <dl className="space-y-3">
          {rows.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex gap-3 rounded-lg border bg-muted/30 px-3 py-2.5"
            >
              <Icon
                className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <div className="min-w-0">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {label}
                </dt>
                <dd className="mt-0.5 text-sm">{value}</dd>
              </div>
            </div>
          ))}
        </dl>
      )}

      <div className="space-y-3 border-t pt-4">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-muted-foreground" aria-hidden />
          <h4 className="text-sm font-semibold">{t("health.conditions.linkedSymptoms")}</h4>
        </div>

        {linkedSymptoms.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("health.conditions.noLinkedSymptoms")}
          </p>
        ) : (
          <ul className="space-y-2">
            {linkedSymptoms.map((link) => (
              <li
                key={link.id}
                className="flex items-center justify-between gap-2 rounded-lg border bg-muted/30 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {link.userSymptom.catalog.name}
                  </p>
                  {link.userSymptom.catalog.category && (
                    <p className="text-xs text-muted-foreground">
                      {link.userSymptom.catalog.category}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                  disabled={isUnlinkingSymptom}
                  aria-label={t("health.conditions.unlink", { name: link.userSymptom.catalog.name })}
                  onClick={() =>
                    void unlinkSymptom(condition.id, link.userSymptomId)
                  }
                >
                  <X className="h-4 w-4" aria-hidden />
                </Button>
              </li>
            ))}
          </ul>
        )}

        {profileSymptoms.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("health.conditions.addSymptomsFirst")}
          </p>
        ) : availableSymptoms.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("health.conditions.allSymptomsLinked")}
          </p>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <select
              className="flex h-11 w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-base shadow-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
              value={selectedSymptomId}
              onChange={(event) => setSelectedSymptomId(event.target.value)}
              disabled={isLinkingSymptom}
              aria-label={t("health.conditions.selectSymptom")}
            >
              <option value="">{t("health.conditions.selectSymptomOption")}</option>
              {availableSymptoms.map((symptom) => (
                <option key={symptom.id} value={symptom.id}>
                  {symptom.catalog.name}
                  {symptom.catalog.category
                    ? ` (${symptom.catalog.category})`
                    : ""}
                </option>
              ))}
            </select>
            <Button
              type="button"
              className="shrink-0"
              disabled={!selectedSymptomId || isLinkingSymptom}
              onClick={() => void handleLink()}
            >
              <Plus className="mr-1.5 h-4 w-4" aria-hidden />
              {t("health.conditions.link")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
