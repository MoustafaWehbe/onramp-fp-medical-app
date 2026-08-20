import { UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { SectionPanel } from "../shared/SectionPanel";

export function AccountPanel() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  return (
    <SectionPanel
      title={t("settings.account.title")}
      description={t("settings.account.description")}
      icon={UserRound}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground shadow-glow">
          {initials}
        </div>
        <dl className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("settings.account.name")}
            </dt>
            <dd className="mt-0.5 truncate text-sm font-semibold">{user?.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("settings.account.email")}
            </dt>
            <dd className="mt-0.5 truncate text-sm font-semibold">{user?.email}</dd>
          </div>
        </dl>
      </div>
    </SectionPanel>
  );
}
