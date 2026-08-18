import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import {
  ArrowLeft,
  CalendarRange,
  ClipboardList,
  Pill,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { PageHeader } from "../../components/shared/PageHeader";
import { SectionPanel } from "../../components/shared/SectionPanel";
import { AiGeneratingLoader } from "../../components/ai-reports/AiGeneratingLoader";
import { useGenerateAiReport } from "../../hooks/useAIReports";

const DEFAULT_REPORT_TYPE = "physician_ready";

const isNotFutureDate = (date: string) =>
  date <= new Date().toLocaleDateString("en-CA");

const todayIso = () => new Date().toLocaleDateString("en-CA");

function daysAgoIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toLocaleDateString("en-CA");
}

function startOfMonthIso(): string {
  const date = new Date();
  date.setDate(1);
  return date.toLocaleDateString("en-CA");
}

const generateSchema = z
  .object({
    startDate: z
      .string()
      .min(1, "Start date is required")
      .refine(isNotFutureDate, {
        message: "Start date cannot be in the future",
      }),
    endDate: z
      .string()
      .min(1, "End date is required")
      .refine(isNotFutureDate, {
        message: "End date cannot be in the future",
      }),
  })
  .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: "Start date must be before or equal to end date",
    path: ["endDate"],
  });

type GenerateFormValues = z.infer<typeof generateSchema>;

const PRESETS = [
  { label: "Last 7 days", start: () => daysAgoIso(6), end: todayIso },
  { label: "Last 30 days", start: () => daysAgoIso(29), end: todayIso },
  { label: "This month", start: startOfMonthIso, end: todayIso },
] as const;

const INCLUDED = [
  {
    icon: ClipboardList,
    title: "Daily entries",
    description: "Mood, sleep, journal notes, and logged events",
  },
  {
    icon: Stethoscope,
    title: "Conditions & symptoms",
    description: "Active profile items tied to the selected window",
  },
  {
    icon: Pill,
    title: "Medications",
    description: "Active meds and adherence signals from your log",
  },
] as const;

function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const message = (error.response?.data as { error?: string } | undefined)
      ?.error;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Failed to generate AI report. Please try again.";
}

export function AIReportGenerate() {
  const navigate = useNavigate();
  const generate = useGenerateAiReport();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GenerateFormValues>({
    resolver: zodResolver(generateSchema),
    defaultValues: {
      startDate: daysAgoIso(29),
      endDate: todayIso(),
    },
  });

  const startDate = watch("startDate");
  const endDate = watch("endDate");

  async function onSubmit(values: GenerateFormValues) {
    try {
      const report = await generate.mutateAsync({
        ...values,
        reportType: DEFAULT_REPORT_TYPE,
      });
      void navigate(`/ai-reports/${report.id}`);
    } catch {
      // Error surfaced via generate.error below
    }
  }

  function applyPreset(preset: (typeof PRESETS)[number]) {
    setValue("startDate", preset.start(), {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue("endDate", preset.end(), {
      shouldValidate: true,
      shouldDirty: true,
    });
  }

  return (
    <div className="page-shell">
      <button
        type="button"
        className="inline-flex min-h-11 w-fit items-center gap-1 rounded-xl px-2 text-sm font-semibold text-muted-foreground transition hover:bg-secondary hover:text-foreground"
        onClick={() => navigate("/ai-reports")}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to reports
      </button>

      <PageHeader
        eyebrow="AI reports"
        title={generate.isPending ? "Generating your report" : "Generate report"}
        description={
          generate.isPending
            ? "This usually takes a few seconds."
            : "Build a physician-ready summary from your health log for a date range."
        }
        icon={Sparkles}
      />

      {generate.isPending ? (
        <SectionPanel title="Working" icon={Sparkles}>
          <AiGeneratingLoader />
        </SectionPanel>
      ) : (
        <>
          <SectionPanel
            title="Date range"
            description="Only entries and profile data in this window are used."
            icon={CalendarRange}
          >
            {generate.isError && (
              <p
                role="alert"
                className="mb-4 rounded-xl border border-destructive/20 bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
              >
                {getErrorMessage(generate.error)}
              </p>
            )}

            <form
              className="space-y-5"
              onSubmit={(event) => {
                void handleSubmit(onSubmit)(event);
              }}
            >
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((preset) => {
                  const isActive =
                    startDate === preset.start() && endDate === preset.end();
                  return (
                    <Button
                      key={preset.label}
                      type="button"
                      size="sm"
                      variant={isActive ? "default" : "outline"}
                      onClick={() => applyPreset(preset)}
                    >
                      {preset.label}
                    </Button>
                  );
                })}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    max={todayIso()}
                    {...register("startDate")}
                  />
                  {errors.startDate && (
                    <p className="text-sm text-destructive">
                      {errors.startDate.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    max={todayIso()}
                    {...register("endDate")}
                  />
                  {errors.endDate && (
                    <p className="text-sm text-destructive">
                      {errors.endDate.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/ai-reports")}
                >
                  Cancel
                </Button>
                <Button type="submit" className="gap-2">
                  <Sparkles className="h-4 w-4" aria-hidden />
                  Generate report
                </Button>
              </div>
            </form>
          </SectionPanel>

          <SectionPanel
            title="What gets included"
            description="The AI reviews this data and drafts a printable clinical overview."
            icon={ClipboardList}
          >
            <ul className="grid gap-3 sm:grid-cols-3">
              {INCLUDED.map(({ icon: Icon, title, description }) => (
                <li
                  key={title}
                  className="rounded-2xl border border-border/70 bg-muted/20 p-4"
                >
                  <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {description}
                  </p>
                </li>
              ))}
            </ul>
          </SectionPanel>
        </>
      )}
    </div>
  );
}
