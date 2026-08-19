import { SlidersHorizontal } from "lucide-react";
import { PageHeader } from "../../components/shared/PageHeader";
import { AccountPanel } from "../../components/settings/AccountPanel";
import { AppearancePanel } from "../../components/settings/AppearancePanel";
import { DangerZonePanel } from "../../components/settings/DangerZonePanel";
import { RemindersPanel } from "../../components/settings/RemindersPanel";
import { SecurityPanel } from "../../components/settings/SecurityPanel";
import { SettingsProvider } from "../../providers/SettingsProvider";
import { LanguagePanel } from "../../components/settings/LanguagePanel";
import { useTranslation } from "react-i18next";

function SettingsView() {
  const { t } = useTranslation();
  return (
    <div className="page-shell">
      <PageHeader
        eyebrow={t("settings.eyebrow")}
        title={t("settings.title")}
        description={t("settings.description")}
        icon={SlidersHorizontal}
      />

      <AccountPanel />
      <SecurityPanel />
      <AppearancePanel />
      <LanguagePanel />
      <RemindersPanel />
      <DangerZonePanel />
    </div>
  );
}

export function Settings() {
  return (
    <SettingsProvider>
      <SettingsView />
    </SettingsProvider>
  );
}
