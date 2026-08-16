import type { ZodTypeAny } from "zod";

export function parseComposer<T>(schema: ZodTypeAny, value: T) {
  const result = schema.safeParse(value);

  if (result.success) {
    return {
      success: true as const,
      data: result.data as T,
      errors: {} as Record<string, string>,
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
    success: false as const,
    data: value,
    errors,
  };
}
