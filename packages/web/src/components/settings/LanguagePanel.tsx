import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SectionPanel } from "../shared/SectionPanel";
import { cn } from "../../lib/utils";
import { useReminderSettings, useUpdateReminderSettings } from "../../hooks/useSettings";

export function LanguagePanel() {
  const { t, i18n } = useTranslation();

  const currentLanguage = i18n.language;
  const reminderSettingsQuery = useReminderSettings();
  const updateReminderSettings = useUpdateReminderSettings();

  const changeLanguage = async (language: "en" | "ar") => {
    await i18n.changeLanguage(language);

    localStorage.setItem("healthtracker-language", language);

    const settings = reminderSettingsQuery.data?.data.data;
    if (settings) {
      await updateReminderSettings.mutateAsync({
        enabled: settings.enabled,
        reminderTime: settings.reminderTime,
        timezone: settings.timezone,
        language,
      });
    }
  };

  return (
    <SectionPanel
      title={t("language.title")}
      description={t("language.description")}
      icon={Languages}
    >
      <div
        role="group"
        aria-label={t("language.title")}
        className="grid grid-cols-2 gap-2 rounded-2xl border border-border/70 bg-muted/70 p-1.5"
      >
        <button
          type="button"
          aria-pressed={currentLanguage === "en"}
          onClick={() => changeLanguage("en")}
          className={cn(
            "min-h-11 rounded-xl text-sm font-semibold transition-colors",
            currentLanguage === "en"
              ? "bg-card text-foreground shadow-glow"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t("language.english")}
        </button>

        <button
          type="button"
          aria-pressed={currentLanguage === "ar"}
          onClick={() => changeLanguage("ar")}
          className={cn(
            "min-h-11 rounded-xl text-sm font-semibold transition-colors",
            currentLanguage === "ar"
              ? "bg-card text-foreground shadow-glow"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t("language.arabic")}
        </button>
      </div>
    </SectionPanel>
  );
}