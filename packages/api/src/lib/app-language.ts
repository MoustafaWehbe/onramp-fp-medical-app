import { isUsableArabicTranslation } from "./translation-quality";

export type AppLanguage = "en" | "ar";

export function parseAppLanguage(value: unknown): AppLanguage {
  if (typeof value !== "string") return "en";
  const normalized = value.trim().toLowerCase();
  if (normalized === "ar" || normalized.startsWith("ar-")) return "ar";
  return "en";
}

export function localizedText(
  language: AppLanguage,
  en: string | null | undefined,
  ar: string | null | undefined,
): string | null | undefined {
  if (language === "ar" && isUsableArabicTranslation(en, ar)) return ar;
  return en;
}

export function localizeDeep<T>(value: T, language: AppLanguage): T {
  if (Array.isArray(value)) {
    return value.map((item) => localizeDeep(item, language)) as T;
  }

  if (value instanceof Date || value === null || typeof value !== "object") {
    return value;
  }

  const maybeModel = value as unknown as { toJSON?: () => unknown };
  const source =
    typeof maybeModel.toJSON === "function"
      ? ((maybeModel.toJSON() as Record<string, unknown> | null | undefined) ??
        {})
      : (value as Record<string, unknown>);

  const result: Record<string, unknown> = {};

  for (const [key, nested] of Object.entries(source)) {
    if (key === "nameAr" || key === "categoryAr") {
      continue;
    }
    result[key] = localizeDeep(nested, language);
  }

  const isMedication = "strength" in source;
  if (!isMedication) {
    if ("name" in source) {
      result.name = localizedText(
        language,
        source.name as string | null | undefined,
        source.nameAr as string | null | undefined,
      );
    }
    if ("category" in source) {
      result.category = localizedText(
        language,
        source.category as string | null | undefined,
        source.categoryAr as string | null | undefined,
      );
    }
  }

  return result as T;
}
