import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface EmptyCatalogHintProps {
  to: string;
  actionLabel: string;
}

export function EmptyCatalogHint({ to, actionLabel }: EmptyCatalogHintProps) {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl border border-dashed bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground">
      <p>
        {t("dailyEntries.journey.composer.nothingToAdd")}{" "}
        <Link
          to={to}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {actionLabel}
        </Link>{" "}
        {t("dailyEntries.journey.composer.returnToFinish")}
      </p>
    </div>
  );
}
