import { z } from "zod";

export const symptomFormSchema = z.object({
  nameQuery: z.string().min(1, "Select a symptom"),
  catalogId: z
    .string()
    .uuid("Select a symptom from the list")
    .optional(),
  onlineName: z.string().optional(),
}).superRefine((data, ctx) => {
  if (!data.catalogId && !data.onlineName) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Select a symptom from the suggestions",
      path: ["nameQuery"],
    });
  }
});

export type SymptomFormValues = z.infer<typeof symptomFormSchema>;

export interface SymptomFormSubmitPayload {
  catalogId?: string;
  onlineName?: string;
}

export function emptySymptomFormValues(): SymptomFormValues {
  return {
    nameQuery: "",
    catalogId: undefined,
    onlineName: undefined,
  };
}

export function toSymptomSubmitPayload(
  values: SymptomFormValues,
): SymptomFormSubmitPayload {
  return {
    catalogId: values.catalogId,
    onlineName: values.onlineName,
  };
}
