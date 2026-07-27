import { z } from "zod";
import { CONDITION_STATUSES } from "./types";
import type { UserCondition } from "./types";

export const conditionFormSchema = z
  .object({
    nameQuery: z.string().min(1, "Select a condition"),
    conditionId: z
      .string()
      .uuid("Select a condition from the list")
      .optional(),
    onlineName: z.string().optional(),
    description: z.string().max(5000).optional(),
    diagnosedDate: z.string().optional(),
    status: z
      .enum(CONDITION_STATUSES)
      .default("active")
      .optional(),
    notes: z.string().max(5000).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.conditionId && !data.onlineName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select a condition from the suggestions",
        path: ["nameQuery"],
      });
    }

    const date = data.diagnosedDate?.trim();
    if (date) {
      const parsed = new Date(date);
      if (isNaN(parsed.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid date",
          path: ["diagnosedDate"],
        });
      }
    }
  });

export type ConditionFormValues = z.infer<typeof conditionFormSchema>;

export interface ConditionFormSubmitPayload {
  conditionId?: string;
  onlineName?: string;
  description?: string | null;
  diagnosedDate?: string | null;
  status?: (typeof CONDITION_STATUSES)[number];
  notes?: string | null;
}

export function emptyConditionFormValues(): ConditionFormValues {
  return {
    nameQuery: "",
    conditionId: undefined,
    onlineName: undefined,
    description: "",
    diagnosedDate: "",
    status: "active",
    notes: "",
  };
}

export function toConditionFormValues(
  initial?: UserCondition | null,
): ConditionFormValues {
  if (!initial) return emptyConditionFormValues();

  return {
    nameQuery: initial.condition.name,
    conditionId: initial.conditionId,
    onlineName: undefined,
    description: initial.description ?? "",
    diagnosedDate: initial.diagnosedDate ?? "",
    status: initial.status,
    notes: initial.notes ?? "",
  };
}

export function toConditionSubmitPayload(
  values: ConditionFormValues,
): ConditionFormSubmitPayload {
  return {
    conditionId: values.conditionId,
    onlineName: values.onlineName,
    description: values.description?.trim() ? values.description.trim() : null,
    diagnosedDate: values.diagnosedDate?.trim()
      ? values.diagnosedDate.trim()
      : null,
    status: values.status as (typeof CONDITION_STATUSES)[number],
    notes: values.notes?.trim() ? values.notes.trim() : null,
  };
}

export function formatConditionStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
