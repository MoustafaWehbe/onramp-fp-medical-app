import { SlidersHorizontal } from "lucide-react";
import { PageHeader } from "../../components/shared/PageHeader";
import { AccountPanel } from "../../components/settings/AccountPanel";
import { AppearancePanel } from "../../components/settings/AppearancePanel";
import { DangerZonePanel } from "../../components/settings/DangerZonePanel";
import { RemindersPanel } from "../../components/settings/RemindersPanel";
import { SecurityPanel } from "../../components/settings/SecurityPanel";
import { SettingsProvider } from "../../providers/SettingsProvider";

function SettingsView() {
  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Account preferences"
        title="Settings"
        description="Manage your profile, security, reminders, and appearance."
        icon={SlidersHorizontal}
      />

      <AccountPanel />
      <SecurityPanel />
      <AppearancePanel />
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
