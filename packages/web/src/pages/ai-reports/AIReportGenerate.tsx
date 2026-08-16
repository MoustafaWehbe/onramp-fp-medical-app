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
import { PageHeader } from "../../components/shared/PageHeader";
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
      <div className="page-shell max-w-3xl">
        <PageHeader
          eyebrow="AI reports"
          title="Generating your report"
          description="This usually takes a few seconds."
          icon={Sparkles}
        />
        <Card>
          <CardContent className="pt-6">
            <AiGeneratingLoader />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-shell max-w-3xl">
      <div>
        <Link
          to="/ai-reports"
          className="mb-4 inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-muted-foreground transition hover:bg-secondary hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to reports
        </Link>

        <PageHeader
          eyebrow="AI reports"
          title="Generate report"
          description="Build a physician-ready summary from your health log for a date range."
          icon={Sparkles}
        />
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
            <div
              role="alert"
              className="mb-4 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
            >
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
