import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import {
  ArrowLeft,
  CalendarRange,
  ClipboardList,
  Pill,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
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

  if (generate.isPending) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Generating your report
          </h1>
          <p className="text-muted-foreground">
            This usually takes a few seconds.
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <AiGeneratingLoader />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          to="/ai-reports"
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to reports
        </Link>

        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Generate report
            </h1>
            <p className="mt-1 text-muted-foreground">
              Build a physician-ready summary from your health log for a date
              range.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarRange className="h-4 w-4 text-muted-foreground" />
            Date range
          </CardTitle>
          <CardDescription>
            Only entries and profile data in this window are used.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {generate.isError && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {getErrorMessage(generate.error)}
            </div>
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
                onClick={() => {
                  void navigate("/ai-reports");
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Generate report
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-dashed bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">What gets included</CardTitle>
          <CardDescription>
            The AI reviews this data and drafts a printable clinical overview.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {INCLUDED.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background text-primary shadow-sm ring-1 ring-border">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">{title}</p>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
