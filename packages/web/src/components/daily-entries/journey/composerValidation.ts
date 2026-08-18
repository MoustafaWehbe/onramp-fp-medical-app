import type { z } from "zod";

export function parseComposer<S extends z.ZodTypeAny>(
  schema: S,
  value: unknown,
):
  | { success: true; data: z.infer<S>; errors: Record<string, string> }
  | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(value);

  if (result.success) {
    return {
      success: true,
      data: result.data,
      errors: {},
    };
  }

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !errors[key]) {
      errors[key] = issue.message;
    }
  }

  return {
    success: false,
    errors,
  };
}
