import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bell } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  reminderSettingsSchema,
  timezoneLabels,
  timezoneOptions,
  type ReminderSettingsFormValues,
} from "../../lib/settings/settings-export";
import {
  useReminderSettings,
  useUpdateReminderSettings,
} from "../../hooks/useSettings";
import { cn } from "../../lib/utils";
import { SectionPanel } from "../shared/SectionPanel";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export function RemindersPanel() {
  const { t, i18n } = useTranslation();
  const reminderSettingsQuery = useReminderSettings();
  const updateReminderSettings = useUpdateReminderSettings();

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ReminderSettingsFormValues>({
    resolver: zodResolver(reminderSettingsSchema),
    defaultValues: {
      enabled: false,
      reminderTime: null,
      timezone: "UTC",
      language: i18n.language === "ar" ? "ar" : "en",
    },
  });

  const reminderEnabled = watch("enabled");

  useEffect(() => {
    const settings = reminderSettingsQuery.data?.data.data;
    if (!settings) return;
    reset({
      enabled: settings.enabled,
      reminderTime: settings.reminderTime?.slice(0, 5) ?? null,
      timezone: settings.timezone,
      language: settings.language ?? (i18n.language === "ar" ? "ar" : "en"),
    });
  }, [reminderSettingsQuery.data, reset, i18n.language]);

  async function onSubmit(values: ReminderSettingsFormValues) {
    try {
      await updateReminderSettings.mutateAsync({
        ...values,
        language: i18n.language === "ar" ? "ar" : "en",
      });
    } catch {
      // error shown below
    }
  }

  return (
    <SectionPanel
      title={t("settings.reminders.title")}
      description={t("settings.reminders.description")}
      icon={Bell}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{t("settings.reminders.dailyReminder")}</p>
            <p className="text-sm text-muted-foreground">
              {t("settings.reminders.dailyReminderDescription")}
            </p>
          </div>
          <Controller
            name="enabled"
            control={control}
            render={({ field }) => (
              <button
                type="button"
                role="switch"
                aria-checked={field.value}
                disabled={updateReminderSettings.isPending}
                className={cn(
                  "inline-flex min-h-11 w-full items-center justify-center rounded-xl px-4 text-sm font-semibold transition-colors sm:w-24",
                  field.value
                    ? "bg-primary text-primary-foreground"
                    : "border border-input bg-card text-muted-foreground hover:text-foreground",
                )}
                onClick={() => {
                  const next = !field.value;
                  field.onChange(next);
                  if (!next) {
                    setValue("reminderTime", null, { shouldValidate: true });
                  }
                }}
              >
                {field.value ? t("common.on") : t("common.off")}
              </button>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="reminder-time">{t("settings.reminders.reminderTime")}</Label>
            <Input
              id="reminder-time"
              type="time"
              disabled={!reminderEnabled || updateReminderSettings.isPending}
              {...register("reminderTime")}
            />
            {errors.reminderTime && (
              <p className="text-sm text-destructive">
                {errors.reminderTime.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder-timezone">{t("settings.reminders.timezone")}</Label>
            <select
              id="reminder-timezone"
              disabled={!reminderEnabled || updateReminderSettings.isPending}
              className="flex h-11 w-full cursor-pointer rounded-xl border border-input bg-card px-3.5 text-sm shadow-sm outline-none transition-[border-color,box-shadow] duration-200 hover:border-primary/40 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("timezone")}
            >
              {timezoneOptions.map((timezone) => (
                <option key={timezone} value={timezone}>
                  {timezoneLabels[timezone]}
                </option>
              ))}
            </select>
            {errors.timezone && (
              <p className="text-sm text-destructive">{errors.timezone.message}</p>
            )}
          </div>
        </div>

        {reminderSettingsQuery.isLoading && (
          <p className="text-sm text-muted-foreground">{t("settings.reminders.loading")}</p>
        )}
        {reminderSettingsQuery.isError && (
          <p role="alert" className="text-sm text-destructive">
            {t("settings.reminders.failedLoad")}
          </p>
        )}
        {updateReminderSettings.isError && (
          <p role="alert" className="text-sm text-destructive">
            {t("settings.reminders.failedUpdate")}
          </p>
        )}
        {updateReminderSettings.isSuccess && (
          <p className="text-sm font-medium text-primary">
            {t("settings.reminders.saved")}
          </p>
        )}

        <Button
          type="submit"
          disabled={
            reminderSettingsQuery.isLoading ||
            !reminderSettingsQuery.data ||
            updateReminderSettings.isPending
          }
        >
          {updateReminderSettings.isPending ? t("settings.reminders.saving") : t("settings.reminders.save")}
        </Button>
      </form>
    </SectionPanel>
  );
}
