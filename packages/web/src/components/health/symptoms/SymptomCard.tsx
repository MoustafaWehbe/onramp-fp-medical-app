import { Activity, Eye, Tag, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { UserSymptom } from "../../../lib/health/health-export";
import { cn } from "../../../lib/utils";
import { useSymptomsContext } from "../../../providers/SymptomsProvider";
import { RowActionsMenu } from "../../shared/RowActionsMenu";

interface SymptomCardProps {
  symptom: UserSymptom;
  onDelete: () => void;
}

export function SymptomCard({ symptom, onDelete }: SymptomCardProps) {
  const { t } = useTranslation();
  const { selectedId, openDetail } = useSymptomsContext();
  const selected = selectedId === symptom.id;
  const { name, category } = symptom.catalog;

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
        onClick={() => openDetail(symptom)}
        aria-label={t("health.symptoms.viewItem", { name })}
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
            {category && (
              <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                <Tag className="h-3 w-3" aria-hidden />
                {category}
              </span>
            )}
          </div>
        </div>
      </button>

      <RowActionsMenu
        label={t("health.symptoms.actionsFor", { name })}
        actions={[
          {
            id: "view",
            label: t("health.symptoms.viewItem", { name }),
            icon: Eye,
            onSelect: () => openDetail(symptom),
          },
          {
            id: "delete",
            label: t("health.symptoms.delete"),
            icon: Trash2,
            variant: "destructive",
            onSelect: onDelete,
          },
        ]}
      />
    </article>
  );
}

export function SymptomDetail() {
  const { t } = useTranslation();
  const { panel } = useSymptomsContext();
  if (panel.kind !== "detail") return null;

  const symptom = panel.symptom;
  const { name, category } = symptom.catalog;

  const rows = [
    category
      ? { icon: Tag, label: t("health.symptoms.category"), value: category }
      : null,
  ].filter(Boolean) as Array<{
    icon: typeof Activity;
    label: string;
    value: string;
  }>;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Activity className="h-6 w-6" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold leading-tight">{name}</p>
          <p className="text-sm text-muted-foreground">{t("health.symptoms.tracked")}</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t("health.symptoms.noDetails")}
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
    </div>
  );
}
